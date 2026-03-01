import { redirect } from 'next/navigation';

export default function SelectTemplatePage({ params }: { params: { classId: string; subjectId: string } }) {
  redirect(`/templates?class=${params.classId}&subject=${params.subjectId}`);
}
