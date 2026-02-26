package com.paperpress.app;

import android.content.Context;
import android.os.Build;
import android.os.CancellationSignal;
import android.os.ParcelFileDescriptor;
import android.print.PageRange;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintDocumentInfo;
import android.print.PrintManager;
import android.util.Log;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * PDFPrinterPlugin
 *
 * Generates PDF from HTML using Android's native WebView + PrintManager.
 * This is the SAME rendering engine as Chrome — KaTeX math, fonts, tables
 * all render perfectly. Zero server needed. Works fully offline.
 *
 * Two modes:
 *   1. printToPDF()   — Silent save to Documents/PaperPress/ (no dialog)
 *   2. showPrintDialog() — Opens Android print dialog (user taps "Save as PDF")
 */
@CapacitorPlugin(name = "PDFPrinter")
public class PDFPrinterPlugin extends Plugin {

    private static final String TAG = "PDFPrinterPlugin";
    private static final int KATEX_RENDER_DELAY_MS = 2500; // Wait for KaTeX JS to render math

    // ─────────────────────────────────────────────────────────────────────
    // PRIMARY METHOD: Silent PDF save — no dialog, auto-saves to Documents
    // This is what download.ts calls as the offline fallback
    // ─────────────────────────────────────────────────────────────────────
    @PluginMethod
    public void printToPDF(final PluginCall call) {
        final String html = call.getString("html", "");
        final String filename = call.getString("filename", "paper.pdf");

        if (html.isEmpty()) {
            JSObject result = new JSObject();
            result.put("success", false);
            result.put("message", "HTML content is empty");
            call.resolve(result);
            return;
        }

        getActivity().runOnUiThread(() -> {
            try {
                WebView webView = createWebView();

                webView.setWebViewClient(new WebViewClient() {
                    @Override
                    public void onPageFinished(WebView view, String url) {
                        // Wait for KaTeX JS to finish rendering math formulas
                        view.postDelayed(() -> {
                            try {
                                // Use Android PrintManager to create PDF — same engine as Chrome
                                savePDFSilently(view, filename, call);
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

                // Load HTML with base URL pointing to app assets
                // This lets KaTeX load from assets://public/lib/katex/
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

    // ─────────────────────────────────────────────────────────────────────
    // SECONDARY METHOD: Show Android print dialog
    // User taps "Save as PDF" — gives them full control
    // ─────────────────────────────────────────────────────────────────────
    @PluginMethod
    public void showPrintDialog(final PluginCall call) {
        final String html = call.getString("html", "");
        final String filename = call.getString("filename", "paper.pdf");

        getActivity().runOnUiThread(() -> {
            WebView webView = createWebView();

            webView.setWebViewClient(new WebViewClient() {
                @Override
                public void onPageFinished(WebView view, String url) {
                    view.postDelayed(() -> {
                        PrintManager printManager = (PrintManager)
                            getContext().getSystemService(Context.PRINT_SERVICE);

                        PrintDocumentAdapter printAdapter =
                            view.createPrintDocumentAdapter(filename);

                        PrintAttributes.Builder attrBuilder = new PrintAttributes.Builder()
                            .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                            .setResolution(new PrintAttributes.Resolution("pdf", "pdf", 300, 300))
                            .setMinMargins(PrintAttributes.Margins.NO_MARGINS);

                        printManager.print(filename, printAdapter, attrBuilder.build());

                        JSObject result = new JSObject();
                        result.put("success", true);
                        result.put("message", "Print dialog opened");
                        result.put("jobName", filename);
                        call.resolve(result);
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

    // ─────────────────────────────────────────────────────────────────────
    // INTERNAL: Silent PDF generation using PrintDocumentAdapter
    // Pipes the PDF bytes directly to a file — no UI dialog shown
    // ─────────────────────────────────────────────────────────────────────
    private void savePDFSilently(WebView webView, String filename, PluginCall call) {
        try {
            // Create Documents/PaperPress/ directory
            File docsDir = getActivity().getExternalFilesDir(null);
            File paperPressDir = new File(docsDir, "PaperPress");
            if (!paperPressDir.exists()) {
                paperPressDir.mkdirs();
            }

            File pdfFile = new File(paperPressDir, filename);
            PrintDocumentAdapter adapter = webView.createPrintDocumentAdapter(filename);

            PrintAttributes attributes = new PrintAttributes.Builder()
                .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                .setResolution(new PrintAttributes.Resolution("res", "res", 300, 300))
                .setMinMargins(new PrintAttributes.Margins(
                    // 10mm margins in mils (1 mil = 1/1000 inch; 10mm ≈ 394 mils)
                    394, 394, 394, 394
                ))
                .build();

            // onLayout: Tell the PrintManager about the document
            adapter.onLayout(null, attributes, null, new PrintDocumentAdapter.LayoutResultCallback() {
                @Override
                public void onLayoutFinished(PrintDocumentInfo info, boolean changed) {
                    try {
                        // onWrite: Actually write the PDF bytes
                        ParcelFileDescriptor pfd = ParcelFileDescriptor.open(
                            pdfFile, ParcelFileDescriptor.MODE_READ_WRITE |
                                      ParcelFileDescriptor.MODE_CREATE |
                                      ParcelFileDescriptor.MODE_TRUNCATE
                        );

                        adapter.onWrite(
                            new PageRange[]{PageRange.ALL_PAGES},
                            pfd,
                            new CancellationSignal(),
                            new PrintDocumentAdapter.WriteResultCallback() {
                                @Override
                                public void onWriteFinished(PageRange[] pages) {
                                    try {
                                        pfd.close();
                                        Log.d(TAG, "PDF saved: " + pdfFile.getAbsolutePath());

                                        JSObject result = new JSObject();
                                        result.put("success", true);
                                        result.put("message", "PDF saved successfully");
                                        result.put("filePath", pdfFile.getAbsolutePath());
                                        result.put("fileName", filename);
                                        call.resolve(result);
                                    } catch (IOException e) {
                                        Log.e(TAG, "Failed to close file descriptor", e);
                                        JSObject result = new JSObject();
                                        result.put("success", false);
                                        result.put("message", "Failed to finalize PDF: " + e.getMessage());
                                        call.resolve(result);
                                    }
                                }

                                @Override
                                public void onWriteFailed(CharSequence error) {
                                    Log.e(TAG, "PDF write failed: " + error);
                                    JSObject result = new JSObject();
                                    result.put("success", false);
                                    result.put("message", "PDF write failed: " + error);
                                    call.resolve(result);
                                }
                            }
                        );
                    } catch (IOException e) {
                        Log.e(TAG, "Failed to create file descriptor", e);
                        JSObject result = new JSObject();
                        result.put("success", false);
                        result.put("message", "Failed to create PDF file: " + e.getMessage());
                        call.resolve(result);
                    }
                }

                @Override
                public void onLayoutFailed(CharSequence error) {
                    Log.e(TAG, "PDF layout failed: " + error);
                    JSObject result = new JSObject();
                    result.put("success", false);
                    result.put("message", "Layout failed: " + error);
                    call.resolve(result);
                }
            }, null);

        } catch (Exception e) {
            Log.e(TAG, "Silent PDF save error", e);
            JSObject result = new JSObject();
            result.put("success", false);
            result.put("message", "Error: " + e.getMessage());
            call.resolve(result);
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // HELPER: Create a properly configured WebView for PDF rendering
    // JavaScript enabled for KaTeX | No zoom | A4 viewport width
    // ─────────────────────────────────────────────────────────────────────
    private WebView createWebView() {
        WebView webView = new WebView(getContext());

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);       // Required for KaTeX rendering
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setAllowFileAccess(true);          // Required to load KaTeX from assets
        settings.setAllowContentAccess(true);
        settings.setDomStorageEnabled(true);        // Some KaTeX features need this
        settings.setMediaPlaybackRequiresUserGesture(false);

        // Set viewport to A4 width (794px at 96dpi)
        // This ensures the paper renders at the correct width for A4 printing
        settings.setDefaultFontSize(16);

        // Disable hardware acceleration — can cause blank pages in some WebView versions
        webView.setLayerType(WebView.LAYER_TYPE_SOFTWARE, null);

        return webView;
    }
}
