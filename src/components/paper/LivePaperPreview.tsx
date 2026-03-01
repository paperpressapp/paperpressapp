"use client";

import { useMemo } from "react";
import type { MCQQuestion, ShortQuestion, LongQuestion, PaperSettings } from "@/types";
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { cn } from "@/lib/utils";

interface LivePaperPreviewProps {
    paperTitle: string;
    instituteName: string;
    date: string;
    timeAllowed: string;
    totalMarks: number;
    mcqs: MCQQuestion[];
    shorts: ShortQuestion[];
    longs: LongQuestion[];
    editedQuestions: Record<string, any>;
    questionOrder: { mcqs: string[]; shorts: string[]; longs: string[] };
    settings: PaperSettings;
    fontSize: number;
    logoPreview?: string | null;
}

export function LivePaperPreview({
    paperTitle,
    instituteName,
    date,
    timeAllowed,
    totalMarks,
    mcqs,
    shorts,
    longs,
    editedQuestions,
    questionOrder,
    settings,
    fontSize,
    logoPreview,
}: LivePaperPreviewProps) {
    // Sort questions according to questionOrder or fallback to default
    const orderedMcqs = useMemo(() => {
        if (questionOrder.mcqs.length > 0) {
            const sorted = [...mcqs].sort((a, b) => {
                const indexA = questionOrder.mcqs.indexOf(a.id);
                const indexB = questionOrder.mcqs.indexOf(b.id);
                if (indexA === -1 && indexB === -1) return 0;
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
            });
            return sorted;
        }
        return mcqs;
    }, [mcqs, questionOrder.mcqs]);

    const orderedShorts = useMemo(() => {
        if (questionOrder.shorts.length > 0) {
            const sorted = [...shorts].sort((a, b) => {
                const indexA = questionOrder.shorts.indexOf(a.id);
                const indexB = questionOrder.shorts.indexOf(b.id);
                if (indexA === -1 && indexB === -1) return 0;
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
            });
            return sorted;
        }
        return shorts;
    }, [shorts, questionOrder.shorts]);

    const orderedLongs = useMemo(() => {
        if (questionOrder.longs.length > 0) {
            const sorted = [...longs].sort((a, b) => {
                const indexA = questionOrder.longs.indexOf(a.id);
                const indexB = questionOrder.longs.indexOf(b.id);
                if (indexA === -1 && indexB === -1) return 0;
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
            });
            return sorted;
        }
        return longs;
    }, [longs, questionOrder.longs]);

    const getQuestionText = (id: string, defaultText: string) => {
        return editedQuestions[id]?.questionText || defaultText;
    };

    const getMcqOptions = (id: string, defaultOptions?: string[]) => {
        return editedQuestions[id]?.options || defaultOptions;
    };

    const hasSection = (questions: any[]) => questions.length > 0;
    const logoUrl = logoPreview || settings.instituteLogo;

    // Helper to render math in text
    const renderMath = (text: string) => {
        if (!text) return "";
        return text.replace(/\$\$([\s\S]+?)\$\$/g, (match, formula) => {
            try {
                return katex.renderToString(formula, { displayMode: true, throwOnError: false });
            } catch (e) {
                return match;
            }
        }).replace(/\$([\s\S]+?)\$/g, (match, formula) => {
            try {
                return katex.renderToString(formula, { displayMode: false, throwOnError: false });
            } catch (e) {
                return match;
            }
        }).replace(/\n/g, '<br />');
    };

    return (
        <div className="flex-1 w-full bg-[#0A0A0A] overflow-auto flex justify-center p-16 custom-scrollbar relative perspective-1000">
            {/* Ambient Studio Lighting */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#B9FF66]/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] pointer-events-none" />

            {/* Stacked Papers Visual Effect */}
            <div className="relative group">
                {/* Underneath Paper 2 */}
                <div
                    className="absolute -right-1 -bottom-1 w-[210mm] h-[297mm] bg-white rounded-[2px] shadow-sm transform rotate-[0.5deg] opacity-70 pointer-events-none"
                    style={{ zIndex: 0 }}
                />
                {/* Underneath Paper 1 */}
                <div
                    className="absolute -right-2 -bottom-2 w-[210mm] h-[297mm] bg-white rounded-[2px] shadow-md transform -rotate-[0.3deg] opacity-40 pointer-events-none"
                    style={{ zIndex: -1 }}
                />

                {/* Main A4 Paper Container */}
                <div
                    className="bg-white relative flex-shrink-0 transition-all duration-500 group-hover:translate-y-[-2px]"
                    style={{
                        width: '210mm',
                        minHeight: '297mm',
                        padding: '24mm',
                        color: '#1A1A1A',
                        fontFamily: "'Times New Roman', serif",
                        lineHeight: '1.5',
                        boxShadow: `
                            0 1px 1px rgba(0,0,0,0.11), 
                            0 2px 2px rgba(0,0,0,0.11), 
                            0 4px 4px rgba(0,0,0,0.11), 
                            0 8px 8px rgba(0,0,0,0.11), 
                            0 16px 16px rgba(0,0,0,0.11), 
                            0 32px 32px rgba(0,0,0,0.11)
                        `,
                        borderRadius: '1px',
                        background: 'radial-gradient(circle at 50% 50%, #fff 0%, #fdfdfd 100%)',
                        border: '1px solid rgba(0,0,0,0.05)',
                        zIndex: 10
                    }}
                >
                    {/* Subtle Paper Texture Overlay */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none noise-bg" />

                    {/* Header Section */}
                    <div className="flex items-center justify-between mb-2 relative z-10">
                        {/* Logo Container (Left) */}
                        <div style={{ width: `${settings.logoSize}px`, height: `${settings.logoSize}px`, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                            {settings.showLogo && logoUrl ? (
                                <img src={logoUrl} alt="Institute Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} className="drop-shadow-sm" />
                            ) : null}
                        </div>

                        {/* Title Container (Center) */}
                        <div className="flex-1 text-center px-4">
                            <h1 className="font-bold m-0 uppercase tracking-tight" style={{ fontSize: `${fontSize + 8}px` }}>{instituteName || "Institute Name"}</h1>
                            {settings.customHeader && <p className="font-semibold m-0 mt-1" style={{ fontSize: `${fontSize + 2}px` }}>{settings.customHeader}</p>}
                            <p className="font-bold m-0 mt-2 underline decoration-2 underline-offset-4" style={{ fontSize: `${fontSize + 4}px` }}>{paperTitle || "Test Paper"}</p>
                            {settings.customSubHeader && <p className="m-0 mt-1 italic opacity-80" style={{ fontSize: `${fontSize}px` }}>{settings.customSubHeader}</p>}
                        </div>

                        {/* Balanced Spacer */}
                        <div style={{ width: `${settings.logoSize}px`, height: `${settings.logoSize}px` }} />
                    </div>

                    {/* Student Info Bar */}
                    <div
                        className="grid grid-cols-2 gap-y-2 gap-x-8 mb-8 border-t-2 border-b-2 border-black py-4 mt-6"
                        style={{ fontSize: `${fontSize}px` }}
                    >
                        <div className="flex gap-2 items-end">
                            <span className="font-bold whitespace-nowrap">Student Name:</span>
                            <div className="border-b border-black flex-1 h-px mb-1" />
                        </div>
                        <div className="text-right flex justify-end gap-2 items-center">
                            <span className="font-bold">Total Marks:</span>
                            <span className="font-black px-2 py-0.5 bg-gray-100 rounded border border-gray-200">{totalMarks}</span>
                        </div>
                        <div className="flex gap-2 items-end">
                            <span className="font-bold whitespace-nowrap">Roll Number:</span>
                            <div className="border-b border-black w-32 h-px mb-1" />
                        </div>
                        <div className="text-right flex justify-end gap-2 items-center">
                            <span className="font-bold">Time:</span>
                            <span className="font-medium">{timeAllowed}</span>
                        </div>
                        <div className="col-span-2 flex justify-between pt-1">
                            <div><span className="font-bold uppercase tracking-wider text-[10px]">Date:</span> {date || new Date().toLocaleDateString()}</div>
                            <div className="italic text-[10px] opacity-60 uppercase tracking-widest">Section: A</div>
                        </div>
                    </div>

                    {/* Content Sections */}
                    <div className="relative z-10">
                        {/* MCQ Section */}
                        {hasSection(orderedMcqs) && (
                            <div className="mb-8">
                                <h2 className="font-bold uppercase border-l-4 border-black pl-3 mb-4 flex justify-between items-center" style={{ fontSize: `${fontSize + 2}px` }}>
                                    <span>Part I: Multiple Choice Questions</span>
                                    <span className="text-sm font-normal">({orderedMcqs.length} Marks)</span>
                                </h2>
                                <div className="space-y-4">
                                    {orderedMcqs.map((q, idx) => {
                                        const text = getQuestionText(q.id, q.questionText);
                                        const options = getMcqOptions(q.id, q.options) || [];
                                        return (
                                            <div key={q.id} className="break-inside-avoid" style={{ fontSize: `${fontSize}px` }}>
                                                <div className="flex gap-3">
                                                    <span className="font-bold shrink-0 min-w-[20px]">{idx + 1}.</span>
                                                    <div className="m-0 leading-relaxed" dangerouslySetInnerHTML={{ __html: renderMath(text) }} />
                                                </div>
                                                {options && options.length > 0 && (
                                                    <div className="pl-8 pt-2 grid grid-cols-2 gap-y-2 gap-x-4">
                                                        {options.map((opt: string, optIdx: number) => (
                                                            <div key={optIdx} className="flex gap-3 items-baseline">
                                                                <span className="font-bold w-5 h-5 rounded-full border border-black/10 flex items-center justify-center text-[10px] shrink-0">
                                                                    {String.fromCharCode(65 + optIdx)}
                                                                </span>
                                                                <span className="flex-1" dangerouslySetInnerHTML={{ __html: renderMath(opt) }} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Short Questions Section */}
                        {hasSection(orderedShorts) && (
                            <div className="mb-8">
                                <h2 className="font-bold uppercase border-l-4 border-black pl-3 mb-4 mt-10 flex justify-between items-center" style={{ fontSize: `${fontSize + 2}px` }}>
                                    <span>Part II: Short Answer Questions</span>
                                    <span className="text-sm font-normal">({orderedShorts.length * (settings.customMarks?.short || 2)} Marks)</span>
                                </h2>
                                <div className="space-y-5">
                                    {orderedShorts.map((q, idx) => {
                                        const text = getQuestionText(q.id, q.questionText);
                                        return (
                                            <div key={q.id} className="flex gap-3 break-inside-avoid" style={{ fontSize: `${fontSize}px` }}>
                                                <span className="font-bold shrink-0 min-w-[20px]">{idx + 1}.</span>
                                                <p className="m-0 leading-relaxed" dangerouslySetInnerHTML={{ __html: renderMath(text) }} />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Long Questions Section */}
                        {hasSection(orderedLongs) && (
                            <div className="mb-8">
                                <h2 className="font-bold uppercase border-l-4 border-black pl-3 mb-4 mt-10 flex justify-between items-center" style={{ fontSize: `${fontSize + 2}px` }}>
                                    <span>Part III: Descriptive Questions</span>
                                    <span className="text-sm font-normal">({orderedLongs.length * (settings.customMarks?.long || 5)} Marks)</span>
                                </h2>
                                <div className="space-y-6">
                                    {orderedLongs.map((q, idx) => {
                                        const text = getQuestionText(q.id, q.questionText);
                                        return (
                                            <div key={q.id} className="flex gap-3 break-inside-avoid" style={{ fontSize: `${fontSize}px` }}>
                                                <span className="font-bold shrink-0 min-w-[20px]">{idx + 1}.</span>
                                                <div className="m-0 flex-1 leading-relaxed" dangerouslySetInnerHTML={{ __html: renderMath(text) }} />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer / Instructions */}
                    <div className="mt-12 pt-6 border-t border-black/10 relative z-10 text-center">
                        <p className="text-[10px] uppercase font-bold tracking-widest opacity-40 italic">
                            {settings.customFooter || "--- End of Examination Paper ---"}
                        </p>
                    </div>

                    {/* Watermark overlay */}
                    {settings.showWatermark && (
                        <div
                            className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-[0.04] select-none"
                            style={{ zIndex: 0 }}
                        >
                            <div className="text-[100px] font-black text-black transform -rotate-[35deg] whitespace-nowrap uppercase tracking-tighter">
                                {instituteName || "PaperPress"}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
