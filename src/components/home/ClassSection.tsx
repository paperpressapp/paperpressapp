"use client";

/**
 * ClassSection Component - Professional Design
 * 
 * Section displaying class selection cards with embedded subject popup
 */

import { ClassCard } from "./ClassCard";
import { CLASSES } from "@/constants/classes";
import { GraduationCap } from "lucide-react";

export function ClassSection() {
  return (
    <section id="classes-section" className="px-5 py-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E88E5] to-[#1565C0] flex items-center justify-center shadow-lg shadow-[#1E88E5]/30">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Select Class</h2>
            <p className="text-sm text-gray-500">Choose your class to continue</p>
          </div>
        </div>
      </div>

      {/* Class Grid */}
      <div className="grid grid-cols-2 gap-4">
        {CLASSES.map((classInfo) => (
          <ClassCard
            key={classInfo.id}
            classInfo={classInfo}
          />
        ))}
      </div>
    </section>
  );
}
