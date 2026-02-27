export type NoteType = 'mcq' | 'short' | 'long' | 'complete' | 'solved' | 'revision';

export interface Note {
  id: string;
  title: string;
  description: string;
  type: NoteType;
  fileUrl: string;
  downloadCount: number;
  lastUpdated: string;
  fileSize: string;
}

export interface SubjectNotes {
  subjectId: string;
  subjectName: string;
  icon: string;
  color: string;
  chapters: number;
  notes: Note[];
}

export interface ClassNotesData {
  classId: string;
  className: string;
  subjects: SubjectNotes[];
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

const formatDownloads = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
};

export const NOTES_DATA: Record<string, ClassNotesData> = {
  '9th': {
    classId: '9th',
    className: '9th Class',
    subjects: [
      {
        subjectId: 'english',
        subjectName: 'English',
        icon: 'BookOpen',
        color: '#E91E63',
        chapters: 10,
        notes: [
          {
            id: '9th_eng_mcq',
            title: 'Textbook MCQs',
            description: 'Chapter-wise multiple choice questions with answers',
            type: 'mcq',
            fileUrl: '/notes/9th/english/mcqs.pdf',
            downloadCount: 1245,
            lastUpdated: '2026-02-20',
            fileSize: '2.4 MB'
          },
          {
            id: '9th_eng_short',
            title: 'Short Questions Notes',
            description: 'Important short questions with detailed answers',
            type: 'short',
            fileUrl: '/notes/9th/english/short-questions.pdf',
            downloadCount: 892,
            lastUpdated: '2026-02-18',
            fileSize: '1.8 MB'
          },
          {
            id: '9th_eng_long',
            title: 'Long Questions Notes',
            description: 'Comprehensive long questions and model answers',
            type: 'long',
            fileUrl: '/notes/9th/english/long-questions.pdf',
            downloadCount: 654,
            lastUpdated: '2026-02-15',
            fileSize: '3.2 MB'
          },
          {
            id: '9th_eng_complete',
            title: 'Complete Notes',
            description: 'Full syllabus coverage with all question types',
            type: 'complete',
            fileUrl: '/notes/9th/english/complete.pdf',
            downloadCount: 2100,
            lastUpdated: '2026-02-22',
            fileSize: '8.5 MB'
          },
          {
            id: '9th_eng_solved',
            title: 'Solved Exercises',
            description: 'Textbook exercises with step-by-step solutions',
            type: 'solved',
            fileUrl: '/notes/9th/english/exercises.pdf',
            downloadCount: 1567,
            lastUpdated: '2026-02-19',
            fileSize: '4.1 MB'
          },
          {
            id: '9th_eng_revision',
            title: 'Quick Revision',
            description: 'Key points, grammar rules, and important summaries',
            type: 'revision',
            fileUrl: '/notes/9th/english/revision.pdf',
            downloadCount: 3200,
            lastUpdated: '2026-02-21',
            fileSize: '1.2 MB'
          }
        ]
      },
      {
        subjectId: 'computer',
        subjectName: 'Computer',
        icon: 'Laptop',
        color: '#607D8B',
        chapters: 12,
        notes: [
          {
            id: '9th_com_mcq',
            title: 'Textbook MCQs',
            description: 'Chapter-wise multiple choice questions',
            type: 'mcq',
            fileUrl: '/notes/9th/computer/mcqs.pdf',
            downloadCount: 2100,
            lastUpdated: '2026-02-20',
            fileSize: '1.8 MB'
          },
          {
            id: '9th_com_short',
            title: 'Short Questions Notes',
            description: 'Important short questions with answers',
            type: 'short',
            fileUrl: '/notes/9th/computer/short-questions.pdf',
            downloadCount: 1450,
            lastUpdated: '2026-02-18',
            fileSize: '1.5 MB'
          },
          {
            id: '9th_com_long',
            title: 'Long Questions Notes',
            description: 'Programming questions with code solutions',
            type: 'long',
            fileUrl: '/notes/9th/computer/long-questions.pdf',
            downloadCount: 890,
            lastUpdated: '2026-02-15',
            fileSize: '2.8 MB'
          },
          {
            id: '9th_com_complete',
            title: 'Complete Notes',
            description: 'Full syllabus with programming examples',
            type: 'complete',
            fileUrl: '/notes/9th/computer/complete.pdf',
            downloadCount: 3500,
            lastUpdated: '2026-02-22',
            fileSize: '6.2 MB'
          },
          {
            id: '9th_com_solved',
            title: 'Solved Exercises',
            description: 'All programming exercises with solutions',
            type: 'solved',
            fileUrl: '/notes/9th/computer/exercises.pdf',
            downloadCount: 2800,
            lastUpdated: '2026-02-19',
            fileSize: '3.5 MB'
          },
          {
            id: '9th_com_revision',
            title: 'Quick Revision',
            description: 'Key concepts, syntax, and important programs',
            type: 'revision',
            fileUrl: '/notes/9th/computer/revision.pdf',
            downloadCount: 4200,
            lastUpdated: '2026-02-21',
            fileSize: '0.9 MB'
          }
        ]
      },
      {
        subjectId: 'physics',
        subjectName: 'Physics',
        icon: 'Atom',
        color: '#9C27B0',
        chapters: 9,
        notes: [
          {
            id: '9th_phy_mcq',
            title: 'Textbook MCQs',
            description: 'Chapter-wise multiple choice questions',
            type: 'mcq',
            fileUrl: '/notes/9th/physics/mcqs.pdf',
            downloadCount: 1800,
            lastUpdated: '2026-02-20',
            fileSize: '2.1 MB'
          },
          {
            id: '9th_phy_short',
            title: 'Short Questions Notes',
            description: 'Important short questions with answers',
            type: 'short',
            fileUrl: '/notes/9th/physics/short-questions.pdf',
            downloadCount: 1200,
            lastUpdated: '2026-02-18',
            fileSize: '1.6 MB'
          },
          {
            id: '9th_phy_long',
            title: 'Long Questions Notes',
            description: 'Numericals and derivation questions',
            type: 'long',
            fileUrl: '/notes/9th/physics/long-questions.pdf',
            downloadCount: 780,
            lastUpdated: '2026-02-15',
            fileSize: '3.0 MB'
          },
          {
            id: '9th_phy_complete',
            title: 'Complete Notes',
            description: 'Full syllabus with formulas and derivations',
            type: 'complete',
            fileUrl: '/notes/9th/physics/complete.pdf',
            downloadCount: 2900,
            lastUpdated: '2026-02-22',
            fileSize: '7.8 MB'
          },
          {
            id: '9th_phy_solved',
            title: 'Solved Exercises',
            description: 'All textbook problems with solutions',
            type: 'solved',
            fileUrl: '/notes/9th/physics/exercises.pdf',
            downloadCount: 2100,
            lastUpdated: '2026-02-19',
            fileSize: '4.5 MB'
          },
          {
            id: '9th_phy_revision',
            title: 'Quick Revision',
            description: 'Key formulas, laws, and important derivations',
            type: 'revision',
            fileUrl: '/notes/9th/physics/revision.pdf',
            downloadCount: 3800,
            lastUpdated: '2026-02-21',
            fileSize: '1.1 MB'
          }
        ]
      },
      {
        subjectId: 'chemistry',
        subjectName: 'Chemistry',
        icon: 'FlaskConical',
        color: '#FF9800',
        chapters: 8,
        notes: [
          {
            id: '9th_chem_mcq',
            title: 'Textbook MCQs',
            description: 'Chapter-wise multiple choice questions',
            type: 'mcq',
            fileUrl: '/notes/9th/chemistry/mcqs.pdf',
            downloadCount: 1650,
            lastUpdated: '2026-02-20',
            fileSize: '1.9 MB'
          },
          {
            id: '9th_chem_short',
            title: 'Short Questions Notes',
            description: 'Important short questions with answers',
            type: 'short',
            fileUrl: '/notes/9th/chemistry/short-questions.pdf',
            downloadCount: 1100,
            lastUpdated: '2026-02-18',
            fileSize: '1.4 MB'
          },
          {
            id: '9th_chem_long',
            title: 'Long Questions Notes',
            description: 'Chemical equations and reactions',
            type: 'long',
            fileUrl: '/notes/9th/chemistry/long-questions.pdf',
            downloadCount: 720,
            lastUpdated: '2026-02-15',
            fileSize: '2.5 MB'
          },
          {
            id: '9th_chem_complete',
            title: 'Complete Notes',
            description: 'Full syllabus with reactions and formulas',
            type: 'complete',
            fileUrl: '/notes/9th/chemistry/complete.pdf',
            downloadCount: 2600,
            lastUpdated: '2026-02-22',
            fileSize: '6.8 MB'
          },
          {
            id: '9th_chem_solved',
            title: 'Solved Exercises',
            description: 'All textbook exercises with solutions',
            type: 'solved',
            fileUrl: '/notes/9th/chemistry/exercises.pdf',
            downloadCount: 1900,
            lastUpdated: '2026-02-19',
            fileSize: '3.8 MB'
          },
          {
            id: '9th_chem_revision',
            title: 'Quick Revision',
            description: 'Periodic table, reactions, and key concepts',
            type: 'revision',
            fileUrl: '/notes/9th/chemistry/revision.pdf',
            downloadCount: 3400,
            lastUpdated: '2026-02-21',
            fileSize: '1.0 MB'
          }
        ]
      },
      {
        subjectId: 'biology',
        subjectName: 'Biology',
        icon: 'Leaf',
        color: '#4CAF50',
        chapters: 10,
        notes: [
          {
            id: '9th_bio_mcq',
            title: 'Textbook MCQs',
            description: 'Chapter-wise multiple choice questions',
            type: 'mcq',
            fileUrl: '/notes/9th/biology/mcqs.pdf',
            downloadCount: 1400,
            lastUpdated: '2026-02-20',
            fileSize: '2.0 MB'
          },
          {
            id: '9th_bio_short',
            title: 'Short Questions Notes',
            description: 'Important short questions with answers',
            type: 'short',
            fileUrl: '/notes/9th/biology/short-questions.pdf',
            downloadCount: 950,
            lastUpdated: '2026-02-18',
            fileSize: '1.5 MB'
          },
          {
            id: '9th_bio_long',
            title: 'Long Questions Notes',
            description: 'Detailed long questions and diagrams',
            type: 'long',
            fileUrl: '/notes/9th/biology/long-questions.pdf',
            downloadCount: 650,
            lastUpdated: '2026-02-15',
            fileSize: '2.9 MB'
          },
          {
            id: '9th_bio_complete',
            title: 'Complete Notes',
            description: 'Full syllabus with diagrams',
            type: 'complete',
            fileUrl: '/notes/9th/biology/complete.pdf',
            downloadCount: 2200,
            lastUpdated: '2026-02-22',
            fileSize: '7.2 MB'
          },
          {
            id: '9th_bio_solved',
            title: 'Solved Exercises',
            description: 'All textbook questions with solutions',
            type: 'solved',
            fileUrl: '/notes/9th/biology/exercises.pdf',
            downloadCount: 1600,
            lastUpdated: '2026-02-19',
            fileSize: '4.0 MB'
          },
          {
            id: '9th_bio_revision',
            title: 'Quick Revision',
            description: 'Key definitions, diagrams, and important points',
            type: 'revision',
            fileUrl: '/notes/9th/biology/revision.pdf',
            downloadCount: 2900,
            lastUpdated: '2026-02-21',
            fileSize: '1.3 MB'
          }
        ]
      },
      {
        subjectId: 'mathematics',
        subjectName: 'Mathematics',
        icon: 'Calculator',
        color: '#2196F3',
        chapters: 11,
        notes: [
          {
            id: '9th_math_mcq',
            title: 'Textbook MCQs',
            description: 'Chapter-wise multiple choice questions',
            type: 'mcq',
            fileUrl: '/notes/9th/mathematics/mcqs.pdf',
            downloadCount: 2200,
            lastUpdated: '2026-02-20',
            fileSize: '2.3 MB'
          },
          {
            id: '9th_math_short',
            title: 'Short Questions Notes',
            description: 'Important short questions with answers',
            type: 'short',
            fileUrl: '/notes/9th/mathematics/short-questions.pdf',
            downloadCount: 1500,
            lastUpdated: '2026-02-18',
            fileSize: '1.7 MB'
          },
          {
            id: '9th_math_long',
            title: 'Long Questions Notes',
            description: 'Detailed long questions with solutions',
            type: 'long',
            fileUrl: '/notes/9th/mathematics/long-questions.pdf',
            downloadCount: 980,
            lastUpdated: '2026-02-15',
            fileSize: '3.4 MB'
          },
          {
            id: '9th_math_complete',
            title: 'Complete Notes',
            description: 'Full syllabus with examples and solutions',
            type: 'complete',
            fileUrl: '/notes/9th/mathematics/complete.pdf',
            downloadCount: 3800,
            lastUpdated: '2026-02-22',
            fileSize: '8.9 MB'
          },
          {
            id: '9th_math_solved',
            title: 'Solved Exercises',
            description: 'All textbook exercises with step-by-step solutions',
            type: 'solved',
            fileUrl: '/notes/9th/mathematics/exercises.pdf',
            downloadCount: 3100,
            lastUpdated: '2026-02-19',
            fileSize: '5.2 MB'
          },
          {
            id: '9th_math_revision',
            title: 'Quick Revision',
            description: 'Key formulas, theorems, and important questions',
            type: 'revision',
            fileUrl: '/notes/9th/mathematics/revision.pdf',
            downloadCount: 4500,
            lastUpdated: '2026-02-21',
            fileSize: '1.4 MB'
          }
        ]
      }
    ]
  },
  '10th': {
    classId: '10th',
    className: '10th Class',
    subjects: [
      {
        subjectId: 'english',
        subjectName: 'English',
        icon: 'BookOpen',
        color: '#E91E63',
        chapters: 10,
        notes: [
          {
            id: '10th_eng_mcq',
            title: 'Textbook MCQs',
            description: 'Chapter-wise multiple choice questions',
            type: 'mcq',
            fileUrl: '/notes/10th/english/mcqs.pdf',
            downloadCount: 1350,
            lastUpdated: '2026-02-20',
            fileSize: '2.5 MB'
          },
          {
            id: '10th_eng_short',
            title: 'Short Questions Notes',
            description: 'Important short questions with answers',
            type: 'short',
            fileUrl: '/notes/10th/english/short-questions.pdf',
            downloadCount: 920,
            lastUpdated: '2026-02-18',
            fileSize: '1.9 MB'
          },
          {
            id: '10th_eng_long',
            title: 'Long Questions Notes',
            description: 'Comprehensive long questions and essays',
            type: 'long',
            fileUrl: '/notes/10th/english/long-questions.pdf',
            downloadCount: 680,
            lastUpdated: '2026-02-15',
            fileSize: '3.4 MB'
          },
          {
            id: '10th_eng_complete',
            title: 'Complete Notes',
            description: 'Full syllabus coverage',
            type: 'complete',
            fileUrl: '/notes/10th/english/complete.pdf',
            downloadCount: 2300,
            lastUpdated: '2026-02-22',
            fileSize: '8.8 MB'
          },
          {
            id: '10th_eng_solved',
            title: 'Solved Exercises',
            description: 'All exercises with answers',
            type: 'solved',
            fileUrl: '/notes/10th/english/exercises.pdf',
            downloadCount: 1700,
            lastUpdated: '2026-02-19',
            fileSize: '4.3 MB'
          },
          {
            id: '10th_eng_revision',
            title: 'Quick Revision',
            description: 'Key grammar and writing tips',
            type: 'revision',
            fileUrl: '/notes/10th/english/revision.pdf',
            downloadCount: 3400,
            lastUpdated: '2026-02-21',
            fileSize: '1.3 MB'
          }
        ]
      },
      {
        subjectId: 'physics',
        subjectName: 'Physics',
        icon: 'Atom',
        color: '#9C27B0',
        chapters: 9,
        notes: [
          {
            id: '10th_phy_mcq',
            title: 'Textbook MCQs',
            description: 'Chapter-wise multiple choice questions',
            type: 'mcq',
            fileUrl: '/notes/10th/physics/mcqs.pdf',
            downloadCount: 1900,
            lastUpdated: '2026-02-20',
            fileSize: '2.2 MB'
          },
          {
            id: '10th_phy_short',
            title: 'Short Questions Notes',
            description: 'Important short questions with answers',
            type: 'short',
            fileUrl: '/notes/10th/physics/short-questions.pdf',
            downloadCount: 1300,
            lastUpdated: '2026-02-18',
            fileSize: '1.7 MB'
          },
          {
            id: '10th_phy_long',
            title: 'Long Questions Notes',
            description: 'Numericals and derivations',
            type: 'long',
            fileUrl: '/notes/10th/physics/long-questions.pdf',
            downloadCount: 850,
            lastUpdated: '2026-02-15',
            fileSize: '3.2 MB'
          },
          {
            id: '10th_phy_complete',
            title: 'Complete Notes',
            description: 'Full syllabus with formulas',
            type: 'complete',
            fileUrl: '/notes/10th/physics/complete.pdf',
            downloadCount: 3100,
            lastUpdated: '2026-02-22',
            fileSize: '8.1 MB'
          },
          {
            id: '10th_phy_solved',
            title: 'Solved Exercises',
            description: 'All textbook problems with solutions',
            type: 'solved',
            fileUrl: '/notes/10th/physics/exercises.pdf',
            downloadCount: 2400,
            lastUpdated: '2026-02-19',
            fileSize: '4.8 MB'
          },
          {
            id: '10th_phy_revision',
            title: 'Quick Revision',
            description: 'Key formulas and laws',
            type: 'revision',
            fileUrl: '/notes/10th/physics/revision.pdf',
            downloadCount: 4100,
            lastUpdated: '2026-02-21',
            fileSize: '1.2 MB'
          }
        ]
      },
      {
        subjectId: 'chemistry',
        subjectName: 'Chemistry',
        icon: 'FlaskConical',
        color: '#FF9800',
        chapters: 8,
        notes: [
          {
            id: '10th_chem_mcq',
            title: 'Textbook MCQs',
            description: 'Chapter-wise multiple choice questions',
            type: 'mcq',
            fileUrl: '/notes/10th/chemistry/mcqs.pdf',
            downloadCount: 1700,
            lastUpdated: '2026-02-20',
            fileSize: '2.0 MB'
          },
          {
            id: '10th_chem_short',
            title: 'Short Questions Notes',
            description: 'Important short questions with answers',
            type: 'short',
            fileUrl: '/notes/10th/chemistry/short-questions.pdf',
            downloadCount: 1150,
            lastUpdated: '2026-02-18',
            fileSize: '1.5 MB'
          },
          {
            id: '10th_chem_long',
            title: 'Long Questions Notes',
            description: 'Chemical equations and reactions',
            type: 'long',
            fileUrl: '/notes/10th/chemistry/long-questions.pdf',
            downloadCount: 750,
            lastUpdated: '2026-02-15',
            fileSize: '2.7 MB'
          },
          {
            id: '10th_chem_complete',
            title: 'Complete Notes',
            description: 'Full syllabus with reactions',
            type: 'complete',
            fileUrl: '/notes/10th/chemistry/complete.pdf',
            downloadCount: 2700,
            lastUpdated: '2026-02-22',
            fileSize: '7.0 MB'
          },
          {
            id: '10th_chem_solved',
            title: 'Solved Exercises',
            description: 'All textbook exercises with solutions',
            type: 'solved',
            fileUrl: '/notes/10th/chemistry/exercises.pdf',
            downloadCount: 2000,
            lastUpdated: '2026-02-19',
            fileSize: '4.0 MB'
          },
          {
            id: '10th_chem_revision',
            title: 'Quick Revision',
            description: 'Periodic table and key reactions',
            type: 'revision',
            fileUrl: '/notes/10th/chemistry/revision.pdf',
            downloadCount: 3600,
            lastUpdated: '2026-02-21',
            fileSize: '1.1 MB'
          }
        ]
      },
      {
        subjectId: 'biology',
        subjectName: 'Biology',
        icon: 'Leaf',
        color: '#4CAF50',
        chapters: 10,
        notes: [
          {
            id: '10th_bio_mcq',
            title: 'Textbook MCQs',
            description: 'Chapter-wise multiple choice questions',
            type: 'mcq',
            fileUrl: '/notes/10th/biology/mcqs.pdf',
            downloadCount: 1500,
            lastUpdated: '2026-02-20',
            fileSize: '2.1 MB'
          },
          {
            id: '10th_bio_short',
            title: 'Short Questions Notes',
            description: 'Important short questions with answers',
            type: 'short',
            fileUrl: '/notes/10th/biology/short-questions.pdf',
            downloadCount: 1000,
            lastUpdated: '2026-02-18',
            fileSize: '1.6 MB'
          },
          {
            id: '10th_bio_long',
            title: 'Long Questions Notes',
            description: 'Detailed long questions and diagrams',
            type: 'long',
            fileUrl: '/notes/10th/biology/long-questions.pdf',
            downloadCount: 700,
            lastUpdated: '2026-02-15',
            fileSize: '3.1 MB'
          },
          {
            id: '10th_bio_complete',
            title: 'Complete Notes',
            description: 'Full syllabus with diagrams',
            type: 'complete',
            fileUrl: '/notes/10th/biology/complete.pdf',
            downloadCount: 2400,
            lastUpdated: '2026-02-22',
            fileSize: '7.5 MB'
          },
          {
            id: '10th_bio_solved',
            title: 'Solved Exercises',
            description: 'All textbook questions with solutions',
            type: 'solved',
            fileUrl: '/notes/10th/biology/exercises.pdf',
            downloadCount: 1800,
            lastUpdated: '2026-02-19',
            fileSize: '4.2 MB'
          },
          {
            id: '10th_bio_revision',
            title: 'Quick Revision',
            description: 'Key definitions and diagrams',
            type: 'revision',
            fileUrl: '/notes/10th/biology/revision.pdf',
            downloadCount: 3100,
            lastUpdated: '2026-02-21',
            fileSize: '1.4 MB'
          }
        ]
      },
      {
        subjectId: 'mathematics',
        subjectName: 'Mathematics',
        icon: 'Calculator',
        color: '#2196F3',
        chapters: 11,
        notes: [
          {
            id: '10th_math_mcq',
            title: 'Textbook MCQs',
            description: 'Chapter-wise multiple choice questions',
            type: 'mcq',
            fileUrl: '/notes/10th/mathematics/mcqs.pdf',
            downloadCount: 2400,
            lastUpdated: '2026-02-20',
            fileSize: '2.4 MB'
          },
          {
            id: '10th_math_short',
            title: 'Short Questions Notes',
            description: 'Important short questions with answers',
            type: 'short',
            fileUrl: '/notes/10th/mathematics/short-questions.pdf',
            downloadCount: 1600,
            lastUpdated: '2026-02-18',
            fileSize: '1.8 MB'
          },
          {
            id: '10th_math_long',
            title: 'Long Questions Notes',
            description: 'Detailed long questions with solutions',
            type: 'long',
            fileUrl: '/notes/10th/mathematics/long-questions.pdf',
            downloadCount: 1050,
            lastUpdated: '2026-02-15',
            fileSize: '3.6 MB'
          },
          {
            id: '10th_math_complete',
            title: 'Complete Notes',
            description: 'Full syllabus with examples',
            type: 'complete',
            fileUrl: '/notes/10th/mathematics/complete.pdf',
            downloadCount: 4000,
            lastUpdated: '2026-02-22',
            fileSize: '9.2 MB'
          },
          {
            id: '10th_math_solved',
            title: 'Solved Exercises',
            description: 'All exercises with step-by-step solutions',
            type: 'solved',
            fileUrl: '/notes/10th/mathematics/exercises.pdf',
            downloadCount: 3300,
            lastUpdated: '2026-02-19',
            fileSize: '5.5 MB'
          },
          {
            id: '10th_math_revision',
            title: 'Quick Revision',
            description: 'Key formulas and theorems',
            type: 'revision',
            fileUrl: '/notes/10th/mathematics/revision.pdf',
            downloadCount: 4800,
            lastUpdated: '2026-02-21',
            fileSize: '1.5 MB'
          }
        ]
      },
      {
        subjectId: 'computer',
        subjectName: 'Computer',
        icon: 'Laptop',
        color: '#607D8B',
        chapters: 12,
        notes: [
          {
            id: '10th_com_mcq',
            title: 'Textbook MCQs',
            description: 'Chapter-wise multiple choice questions',
            type: 'mcq',
            fileUrl: '/notes/10th/computer/mcqs.pdf',
            downloadCount: 2200,
            lastUpdated: '2026-02-20',
            fileSize: '1.9 MB'
          },
          {
            id: '10th_com_short',
            title: 'Short Questions Notes',
            description: 'Important short questions with answers',
            type: 'short',
            fileUrl: '/notes/10th/computer/short-questions.pdf',
            downloadCount: 1500,
            lastUpdated: '2026-02-18',
            fileSize: '1.6 MB'
          },
          {
            id: '10th_com_long',
            title: 'Long Questions Notes',
            description: 'Programming questions with code',
            type: 'long',
            fileUrl: '/notes/10th/computer/long-questions.pdf',
            downloadCount: 950,
            lastUpdated: '2026-02-15',
            fileSize: '3.0 MB'
          },
          {
            id: '10th_com_complete',
            title: 'Complete Notes',
            description: 'Full syllabus with programming',
            type: 'complete',
            fileUrl: '/notes/10th/computer/complete.pdf',
            downloadCount: 3600,
            lastUpdated: '2026-02-22',
            fileSize: '6.5 MB'
          },
          {
            id: '10th_com_solved',
            title: 'Solved Exercises',
            description: 'All programming exercises with solutions',
            type: 'solved',
            fileUrl: '/notes/10th/computer/exercises.pdf',
            downloadCount: 2900,
            lastUpdated: '2026-02-19',
            fileSize: '3.8 MB'
          },
          {
            id: '10th_com_revision',
            title: 'Quick Revision',
            description: 'Key concepts and syntax',
            type: 'revision',
            fileUrl: '/notes/10th/computer/revision.pdf',
            downloadCount: 4400,
            lastUpdated: '2026-02-21',
            fileSize: '1.0 MB'
          }
        ]
      }
    ]
  }
};

export const getNotesByClass = (classId: string): ClassNotesData | undefined => {
  return NOTES_DATA[classId];
};

export const getAllNotes = (): ClassNotesData[] => {
  return Object.values(NOTES_DATA);
};

export const getNoteTypeInfo = (type: NoteType) => {
  const noteTypes = {
    mcq: { icon: 'FileQuestion', label: 'MCQs', color: '#3B82F6' },
    short: { icon: 'FileText', label: 'Short Questions', color: '#8B5CF6' },
    long: { icon: 'Files', label: 'Long Questions', color: '#EC4899' },
    complete: { icon: 'BookLock', label: 'Complete Notes', color: '#10B981' },
    solved: { icon: 'CheckCircle', label: 'Solved Exercises', color: '#F59E0B' },
    revision: { icon: 'Zap', label: 'Quick Revision', color: '#EF4444' }
  };
  return noteTypes[type];
};
