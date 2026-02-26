import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  Packer,
  ImageRun,
} from 'docx';
import { saveAs } from 'file-saver';
import type { MCQQuestion, ShortQuestion, LongQuestion } from '@/types';
import { QUESTION_MARKS } from '@/types/question';

interface DOCXSettings {
  instituteName: string;
  instituteLogo?: string | null;
  examType: string;
  date: string;
  timeAllowed: string;
  classId: string;
  subject: string;
  customHeader?: string;
  customSubHeader?: string;
  showLogo?: boolean;
  includeAnswerSheet?: boolean;
}

export async function generateDOCX(
  settings: DOCXSettings,
  mcqs: MCQQuestion[],
  shorts: ShortQuestion[],
  longs: LongQuestion[]
): Promise<Blob> {
  const mcqMarks = mcqs.length * QUESTION_MARKS.mcq;
  const shortMarks = shorts.length * QUESTION_MARKS.short;
  const longMarks = longs.length * QUESTION_MARKS.long;
  const totalMarks = mcqMarks + shortMarks + longMarks;

  const children: (Paragraph | Table)[] = [];

  // Header Section
  if (settings.customHeader) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: settings.customHeader, size: 24, font: 'Times New Roman' })],
      })
    );
  }

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: settings.instituteName.toUpperCase(),
          bold: true,
          size: 36,
          font: 'Times New Roman',
        }),
      ],
    })
  );

  if (settings.customSubHeader) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: settings.customSubHeader, size: 22, font: 'Times New Roman' })],
      })
    );
  }

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: `${settings.subject.toUpperCase()} - CLASS ${settings.classId.toUpperCase()}`,
          bold: true,
          size: 28,
          font: 'Times New Roman',
        }),
      ],
    })
  );

  if (settings.examType) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [new TextRun({ text: settings.examType, italics: true, size: 22, font: 'Times New Roman' })],
      })
    );
  }

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
      },
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `Time: ${settings.timeAllowed}    Total Marks: ${totalMarks}    Date: ${settings.date}`,
          size: 20,
          font: 'Times New Roman',
        }),
      ],
    })
  );

  // Info Table (Name, Roll No)
  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 15, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: 'Name:', bold: true, size: 20 })] })],
            }),
            new TableCell({ width: { size: 35, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [] })] }),
            new TableCell({
              width: { size: 15, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: 'Roll No:', bold: true, size: 20 })] })],
            }),
            new TableCell({ width: { size: 35, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [] })] }),
          ],
        }),
      ],
    })
  );

  children.push(new Paragraph({ spacing: { before: 300 }, children: [] }));

  // Section A: MCQs
  if (mcqs.length > 0) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
        children: [new TextRun({ text: 'SECTION A: OBJECTIVE / MCQs', bold: true, size: 24, font: 'Times New Roman' })],
      })
    );

    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 150 },
        children: [new TextRun({ text: `(${mcqs.length} × ${QUESTION_MARKS.mcq} = ${mcqMarks} Marks)`, size: 20, font: 'Times New Roman' })],
      })
    );

    mcqs.forEach((mcq, index) => {
      // MCQ Question Header
      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 5, type: WidthType.PERCENTAGE },
                  shading: { fill: 'F0F0F0' },
                  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(index + 1), bold: true, size: 20 })] })],
                }),
                new TableCell({
                  width: { size: 95, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ children: [new TextRun({ text: mcq.questionText, size: 20 })] })],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  columnSpan: 2,
                  children: [
                    new Table({
                      width: { size: 100, type: WidthType.PERCENTAGE },
                      borders: {
                        top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                        left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
                        insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
                      },
                      rows: [
                        new TableRow({
                          children: (mcq.options || []).map((opt, i) =>
                            new TableCell({
                              width: { size: 25, type: WidthType.PERCENTAGE },
                              children: [new Paragraph({
                                children: [
                                  new TextRun({ text: `${String.fromCharCode(65 + i)}: `, bold: true, size: 18 }),
                                  new TextRun({ text: opt, size: 18 })
                                ]
                              })]
                            })
                          )
                        })
                      ]
                    })
                  ]
                })
              ]
            })
          ],
        })
      );
      children.push(new Paragraph({ spacing: { after: 100 }, children: [] }));
    });
  }

  // Subjective Part
  if (shorts.length > 0 || longs.length > 0) {
    children.push(
      new Paragraph({
        spacing: { before: 300 },
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: 'SUBJECTIVE PART', bold: true, size: 28, font: 'Times New Roman' })],
      })
    );

    if (shorts.length > 0) {
      children.push(
        new Paragraph({
          spacing: { before: 200, after: 100 },
          children: [new TextRun({ text: `Q1: SHORT QUESTIONS (Attempt ${shorts.length} = ${shortMarks} Marks)`, bold: true, size: 22, font: 'Times New Roman' })],
        })
      );

      shorts.forEach((sq, index) => {
        children.push(
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({ text: `${index + 1}. `, bold: true, size: 20, font: 'Times New Roman' }),
              new TextRun({ text: sq.questionText, size: 20, font: 'Times New Roman' }),
              new TextRun({ text: ` [${QUESTION_MARKS.short}]`, size: 16, font: 'Times New Roman', color: '666666' }),
            ],
          })
        );
      });
    }

    if (longs.length > 0) {
      children.push(
        new Paragraph({
          spacing: { before: 200, after: 100 },
          children: [new TextRun({ text: `Q2: LONG QUESTIONS (Attempt ${longs.length} = ${longMarks} Marks)`, bold: true, size: 22, font: 'Times New Roman' })],
        })
      );

      longs.forEach((lq, index) => {
        children.push(
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({ text: `${index + 1}. `, bold: true, size: 20, font: 'Times New Roman' }),
              new TextRun({ text: lq.questionText, size: 20, font: 'Times New Roman' }),
              new TextRun({ text: ` [${QUESTION_MARKS.long}]`, size: 16, font: 'Times New Roman', color: '666666' }),
            ],
          })
        );
      });
    }
  }

  // Footer
  children.push(
    new Paragraph({
      spacing: { before: 400 },
      alignment: AlignmentType.CENTER,
      border: { top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' } },
      children: [
        new TextRun({
          text: 'PaperPress App by Hamza Khan. - Email: paperpressapp@gmail.com',
          size: 16,
          font: 'Times New Roman',
          color: '666666',
          italics: true,
        }),
      ],
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 720, right: 720 }, // 0.5 inch margins
          },
        },
        children: children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

export async function downloadDOCX(
  settings: DOCXSettings,
  mcqs: MCQQuestion[],
  shorts: ShortQuestion[],
  longs: LongQuestion[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const blob = await generateDOCX(settings, mcqs, shorts, longs);
    const filename = `${settings.classId}_${settings.subject}_${settings.date.replace(/-/g, '')}.docx`;
    saveAs(blob, filename);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate DOCX',
    };
  }
}
