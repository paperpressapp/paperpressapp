"use client";

/**
 * PaperListCard Component
 * 
 * Card showing paper summary in list view.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/shared";
import { formatDate } from "@/lib/utils/format";
import type { GeneratedPaper } from "@/types";

interface PaperListCardProps {
  /** Paper data */
  paper: GeneratedPaper;
  /** View handler */
  onView: () => void;
  /** Download handler */
  onDownload: () => void;
  /** Share handler */
  onShare: () => void;
  /** Delete handler */
  onDelete: () => void;
}

export function PaperListCard({
  paper,
  onView,
  onDownload,
  onShare,
  onDelete,
}: PaperListCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <>
      <motion.div
        className="glass-panel rounded-2xl p-4 flex items-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        whileTap={{ scale: 0.99 }}
      >
        {/* PDF Icon */}
        <div className="w-14 h-14 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
          <FileText className="w-7 h-7 text-red-500" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0" onClick={onView}>
          <h3 className="font-medium text-foreground truncate">
            {paper.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {paper.classId} • {paper.subject}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDate(paper.createdAt)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {paper.questionCount} questions • {paper.totalMarks} marks
          </p>
        </div>

        {/* More Options */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onView}>
              View Paper
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDownload}>
              Download PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onShare}>
              Share
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 focus:text-red-600"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          onDelete();
          setShowDeleteConfirm(false);
        }}
        title="Delete Paper?"
        message="This paper will be permanently deleted. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  );
}
