"use client";

/**
 * SubjectIcon Component
 * 
 * Returns appropriate icon for each subject.
 */

import { Atom, FlaskConical, Leaf, Calculator, Laptop, BookOpen } from "lucide-react";

interface SubjectIconProps {
  /** Subject name */
  subject: string;
  /** Icon size */
  size?: number;
  /** Icon color */
  color?: string;
}

export function SubjectIcon({ subject, size = 24, color = "currentColor" }: SubjectIconProps) {
  const iconProps = { size, color, strokeWidth: 2 };

  switch (subject.toLowerCase()) {
    case "physics":
      return <Atom {...iconProps} />;
    case "chemistry":
      return <FlaskConical {...iconProps} />;
    case "biology":
      return <Leaf {...iconProps} />;
    case "mathematics":
      return <Calculator {...iconProps} />;
    case "computer":
      return <Laptop {...iconProps} />;
    case "english":
      return <BookOpen {...iconProps} />;
    default:
      return <BookOpen {...iconProps} />;
  }
}
