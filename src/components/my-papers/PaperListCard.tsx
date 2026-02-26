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
        className="glass-panel rounded-xl p-3 flex items-center gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        whileTap={{ scale: 0.99 }}
      >
        {/* PDF Icon */}
        <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-red-500" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0" onClick={onView}>
          <h3 className="font-medium text-sm text-foreground truncate">
            {paper.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {paper.classId} • {paper.subject}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {formatDate(paper.createdAt)} • {paper.questionCount} Q • {paper.totalMarks} marks
          </p>
        </div>

        {/* More Options */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onView}>
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDownload}>
              Download
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
