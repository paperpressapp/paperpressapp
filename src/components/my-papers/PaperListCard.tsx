"use client";

/**
 * PaperListCard Component
 * 
 * Professional card showing paper summary in list view.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Share2, MoreVertical, Star, Trash2, Edit, Copy, StarOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/shared";
import { triggerHaptic } from "@/hooks";
import type { GeneratedPaper } from "@/types";

interface PaperListCardProps {
  paper: GeneratedPaper;
  onView: () => void;
  onDownload: () => void;
  onShare: () => void;
  onDelete: () => void;
  onRename?: () => void;
  onDuplicate?: () => void;
  onToggleFavorite?: () => void;
}

export function PaperListCard({
  paper,
  onView,
  onDownload,
  onShare,
  onDelete,
  onRename,
  onDuplicate,
  onToggleFavorite,
}: PaperListCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isFavorite, setIsFavorite] = useState(paper.isFavorite || false);

  const handleToggleFavorite = () => {
    triggerHaptic('light');
    setIsFavorite(!isFavorite);
    onToggleFavorite?.();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="bg-[#1A1A1A] rounded-[14px] p-3 border border-[#2A2A2A] hover:border-[#B9FF66]/30 transition-all"
        style={{ boxShadow: '0px 4px 20px rgba(0,0,0,0.2)' }}
      >
        {/* Header Row */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {/* Subject Icon */}
            <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#B9FF66]/20 to-[#22C55E]/10 flex items-center justify-center border border-[#B9FF66]/20">
              <FileText className="w-4 h-4 text-[#B9FF66]" />
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white truncate max-w-[180px]">
                  {paper.title}
                </h3>
                {isFavorite && (
                  <Star className="w-4 h-4 text-[#B9FF66] fill-[#B9FF66]" />
                )}
              </div>
              <p className="text-sm text-[#A0A0A0]">
                {paper.subject} • {paper.classId}
              </p>
            </div>
          </div>

          {/* More Menu Button */}
          <div className="relative">
            <button
              onClick={() => { triggerHaptic('light'); setShowMenu(!showMenu); }}
              className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center hover:bg-[#3A3A3A] transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-white" />
            </button>

            {/* Actions Menu */}
            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowMenu(false)} 
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="absolute right-0 top-10 w-48 bg-[#252525] rounded-[12px] border border-[#2A2A2A] shadow-xl z-50 overflow-hidden"
                >
                  <button
                    onClick={() => { onView(); setShowMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#2A2A2A] transition-colors text-left"
                  >
                    <FileText className="w-4 h-4 text-[#A0A0A0]" />
                    <span className="text-sm text-white">View</span>
                  </button>
                  <button
                    onClick={() => { onDownload(); setShowMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#2A2A2A] transition-colors text-left"
                  >
                    <Download className="w-4 h-4 text-[#A0A0A0]" />
                    <span className="text-sm text-white">Download PDF</span>
                  </button>
                  <button
                    onClick={() => { onShare(); setShowMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#2A2A2A] transition-colors text-left"
                  >
                    <Share2 className="w-4 h-4 text-[#A0A0A0]" />
                    <span className="text-sm text-white">Share</span>
                  </button>
                  {onDuplicate && (
                    <button
                      onClick={() => { onDuplicate(); setShowMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#2A2A2A] transition-colors text-left"
                    >
                      <Copy className="w-4 h-4 text-[#A0A0A0]" />
                      <span className="text-sm text-white">Duplicate</span>
                    </button>
                  )}
                  {onRename && (
                    <button
                      onClick={() => { onRename(); setShowMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#2A2A2A] transition-colors text-left"
                    >
                      <Edit className="w-4 h-4 text-[#A0A0A0]" />
                      <span className="text-sm text-white">Rename</span>
                    </button>
                  )}
                  <button
                    onClick={() => { handleToggleFavorite(); setShowMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#2A2A2A] transition-colors text-left"
                  >
                    {isFavorite ? (
                      <>
                        <StarOff className="w-4 h-4 text-[#A0A0A0]" />
                        <span className="text-sm text-white">Remove Favorite</span>
                      </>
                    ) : (
                      <>
                        <Star className="w-4 h-4 text-[#A0A0A0]" />
                        <span className="text-sm text-white">Add to Favorites</span>
                      </>
                    )}
                  </button>
                  <div className="border-t border-[#2A2A2A]" />
                  <button
                    onClick={() => { setShowMenu(false); setShowDeleteConfirm(true); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FF4D4D]/10 transition-colors text-left"
                  >
                    <Trash2 className="w-4 h-4 text-[#FF4D4D]" />
                    <span className="text-sm text-[#FF4D4D]">Delete</span>
                  </button>
                </motion.div>
              </>
            )}
          </div>
        </div>

        {/* Date Row */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-[#6B6B6B]">
            {formatDate(paper.createdAt)}
          </span>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-md bg-[#B9FF66]/10 flex items-center justify-center">
              <span className="text-[10px] font-bold text-[#B9FF66]">{paper.questionCount}</span>
            </div>
            <span className="text-xs text-[#A0A0A0]">Questions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-md bg-[#22C55E]/10 flex items-center justify-center">
              <span className="text-[10px] font-bold text-[#22C55E]">{paper.totalMarks}</span>
            </div>
            <span className="text-xs text-[#A0A0A0]">Marks</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#2A2A2A]">
          <button
            onClick={onDownload}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-[10px] bg-[#2A2A2A] hover:bg-[#3A3A3A] transition-colors"
          >
            <Download className="w-4 h-4 text-[#B9FF66]" />
            <span className="text-xs font-medium text-white">Download</span>
          </button>
          <button
            onClick={onShare}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-[10px] bg-[#2A2A2A] hover:bg-[#3A3A3A] transition-colors"
          >
            <Share2 className="w-4 h-4 text-[#A0A0A0]" />
            <span className="text-xs font-medium text-white">Share</span>
          </button>
          <button
            onClick={handleToggleFavorite}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-[10px] transition-colors",
              isFavorite ? "bg-[#B9FF66]/20" : "bg-[#2A2A2A] hover:bg-[#3A3A3A]"
            )}
          >
            <Star className={cn("w-4 h-4", isFavorite ? "text-[#B9FF66] fill-[#B9FF66]" : "text-[#A0A0A0]")} />
          </button>
        </div>
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
