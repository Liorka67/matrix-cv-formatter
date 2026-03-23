import { Request, Response } from 'express';
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, BorderStyle } from 'docx';
import PDFDocument from 'pdfkit';
import { MatrixCV } from '../types';

export const generateDOCX = async (req: Request, res: Response): Promise<void> => {
  const { cv, language } = req.body as { cv: MatrixCV; language: 'he' | 'en' };

  if (!cv) {
    res.status(400).json({ success: false, error: 'CV data is required' });
    return;
  }

  const isHebrew = language === 'he';
  const alignment = isHebrew ? AlignmentType.RIGHT : AlignmentType.LEFT;
  const paragraphs: Paragraph[] = [];

  const heading = (text: string) => new Paragraph({
    children: [new TextRun({ text, bold: true, size: 28, color: '2c3e50', rightToLeft: isHebrew })],
    alignment,
    bidirectional: isHebrew,
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'bdc3c7', space: 4 } },
    spacing: { before: 240, after: 120 },
  });

  const body = (text: string, opts: { bold?: boolean; size?: number; color?: string } = {}) => new Paragraph({
    children: [new TextRun({ text, bold: opts.bold, size: opts.size || 22, color: opts.color || '333333', rightToLeft: isHebrew })],
    alignment,
    bidirectional: isHebrew,
    spacing: { after: 80 },
  });

  const spacer = () => new Paragraph({
    children: [],
    bidirectional: isHebrew,
  });

  // Name
  if (cv.personal_details?.name) {
    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: cv.personal_details.name, bold: true, size: 48, color: '2c3e50', rightToLeft: isHebrew })],
      alignment,
      bidirectional: isHebrew,
      spacing: { after: 80 },
    }));
  }

  // Contact info
  const contacts = [
    cv.personal_details?.email,
    cv.personal_details?.phone,
    cv.personal_details?.linkedin,
  ].filter(Boolean).join('  |  ');

  if (contacts) {
    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: contacts, size: 20, color: '7f8c8d', rightToLeft: isHebrew })],
      alignment,
      bidirectional: isHebrew,
      spacing: { after: 200 },
    }));
  }

  // Summary
  if (cv.summary) {
    paragraphs.push(heading(isHebrew ? 'פרופיל' : 'Summary'));
    paragraphs.push(body(cv.summary));
    paragraphs.push(spacer());
  }

  // Experience
  if (cv.experience?.length > 0) {
    paragraphs.push(heading(isHebrew ? 'ניסיון תעסוקתי' : 'Experience'));
    for (const exp of cv.experience) {
      const title = [exp.role, exp.company, exp.years].filter(Boolean).join('  |  ');
      paragraphs.push(body(title, { bold: true, size: 24 }));
      if (exp.description) paragraphs.push(body(exp.description));
      paragraphs.push(spacer());
    }
  }

  // Skills
  if (cv.skills?.length > 0) {
    paragraphs.push(heading(isHebrew ? 'כישורים' : 'Skills'));
    paragraphs.push(body(cv.skills.join('  |  ')));
    paragraphs.push(spacer());
  }

  // Education
  if (cv.education?.length > 0) {
    paragraphs.push(heading(isHebrew ? 'השכלה' : 'Education'));
    for (const edu of cv.education) {
      const title = [edu.degree, edu.institution, edu.year].filter(Boolean).join('  |  ');
      paragraphs.push(body(title, { bold: true, size: 24 }));
      if (edu.details) paragraphs.push(body(edu.details));
      paragraphs.push(spacer());
    }
  }

  // Languages
  if (cv.languages?.length > 0) {
    paragraphs.push(heading(isHebrew ? 'שפות' : 'Languages'));
    paragraphs.push(body(cv.languages.map(l => `${l.name} (${l.level})`).join('  |  ')));
    paragraphs.push(spacer());
  }

  // Additional
  if (cv.additional) {
    paragraphs.push(heading(isHebrew ? 'מידע נוסף' : 'Additional'));
    paragraphs.push(body(cv.additional));
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children: paragraphs,
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const safeName = (cv.personal_details?.name || 'CV').replace(/[^a-zA-Z0-9א-ת\s]/g, '').replace(/\s+/g, '_');
  const filename = `CV_${safeName}.docx`;

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
  res.send(buffer);
};

export const generatePDF = async (req: Request, res: Response): Promise<void> => {
  const { cv, language } = req.body as { cv: MatrixCV; language: 'he' | 'en' };

  if (!cv) {
    res.status(400).json({ success: false, error: 'CV data is required' });
    return;
  }

  const isHebrew = language === 'he';
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  const safeName = (cv.personal_details?.name || 'CV').replace(/[^a-zA-Z0-9א-ת\s]/g, '').replace(/\s+/g, '_');
  const filename = `CV_${safeName}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
  doc.pipe(res);

  const pageWidth = doc.page.width - 100;
  const textAlign = isHebrew ? 'right' : 'left';

  const addHeading = (text: string) => {
    doc.moveDown(0.5)
      .fontSize(14)
      .fillColor('#2c3e50')
      .font('Helvetica-Bold')
      .text(text, { align: textAlign, width: pageWidth });
    const y = doc.y + 2;
    doc.moveTo(50, y).lineTo(doc.page.width - 50, y).strokeColor('#bdc3c7').stroke();
    doc.moveDown(0.4);
  };

  const addText = (text: string, opts: { bold?: boolean; size?: number; color?: string } = {}) => {
    doc.fontSize(opts.size || 11)
      .fillColor(opts.color || '#333333')
      .font(opts.bold ? 'Helvetica-Bold' : 'Helvetica')
      .text(text, { align: textAlign, width: pageWidth });
  };

  // Name
  if (cv.personal_details?.name) {
    doc.fontSize(22).fillColor('#2c3e50').font('Helvetica-Bold')
      .text(cv.personal_details.name, { align: textAlign, width: pageWidth });
  }

  // Contact
  const contacts = [
    cv.personal_details?.email,
    cv.personal_details?.phone,
    cv.personal_details?.linkedin,
  ].filter(Boolean).join('  |  ');

  if (contacts) {
    doc.fontSize(10).fillColor('#7f8c8d').font('Helvetica')
      .text(contacts, { align: textAlign, width: pageWidth });
  }

  // Summary
  if (cv.summary) {
    addHeading(isHebrew ? 'פרופיל' : 'Summary');
    addText(cv.summary);
  }

  // Experience
  if (cv.experience?.length > 0) {
    addHeading(isHebrew ? 'ניסיון תעסוקתי' : 'Experience');
    for (const exp of cv.experience) {
      const title = [exp.role, exp.company, exp.years].filter(Boolean).join('  |  ');
      addText(title, { bold: true, size: 12 });
      if (exp.description) addText(exp.description, { size: 10 });
      doc.moveDown(0.3);
    }
  }

  // Skills
  if (cv.skills?.length > 0) {
    addHeading(isHebrew ? 'כישורים' : 'Skills');
    addText(cv.skills.join('  |  '));
  }

  // Education
  if (cv.education?.length > 0) {
    addHeading(isHebrew ? 'השכלה' : 'Education');
    for (const edu of cv.education) {
      const title = [edu.degree, edu.institution, edu.year].filter(Boolean).join('  |  ');
      addText(title, { bold: true, size: 12 });
      if (edu.details) addText(edu.details, { size: 10 });
      doc.moveDown(0.3);
    }
  }

  // Languages
  if (cv.languages?.length > 0) {
    addHeading(isHebrew ? 'שפות' : 'Languages');
    addText(cv.languages.map(l => `${l.name} (${l.level})`).join('  |  '));
  }

  // Additional
  if (cv.additional) {
    addHeading(isHebrew ? 'מידע נוסף' : 'Additional');
    addText(cv.additional);
  }

  doc.end();
};
