package com.paperpress.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Register your custom PDFPrinterPlugin BEFORE calling super
        registerPlugin(PDFPrinterPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
