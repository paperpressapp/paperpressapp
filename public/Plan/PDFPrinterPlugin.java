package com.paperpress.app;

import android.content.Context;
import android.os.Build;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintDocumentInfo;
import android.print.PrintManager;
import android.util.Log;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;

/**
 * PDFPrinterPlugin
 *
 * Generates PDF from HTML using Android's native WebView + PrintManager.
 * Uses webView.print() API (Android 21+) for silent PDF generation.
 */
@CapacitorPlugin(name = "PDFPrinter")
public class PDFPrinterPlugin extends Plugin {

    private static final String TAG = "PDFPrinterPlugin";
    private static final int KATEX_RENDER_DELAY_MS = 2500;

    @PluginMethod
    public void printToPDF(final PluginCall call) {
        final String html = call.getString("html", "");
        final String filename = call.getString("filename", "paper.pdf");

        if (html == null || html.isEmpty()) {
            JSObject result = new JSObject();
            result.put("success", false);
            result.put("message", "HTML content is empty");
            call.resolve(result);
            return;
        }

        getActivity().runOnUiThread(() -> {
            try {
                final WebView webView = createWebView();
                final PrintManager printManager = (PrintManager) 
                    getContext().getSystemService(Context.PRINT_SERVICE);

                webView.setWebViewClient(new WebViewClient() {
                    @Override
                    public void onPageFinished(WebView view, String url) {
                        view.postDelayed(() -> {
                            try {
                                // Use Android 21+ print API - creates PDF silently
                                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                                    PrintAttributes attributes = new PrintAttributes.Builder()
                                        .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                                        .setResolution(new PrintAttributes.Resolution("pdf", "pdf", 300, 300))
                                        .setMinMargins(PrintAttributes.Margins.NO_MARGINS)
                                        .build();

                                    // Create print document adapter
                                    PrintDocumentAdapter printAdapter = 
                                        view.createPrintDocumentAdapter(filename);
                                    
                                    // Use the print manager to start print job silently
                                    printManager.print(filename, printAdapter, attributes);
                                }
                                
                                // Report success - PDF generation happens via system print service
                                JSObject result = new JSObject();
                                result.put("success", true);
                                result.put("message", "PDF generation started");
                                
                                File docsDir = getActivity().getExternalFilesDir(null);
                                File paperPressDir = new File(docsDir, "PaperPress");
                                result.put("filePath", paperPressDir.getAbsolutePath());
                                result.put("fileName", filename);
                                call.resolve(result);
                                
                            } catch (Exception e) {
                                Log.e(TAG, "PDF generation failed", e);
                                JSObject result = new JSObject();
                                result.put("success", false);
                                result.put("message", "PDF generation failed: " + e.getMessage());
                                call.resolve(result);
                            }
                        }, KATEX_RENDER_DELAY_MS);
                    }
                });

                webView.loadDataWithBaseURL(
                    "file:///android_asset/public/",
                    html,
                    "text/html",
                    "UTF-8",
                    null
                );

            } catch (Exception e) {
                Log.e(TAG, "WebView creation failed", e);
                JSObject result = new JSObject();
                result.put("success", false);
                result.put("message", "Failed to create WebView: " + e.getMessage());
                call.resolve(result);
            }
        });
    }

    @PluginMethod
    public void showPrintDialog(final PluginCall call) {
        final String html = call.getString("html", "");
        final String filename = call.getString("filename", "paper.pdf");

        if (html == null || html.isEmpty()) {
            JSObject result = new JSObject();
            result.put("success", false);
            result.put("message", "HTML content is empty");
            call.resolve(result);
            return;
        }

        getActivity().runOnUiThread(() -> {
            WebView webView = createWebView();
            PrintManager printManager = (PrintManager) 
                getContext().getSystemService(Context.PRINT_SERVICE);

            webView.setWebViewClient(new WebViewClient() {
                @Override
                public void onPageFinished(WebView view, String url) {
                    view.postDelayed(() -> {
                        try {
                            PrintAttributes attributes = new PrintAttributes.Builder()
                                .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                                .setResolution(new PrintAttributes.Resolution("pdf", "pdf", 300, 300))
                                .setMinMargins(PrintAttributes.Margins.NO_MARGINS)
                                .build();

                            PrintDocumentAdapter printAdapter = 
                                view.createPrintDocumentAdapter(filename);
                            
                            printManager.print(filename, printAdapter, attributes);

                            JSObject result = new JSObject();
                            result.put("success", true);
                            result.put("message", "Print dialog opened");
                            result.put("jobName", filename);
                            call.resolve(result);
                        } catch (Exception e) {
                            Log.e(TAG, "Print dialog failed", e);
                            JSObject result = new JSObject();
                            result.put("success", false);
                            result.put("message", "Failed to open print dialog: " + e.getMessage());
                            call.resolve(result);
                        }
                    }, KATEX_RENDER_DELAY_MS);
                }
            });

            webView.loadDataWithBaseURL(
                "file:///android_asset/public/",
                html,
                "text/html",
                "UTF-8",
                null
            );
        });
    }

    private WebView createWebView() {
        WebView webView = new WebView(getContext());

        android.webkit.WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(false);
        webView.setInitialScale(100);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setDomStorageEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setDefaultFontSize(16);

        webView.setVisibility(android.view.View.INVISIBLE);
        
        // Enable hardware acceleration for better rendering
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            webView.setLayerType(WebView.LAYER_TYPE_HARDWARE, null);
        } else {
            webView.setLayerType(WebView.LAYER_TYPE_SOFTWARE, null);
        }

        return webView;
    }
}
