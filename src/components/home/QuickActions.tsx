"use client";

/**
 * QuickActions Component - Redesigned
 * 
 * Horizontal scroll row of quick action buttons.
 * Clean design without emojis.
 */

import { useRouter } from "next/navigation";
import { Plus, FileText, LayoutTemplate, Clock, Sparkles } from "lucide-react";
import { QuickActionCard } from "./QuickActionCard";
import { ScrollView } from "@/components/layout";
import { useToast } from "@/hooks";

export function QuickActions() {
  const router = useRouter();
  const { toast } = useToast();

  const actions = [
    {
      icon: <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />,
      label: "Create",
      isPrimary: true,
      onPress: () => {
        // Scroll to classes section
        const classesSection = document.getElementById("classes-section");
        if (classesSection) {
          classesSection.scrollIntoView({ behavior: "smooth" });
        } else {
          toast.info("Select a class to begin");
        }
      },
    },
    {
      icon: <FileText className="w-6 h-6 text-[#1E88E5]" strokeWidth={2} />,
      label: "My Papers",
      isPrimary: false,
      onPress: () => router.push("/my-papers"),
    },
    {
      icon: <Sparkles className="w-6 h-6 text-[#1E88E5]" strokeWidth={2} />,
      label: "AI Generate",
      isPrimary: false,
      onPress: () => {
        toast.info("AI paper generation coming soon!");
      },
    },
    {
      icon: <Clock className="w-6 h-6 text-[#1E88E5]" strokeWidth={2} />,
      label: "Recent",
      isPrimary: false,
      onPress: () => router.push("/my-papers"),
    },
  ];

  return (
    <div className="py-5">
      {/* Section Title */}
      <div className="px-6 mb-4">
        <h2 className="text-base font-semibold text-gray-800">Quick Actions</h2>
      </div>
      
      <ScrollView horizontal className="px-6">
        <div className="flex gap-3">
          {actions.map((action) => (
            <QuickActionCard
              key={action.label}
              icon={action.icon}
              label={action.label}
              isPrimary={action.isPrimary}
              onPress={action.onPress}
            />
          ))}
        </div>
      </ScrollView>
    </div>
  );
}
