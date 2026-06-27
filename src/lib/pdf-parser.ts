import { UploadedDocument } from '@/types';

export async function parseUploadedFile(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<UploadedDocument> {
  const base: Omit<UploadedDocument, 'extractedText' | 'parseSuccess'> = {
    name: filename,
    type: mimeType,
    size: buffer.length,
  };

  try {
    if (mimeType === 'application/pdf') {
      const { PDFParse } = await import('pdf-parse');
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      const data = await parser.getText();
      await parser.destroy();
      return {
        ...base,
        extractedText: data.text,
        parseSuccess: true,
      };
    }

    if (mimeType === 'text/plain') {
      return {
        ...base,
        extractedText: buffer.toString('utf-8'),
        parseSuccess: true,
      };
    }

    return {
      ...base,
      extractedText: `[File: ${filename} - text extraction not available for this format. Upload PDF or TXT for best results.]`,
      parseSuccess: false,
    };
  } catch (error) {
    console.error('PDF parse error:', error);
    return {
      ...base,
      extractedText: '',
      parseSuccess: false,
    };
  }
}
