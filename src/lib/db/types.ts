export interface Question {
  id: string;
  class_id: string;
  subject_id: string;
  chapter_id: string;
  type: 'mcq' | 'short' | 'long' | 'essay' | 'grammar' | 'letter' | 'comprehension';
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  question_text: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  correct_option?: number;
  answer_text?: string;
  metadata_json?: string;
}

export interface Paper {
  id: string;
  title: string;
  class_id: string;
  subject_id: string;
  exam_type: string;
  date: string;
  time_allowed: string;
  total_marks: number;
  question_count: number;
  mcq_ids: string[];
  short_ids: string[];
  long_ids: string[];
  settings_json?: string;
  created_at: number;
}

export interface PaperConfig {
  classId: string;
  subjectId: string;
  chapterIds: string[];
  mcqCount: number;
  shortCount: number;
  longCount: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  excludeIds?: string[];
  seed?: number;
}
