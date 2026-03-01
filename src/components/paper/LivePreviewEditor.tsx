"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Sliders, 
  Type, 
  Grid3X3, 
  AlignLeft,
  RotateCcw,
  Save, 
  Monitor,
  Smartphone,
  Tablet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { LayoutSettings } from "@/types/layout";
import { DEFAULT_LAYOUT_SETTINGS } from "@/types/layout";
import type { PaperTemplate } from "@/types/template";

interface LivePreviewEditorProps {
  template: PaperTemplate;
  layoutSettings: LayoutSettings;
  onLayoutChange: (settings: LayoutSettings) => void;
  onSaveAsTemplate?: () => void;
}

type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

export function LivePreviewEditor({
  template,
  layoutSettings,
  onLayoutChange,
  onSaveAsTemplate,
}: LivePreviewEditorProps) {
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [activeTab, setActiveTab] = useState("layout");
  const previewRef = useRef<HTMLDivElement>(null);
  
  // Get preview dimensions
  const getPreviewDimensions = () => {
    switch (previewDevice) {
      case 'desktop': return { width: 400, scale: 0.5 };
      case 'tablet': return { width: 300, scale: 0.38 };
      case 'mobile': return { width: 200, scale: 0.25 };
    }
  };

  const previewDims = getPreviewDimensions();

  // Reset to defaults
  const handleReset = () => {
    onLayoutChange(DEFAULT_LAYOUT_SETTINGS);
  };

  // Get logo size in pixels
  const getLogoSize = () => {
    switch (layoutSettings.logoSize) {
      case 'small': return 20;
      case 'medium': return 30;
      case 'large': return 45;
      case 'custom': return layoutSettings.customLogoSize || 30;
    }
  };

  // Get header padding
  const getHeaderPadding = () => {
    switch (layoutSettings.headerLayout) {
      case 'compact': return '4px';
      case 'normal': return '8px';
      case 'spacious': return '16px';
    }
  };

  // Get question spacing
  const getQuestionSpacing = () => {
    switch (layoutSettings.questionSpacing) {
      case 'compact': return '2px';
      case 'normal': return '6px';
      case 'spacious': return '12px';
    }
  };

  // Get border style
  const getBorderStyle = () => {
    switch (layoutSettings.borderStyle) {
      case 'none': return 'none';
      case 'thin': return '1px solid #ccc';
      case 'medium': return '2px solid #333';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Controls Panel */}
      <div className="lg:col-span-1 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Layout Settings</h3>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="layout">
              <Sliders className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="font">
              <Type className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="style">
              <Grid3X3 className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="options">
              <AlignLeft className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>

          {/* Layout Tab */}
          <TabsContent value="layout" className="space-y-4 mt-4">
            <div className="space-y-3">
              <Label>Header Layout</Label>
              <Select 
                value={layoutSettings.headerLayout}
                onValueChange={(v) => onLayoutChange({ ...layoutSettings, headerLayout: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="spacious">Spacious</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Logo Size</Label>
              <Select 
                value={layoutSettings.logoSize}
                onValueChange={(v) => onLayoutChange({ ...layoutSettings, logoSize: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (20px)</SelectItem>
                  <SelectItem value="medium">Medium (30px)</SelectItem>
                  <SelectItem value="large">Large (45px)</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              
              {layoutSettings.logoSize === 'custom' && (
                <div className="pt-2">
                  <Input
                    type="number"
                    value={layoutSettings.customLogoSize || 30}
                    onChange={(e) => onLayoutChange({ 
                      ...layoutSettings, 
                      customLogoSize: parseInt(e.target.value) || 30
                    })}
                    min={15}
                    max={80}
                    className="w-20"
                  />
                  <p className="text-xs text-gray-500 mt-1">{layoutSettings.customLogoSize || 30}px</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label>Question Spacing</Label>
              <Select 
                value={layoutSettings.questionSpacing}
                onValueChange={(v) => onLayoutChange({ ...layoutSettings, questionSpacing: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="spacious">Spacious</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Border Style</Label>
              <Select 
                value={layoutSettings.borderStyle}
                onValueChange={(v) => onLayoutChange({ ...layoutSettings, borderStyle: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Border</SelectItem>
                  <SelectItem value="thin">Thin</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* Font Tab */}
          <TabsContent value="font" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Font Size</Label>
                <span className="text-sm font-medium">{layoutSettings.fontSize}pt</span>
              </div>
              <Input
                type="number"
                value={layoutSettings.fontSize}
                onChange={(e) => onLayoutChange({ ...layoutSettings, fontSize: parseInt(e.target.value) || 12 })}
                min={8}
                max={18}
                className="w-20"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>8pt</span>
                <span>18pt</span>
              </div>
              
              {/* Font Preview */}
              <div 
                className="p-3 bg-white border rounded mt-2"
                style={{ fontSize: `${layoutSettings.fontSize}pt` }}
              >
                <p className="font-bold">Sample Question Text</p>
                <p>This is how your questions will appear in the paper.</p>
              </div>
            </div>
          </TabsContent>

          {/* Style Tab */}
          <TabsContent value="style" className="space-y-4 mt-4">
            <div className="space-y-3">
              <Label>MCQ Options Style</Label>
              <Select 
                value={layoutSettings.mcqStyle}
                onValueChange={(v) => onLayoutChange({ ...layoutSettings, mcqStyle: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inline">Inline (A) B) C) D)</SelectItem>
                  <SelectItem value="grid">Grid / Table</SelectItem>
                  <SelectItem value="letters_only">Letters Only (A B C D)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label>Show Watermark</Label>
              <Switch
                checked={layoutSettings.showWatermark}
                onCheckedChange={(v) => onLayoutChange({ ...layoutSettings, showWatermark: v })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Show Bubble Sheet</Label>
              <Switch
                checked={layoutSettings.showBubbleSheet}
                onCheckedChange={(v) => onLayoutChange({ ...layoutSettings, showBubbleSheet: v })}
              />
            </div>
          </TabsContent>

          {/* Options Tab */}
          <TabsContent value="options" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <Label>Show Answer Lines</Label>
              <Switch
                checked={layoutSettings.showAnswerLines}
                onCheckedChange={(v) => onLayoutChange({ ...layoutSettings, showAnswerLines: v })}
              />
            </div>

            <div className="pt-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={onSaveAsTemplate}
              >
                <Save className="h-4 w-4 mr-2" />
                Save as Template
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Preview Panel */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Live Preview</CardTitle>
              <div className="flex gap-1">
                <Button
                  variant={previewDevice === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewDevice('desktop')}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={previewDevice === 'tablet' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewDevice('tablet')}
                >
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button
                  variant={previewDevice === 'mobile' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewDevice('mobile')}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Preview Container */}
            <div 
              ref={previewRef}
              className="mx-auto bg-gray-200 rounded-lg overflow-auto"
              style={{ 
                width: previewDims.width,
                height: previewDims.width * 1.4,
              }}
            >
              {/* A4 Paper Preview */}
              <div 
                className="mx-auto bg-white shadow-lg"
                style={{
                  width: '794px',
                  height: '1123px',
                  transform: `scale(${previewDims.scale})`,
                  transformOrigin: 'top center',
                  fontSize: `${layoutSettings.fontSize}pt`,
                  padding: getHeaderPadding(),
                }}
              >
                {/* Header Preview */}
                <div 
                  className="text-center border-b"
                  style={{ 
                    borderColor: layoutSettings.borderStyle === 'none' ? 'transparent' : '#ccc',
                    padding: getHeaderPadding(),
                  }}
                >
                  {['small', 'medium', 'large', 'custom'].includes(layoutSettings.logoSize) && (
                    <div 
                      className="mx-auto bg-gray-200 mb-1"
                      style={{ 
                        width: getLogoSize(), 
                        height: getLogoSize() 
                      }}
                    />
                  )}
                  <h1 className="font-bold text-sm">Sample Institute Name</h1>
                  <p className="text-xs text-gray-500">Sample Address • Phone</p>
                </div>

                {/* Meta Preview */}
                <div 
                  className="flex justify-between text-xs border-b"
                  style={{ 
                    borderColor: layoutSettings.borderStyle === 'none' ? 'transparent' : '#ccc',
                    padding: '4px 8px',
                  }}
                >
                  <span>Name: _____________</span>
                  <span>Roll: ______</span>
                  <span>Class: {template.classId}</span>
                  <span>Subject: {template.subject}</span>
                </div>

                {/* Sections Preview */}
                <div style={{ padding: getQuestionSpacing() }}>
                  {template.sections.map((section, idx) => (
                    <div 
                      key={idx}
                      className="mb-2"
                      style={{ marginBottom: getQuestionSpacing() }}
                    >
                      {/* Section Header */}
                      <div 
                        className="font-bold border-b"
                        style={{ 
                          borderColor: '#ccc',
                          padding: '2px 4px',
                        }}
                      >
                        {section.title}
                      </div>
                      
                      {/* Questions Preview */}
                      <div style={{ padding: '2px 4px' }}>
                        {layoutSettings.mcqStyle === 'grid' ? (
                          // Grid Style
                          <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
                            <tr style={{ border: '1px solid #ddd' }}>
                              <td style={{ padding: '2px', border: '1px solid #ddd' }}>1.</td>
                              <td style={{ padding: '2px', border: '1px solid #ddd' }}>Sample question text here</td>
                              <td style={{ padding: '2px', border: '1px solid #ddd' }}>(A)</td>
                              <td style={{ padding: '2px', border: '1px solid #ddd' }}>(B)</td>
                              <td style={{ padding: '2px', border: '1px solid #ddd' }}>(C)</td>
                              <td style={{ padding: '2px', border: '1px solid #ddd' }}>(D)</td>
                            </tr>
                          </table>
                        ) : (
                          // Inline Style
                          <div className="text-xs space-y-1">
                            <p>1. Sample question text here (A) option (B) option (C) option (D) option</p>
                            <p>2. Another question (A) (B) (C) (D)</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Watermark */}
                {layoutSettings.showWatermark && (
                  <div className="absolute bottom-4 right-4 text-xs text-gray-300">
                    paperpressapp@gmail.com
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
