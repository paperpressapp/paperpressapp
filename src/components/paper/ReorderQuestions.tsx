"use client";

import { useState } from "react";
import { Reorder } from "framer-motion";
import { GripVertical, Trash2, Pencil, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MCQQuestion, ShortQuestion, LongQuestion } from "@/types";

interface ReorderQuestionsProps {
    type: 'mcq' | 'short' | 'long';
    items: (MCQQuestion | ShortQuestion | LongQuestion)[];
    onOrderChange: (newOrder: string[]) => void;
    onRemove: (id: string) => void;
    editedQuestions: Record<string, any>;
    onEditQuestion: (questionId: string, newText: string) => void;
}

export function ReorderQuestions({
    type,
    items,
    onOrderChange,
    onRemove,
    editedQuestions,
    onEditQuestion
}: ReorderQuestionsProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState("");

    const startEdit = (id: string, currentText: string) => {
        setEditingId(id);
        setEditText(currentText);
    };

    const saveEdit = () => {
        if (editingId) {
            onEditQuestion(editingId, editText);
            setEditingId(null);
            setEditText("");
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditText("");
    };

    const handleReorder = (newItems: (MCQQuestion | ShortQuestion | LongQuestion)[]) => {
        onOrderChange(newItems.map(item => item.id));
    };

    return (
        <>
            <Reorder.Group
                axis="y"
                values={items}
                onReorder={handleReorder}
                className="space-y-2 mt-2"
            >
                {items.map((item, index) => {
                    const finalQuestionText = editedQuestions[item.id]?.questionText || item.questionText;
                    const isEditing = editingId === item.id;

                    return (
                        <Reorder.Item
                            key={item.id}
                            value={item}
                            className={cn(
                                "flex items-center gap-3 p-3 rounded-[20px] border group/item transition-all duration-300 relative overflow-hidden",
                                isEditing
                                    ? "bg-[#B9FF66]/10 border-[#B9FF66]/40 shadow-[0_0_20px_rgba(185,255,102,0.15)] ring-1 ring-[#B9FF66]/20"
                                    : "bg-[#0A0A0A]/40 border-[#2A2A2A] hover:border-[#B9FF66]/30 hover:bg-[#0A0A0A]/60 shadow-sm"
                            )}
                        >
                            {isEditing ? (
                                <>
                                    <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#B9FF66] to-[#22c55e] text-[#0A0A0A] text-xs font-black shadow-[0_4px_12px_rgba(185,255,102,0.3)]">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <input
                                            type="text"
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-black/40 rounded-xl border border-[#B9FF66]/20 text-white focus:outline-none focus:border-[#B9FF66] focus:ring-1 focus:ring-[#B9FF66]/10 transition-all font-medium"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') saveEdit();
                                                if (e.key === 'Escape') cancelEdit();
                                            }}
                                        />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={saveEdit}
                                            className="p-2 rounded-xl bg-[#B9FF66] text-[#0A0A0A] hover:scale-110 active:scale-95 transition-all shadow-md"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={cancelEdit}
                                            className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 active:scale-95 transition-all border border-red-500/20"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="cursor-grab active:cursor-grabbing p-1 text-[#6B7280] group-hover/item:text-[#B9FF66] transition-colors">
                                        <GripVertical className="w-5 h-5" />
                                    </div>

                                    <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] text-[10px] font-black text-[#9CA3AF] group-hover/item:text-[#B9FF66] group-hover/item:border-[#B9FF66]/20 transition-all">
                                        {index + 1}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white line-clamp-2 leading-relaxed font-medium group-hover/item:text-white/90 transition-colors">
                                            {finalQuestionText}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-all duration-300 translate-x-2 group-hover/item:translate-x-0">
                                        <button
                                            onClick={() => startEdit(item.id, finalQuestionText)}
                                            className="p-2 rounded-xl bg-[#2A2A2A] hover:bg-[#B9FF66]/20 text-[#6B7280] hover:text-[#B9FF66] transition-all border border-transparent hover:border-[#B9FF66]/30"
                                            title="Edit question"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>

                                        <button
                                            onClick={() => onRemove(item.id)}
                                            className="p-2 rounded-xl bg-[#2A2A2A] hover:bg-red-500/10 text-[#6B7280] hover:text-red-400 transition-all border border-transparent hover:border-red-500/30"
                                            title="Remove question"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </Reorder.Item>
                    );
                })}
            </Reorder.Group>
        </>
    );
}
