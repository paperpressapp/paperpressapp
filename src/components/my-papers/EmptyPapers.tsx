"use client";

/**
 * EmptyPapers Component
 * 
 * Empty state when no papers exist, leveraging the premium EmptyState base.
 */

import { FileText, PlusCircle } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

interface EmptyPapersProps {
  /** Create button handler */
  onCreate: () => void;
}

export function EmptyPapers({ onCreate }: EmptyPapersProps) {
  return (
    <div className="py-12 px-4">
      <EmptyState
        icon={<FileText className="w-10 h-10" />}
        title="No Papers Created"
        description="Your generated test papers will appear here. Start by creating your first professional paper."
        action={{
          label: "Create New Paper",
          onClick: onCreate,
          icon: <PlusCircle className="w-5 h-5" />
        }}
        glowColor="#B9FF66"
      />
    </div>
  );
}
