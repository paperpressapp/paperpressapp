"use client";

/**
 * ActionButtons Component
 * 
 * Horizontal scrollable row of action buttons.
 */

import { useState } from "react";
import { FileDown, FileText, MessageCircle, Mail, Link2 } from "lucide-react";
import { ActionButton } from "./ActionButton";
import { ScrollView } from "@/components/layout";
import { useToast } from "@/hooks";

interface ActionButtonsProps {
  /** PDF blob for sharing/downloading */
  pdfBlob: Blob | null;
  /** Paper title for sharing */
  paperTitle: string;
  /** Download handler */
  onDownloadPdf: () => void;
}

export function ActionButtons({
  pdfBlob,
  paperTitle,
  onDownloadPdf,
}: ActionButtonsProps) {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      onDownloadPdf();
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadDocx = () => {
    toast.info("Word document export coming soon!");
  };

  const handleShareWhatsApp = async () => {
    if (!pdfBlob) {
      toast.error("No PDF available to share");
      return;
    }

    // Try Web Share API first
    if (navigator.share && navigator.canShare) {
      const file = new File([pdfBlob], `${paperTitle}.pdf`, { type: "application/pdf" });
      
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: paperTitle,
          });
          return;
        } catch (error) {
          // User cancelled or share failed
        }
      }
    }

    // Fallback: show instructions
    toast.info("Save the PDF and share it manually via WhatsApp");
  };

  const handleShareEmail = async () => {
    if (!pdfBlob) {
      toast.error("No PDF available to share");
      return;
    }

    // Try Web Share API
    if (navigator.share && navigator.canShare) {
      const file = new File([pdfBlob], `${paperTitle}.pdf`, { type: "application/pdf" });
      
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: paperTitle,
          });
          return;
        } catch (error) {
          // User cancelled or share failed
        }
      }
    }

    // Fallback: mailto link
    const subject = encodeURIComponent(paperTitle);
    window.location.href = `mailto:?subject=${subject}`;
  };

  const handleCopyLink = () => {
    toast.info("Shareable link feature coming soon!");
  };

  const actions = [
    {
      icon: <FileDown className="w-8 h-8" />,
      label: "PDF",
      color: "#EF4444", // Red
      onPress: handleDownload,
      isLoading: isDownloading,
    },
    {
      icon: <FileText className="w-8 h-8" />,
      label: "Word",
      color: "#3B82F6", // Blue
      onPress: handleDownloadDocx,
      isLoading: false,
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      label: "WhatsApp",
      color: "#22C55E", // Green
      onPress: handleShareWhatsApp,
      isLoading: false,
    },
    {
      icon: <Mail className="w-8 h-8" />,
      label: "Email",
      color: "#6B7280", // Gray
      onPress: handleShareEmail,
      isLoading: false,
    },
    {
      icon: <Link2 className="w-8 h-8" />,
      label: "Copy Link",
      color: "#1E88E5", // Primary blue
      onPress: handleCopyLink,
      isLoading: false,
    },
  ];

  return (
    <div className="py-4">
      <ScrollView horizontal className="px-6">
        <div className="flex gap-3">
          {actions.map((action) => (
            <ActionButton
              key={action.label}
              icon={action.icon}
              label={action.label}
              color={action.color}
              onPress={action.onPress}
              isLoading={action.isLoading}
            />
          ))}
        </div>
      </ScrollView>
    </div>
  );
}
