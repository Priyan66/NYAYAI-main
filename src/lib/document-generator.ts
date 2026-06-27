import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

export async function generateWordDocument(
  legalNotice: string,
  forumComplaint: string,
  caseName: string
): Promise<Buffer> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: 'LEGAL NOTICE',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: caseName,
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: '' }),
          ...legalNotice.split('\n').map(
            (line) =>
              new Paragraph({
                children: [new TextRun({ text: line, size: 24 })],
              })
          ),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: '---',
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: 'FORUM COMPLAINT',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: '' }),
          ...forumComplaint.split('\n').map(
            (line) =>
              new Paragraph({
                children: [new TextRun({ text: line, size: 24 })],
              })
          ),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}
