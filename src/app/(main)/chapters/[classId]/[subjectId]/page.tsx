import ChaptersClient from './ChaptersClient';

export function generateStaticParams() {
  const classes = ['9th', '10th', '11th', '12th'];
  const subjects = ['english', 'mathematics', 'physics', 'chemistry', 'biology', 'computer'];
  
  const params: { classId: string; subjectId: string }[] = [];
  
  classes.forEach(classId => {
    subjects.forEach(subjectId => {
      params.push({ classId, subjectId });
    });
  });
  
  return params;
}

export default async function ChaptersPage({ 
  params 
}: { 
  params: Promise<{ classId: string; subjectId: string }> 
}) {
  await params;
  return <ChaptersClient />;
}
