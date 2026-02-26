"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Plus, Search, Filter, Edit, Trash2, 
  Eye, EyeOff, Check, X, FileText, HelpCircle, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppLoader } from "@/components/shared";
import { supabase } from "@/lib/supabase/client";
import { CLASSES, SUBJECTS } from "@/constants";

interface Question {
  id: string;
  class_id: string;
  subject: string;
  chapter: string;
  question_type: 'mcq' | 'short' | 'long';
  question_text: string;
  options: string[] | null;
  correct_option: number | null;
  marks: number;
  difficulty: 'easy' | 'medium' | 'hard';
  is_active: boolean;
  created_at: string;
}

export default function AdminQuestionsPage() {
  const router = useRouter();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterClass, setFilterClass] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.replace("/admin");
      return;
    }
    setIsAuthenticated(true);
    fetchQuestions();
  }, [router]);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching questions:', error);
        return;
      }

      setQuestions((data as Question[]) || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleQuestionStatus = async (question: Question) => {
    try {
      const { error } = await supabase
        .from('questions')
        .update({ is_active: !question.is_active })
        .eq('id', question.id);

      if (error) {
        console.error('Error updating question:', error);
        return;
      }

      setQuestions(questions.map(q => 
        q.id === question.id ? { ...q, is_active: !q.is_active } : q
      ));
    } catch (error) {
      console.error('Error updating question:', error);
    }
  };

  const deleteQuestion = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

      if (error) {
        console.error('Error deleting question:', error);
        return;
      }

      setQuestions(questions.filter(q => q.id !== questionId));
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.question_text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || q.question_type === filterType;
    const matchesClass = filterClass === "all" || q.class_id === filterClass;
    return matchesSearch && matchesType && matchesClass;
  });

  if (isLoading || isAuthenticated === null) {
    return <AppLoader message="Loading questions..." />;
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/admin")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Question Bank</h1>
                <p className="text-sm text-gray-500">{questions.length} questions</p>
              </div>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-[#1E88E5] hover:bg-[#1565C0]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-3 mt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions..."
                className="pl-9"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="all">All Types</option>
              <option value="mcq">MCQ</option>
              <option value="short">Short</option>
              <option value="long">Long</option>
            </select>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="all">All Classes</option>
              {CLASSES.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="space-y-3">
          {filteredQuestions.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-xl p-4 border ${
                question.is_active ? 'border-gray-200' : 'border-gray-100 opacity-60'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  question.question_type === 'mcq' ? 'bg-blue-100 text-blue-600' :
                  question.question_type === 'short' ? 'bg-green-100 text-green-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  {question.question_type === 'mcq' ? <FileText className="w-5 h-5" /> :
                   question.question_type === 'short' ? <HelpCircle className="w-5 h-5" /> :
                   <BookOpen className="w-5 h-5" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                      {question.class_id}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                      {question.subject}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                      Ch: {question.chapter}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      question.difficulty === 'easy' ? 'bg-green-100 text-green-600' :
                      question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {question.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 line-clamp-2">{question.question_text}</p>
                  {question.options && (
                    <div className="flex gap-2 mt-2 text-xs text-gray-500">
                      {question.options.map((opt, i) => (
                        <span key={i} className={`px-2 py-0.5 rounded ${
                          i === question.correct_option ? 'bg-green-50 text-green-600 font-medium' : 'bg-gray-50'
                        }`}>
                          {String.fromCharCode(65 + i)}: {opt}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleQuestionStatus(question)}
                    className="h-8 w-8"
                  >
                    {question.is_active ? (
                      <Eye className="w-4 h-4 text-gray-500" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingQuestion(question)}
                    className="h-8 w-8"
                  >
                    <Edit className="w-4 h-4 text-gray-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteQuestion(question.id)}
                    className="h-8 w-8 text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredQuestions.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No questions found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Question Modal */}
      <AnimatePresence>
        {(showAddModal || editingQuestion) && (
          <QuestionModal
            question={editingQuestion}
            onClose={() => {
              setShowAddModal(false);
              setEditingQuestion(null);
            }}
            onSave={() => {
              fetchQuestions();
              setShowAddModal(false);
              setEditingQuestion(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Question Modal Component
function QuestionModal({ 
  question, 
  onClose, 
  onSave 
}: { 
  question: Question | null; 
  onClose: () => void; 
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    class_id: question?.class_id || "9th",
    subject: question?.subject || "Physics",
    chapter: question?.chapter || "1",
    question_type: question?.question_type || "mcq" as 'mcq' | 'short' | 'long',
    question_text: question?.question_text || "",
    option_a: question?.options?.[0] || "",
    option_b: question?.options?.[1] || "",
    option_c: question?.options?.[2] || "",
    option_d: question?.options?.[3] || "",
    correct_option: question?.correct_option || 0,
    marks: question?.marks || 1,
    difficulty: question?.difficulty || "medium" as 'easy' | 'medium' | 'hard',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const options = formData.question_type === 'mcq' 
      ? [formData.option_a, formData.option_b, formData.option_c, formData.option_d]
      : null;

    const questionData = {
      class_id: formData.class_id,
      subject: formData.subject,
      chapter: formData.chapter,
      question_type: formData.question_type,
      question_text: formData.question_text,
      options,
      correct_option: formData.question_type === 'mcq' ? formData.correct_option : null,
      marks: Number(formData.marks),
      difficulty: formData.difficulty,
      is_active: true,
    };

    try {
      if (question) {
        const { error } = await supabase
          .from('questions')
          .update(questionData)
          .eq('id', question.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('questions')
          .insert([questionData]);
        
        if (error) throw error;
      }

      onSave();
    } catch (error) {
      console.error('Error saving question:', error);
      alert('Failed to save question');
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {question ? 'Edit Question' : 'Add Question'}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Class</Label>
              <select
                value={formData.class_id}
                onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg mt-1"
              >
                {CLASSES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Subject</Label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg mt-1"
              >
                {SUBJECTS.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Chapter</Label>
              <Input
                value={formData.chapter}
                onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Type</Label>
              <select
                value={formData.question_type}
                onChange={(e) => setFormData({ ...formData, question_type: e.target.value as 'mcq' | 'short' | 'long' })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg mt-1"
              >
                <option value="mcq">MCQ (1 mark)</option>
                <option value="short">Short (2 marks)</option>
                <option value="long">Long (5 marks)</option>
              </select>
            </div>
            <div>
              <Label>Difficulty</Label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg mt-1"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <Label>Question Text</Label>
            <textarea
              value={formData.question_text}
              onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg mt-1 min-h-[100px]"
              placeholder="Enter question text... Use $math$ for math expressions"
              required
            />
          </div>

          {formData.question_type === 'mcq' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Option A</Label>
                  <Input
                    value={formData.option_a}
                    onChange={(e) => setFormData({ ...formData, option_a: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label>Option B</Label>
                  <Input
                    value={formData.option_b}
                    onChange={(e) => setFormData({ ...formData, option_b: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Option C</Label>
                  <Input
                    value={formData.option_c}
                    onChange={(e) => setFormData({ ...formData, option_c: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label>Option D</Label>
                  <Input
                    value={formData.option_d}
                    onChange={(e) => setFormData({ ...formData, option_d: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>
              </div>
              <div>
                <Label>Correct Option</Label>
                <select
                  value={formData.correct_option}
                  onChange={(e) => setFormData({ ...formData, correct_option: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg mt-1"
                >
                  <option value={0}>A</option>
                  <option value={1}>B</option>
                  <option value={2}>C</option>
                  <option value={3}>D</option>
                </select>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-[#1E88E5] hover:bg-[#1565C0]">
              {question ? 'Update' : 'Add'} Question
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
