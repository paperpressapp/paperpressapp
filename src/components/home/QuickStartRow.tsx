"use client";

import { Atom, FlaskConical, Leaf, Calculator, Laptop, BookOpen } from "lucide-react";

interface QuickStartRowProps {
  onSubjectPress: (subjectName: string) => void;
}

const SUBJECTS = [
  { id: "physics",     name: "Physics",     Icon: Atom,         color: "#9C27B0", bg: "#F3E8FF" },
  { id: "chemistry",   name: "Chemistry",   Icon: FlaskConical, color: "#F97316", bg: "#FFF7ED" },
  { id: "biology",     name: "Biology",     Icon: Leaf,         color: "#16A34A", bg: "#F0FDF4" },
  { id: "mathematics", name: "Mathematics", Icon: Calculator,   color: "#1E88E5", bg: "#EFF6FF" },
  { id: "computer",    name: "Computer",    Icon: Laptop,       color: "#475569", bg: "#F8FAFC" },
  { id: "english",     name: "English",     Icon: BookOpen,     color: "#DB2777", bg: "#FDF2F8" },
];

export function QuickStartRow({ onSubjectPress }: QuickStartRowProps) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-[#9CA3AF] px-4 mb-2">
        Quick Start
      </p>
      <div
        className="flex gap-3 overflow-x-auto px-4 pb-2"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
        {SUBJECTS.map(({ id, name, Icon, color, bg }) => (
          <button
            key={id}
            onClick={() => onSubjectPress(name)}
            className="flex flex-col items-center gap-2 bg-white rounded-lg border border-[#E5E7EB] p-3 min-w-[76px] shadow-sm active:scale-95 transition-transform flex-shrink-0"
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: bg }}
            >
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <span className="text-[11px] font-semibold text-[#374151] leading-tight text-center">
              {name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
