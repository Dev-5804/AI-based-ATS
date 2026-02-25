/**
 * Extract text from a PDF file buffer
 */
export async function extractTextFromPdf(fileBuffer) {
  try {
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(fileBuffer);
    return data.text.trim();
  } catch (error) {
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

/**
 * Extract text from a DOCX file buffer
 */
export async function extractTextFromDocx(fileBuffer) {
  try {
    // Using JSZip to read the DOCX file (which is a ZIP archive)
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    const loaded = await zip.loadAsync(fileBuffer);

    let text = "";

    // Extract text from document.xml
    const documentXml = loaded.file("word/document.xml");
    if (documentXml) {
      const xmlContent = await documentXml.async("string");
      // Extract all text elements from the XML
      const matches = xmlContent.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
      if (matches) {
        text = matches
          .map((match) => match.replace(/<w:t[^>]*>|<\/w:t>/g, ""))
          .join(" ");
      }
    }

    return text.trim();
  } catch (error) {
    throw new Error(`Failed to extract text from DOCX: ${error.message}`);
  }
}

/**
 * Extract text from file asynchronously based on file extension
 */
export async function extractTextAsync(filename, fileBuffer) {
  const lowerName = filename.toLowerCase();

  if (lowerName.endsWith(".pdf")) {
    return await extractTextFromPdf(fileBuffer);
  } else if (lowerName.endsWith(".docx")) {
    return await extractTextFromDocx(fileBuffer);
  } else if (lowerName.endsWith(".txt")) {
    return fileBuffer.toString("utf-8", 0, fileBuffer.length);
  } else {
    throw new Error(
      `Unsupported file format: ${filename}. Please upload PDF, DOCX, or TXT files.`
    );
  }
}
