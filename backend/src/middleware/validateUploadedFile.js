
import path from "path";

const allowedTypes = {
  ".pdf": {
    mime: "application/pdf",
  },
  ".docx": {
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
  ".txt": {
    mime: "text/plain",
  },
};

const validateUploadedFile = (req, res, next) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Please select a document to upload.",
      });
    }

    const extension = path.extname(file.originalname).toLowerCase();
    const expectedType = allowedTypes[extension];

    if (!expectedType) {
      return res.status(400).json({
        success: false,
        message: "Only PDF, DOCX and TXT files are supported.",
      });
    }

    if (file.mimetype !== expectedType.mime) {
      return res.status(400).json({
        success: false,
        message: "The file type does not match its extension.",
      });
    }

    const buffer = file.buffer;

    if (extension === ".pdf") {
      // PDF signature must appear near the beginning of the file.
      const header = buffer.subarray(0, 1024).toString("latin1");

      if (!header.includes("%PDF-")) {
        return res.status(400).json({
          success: false,
          message: "Invalid PDF file.",
        });
      }
    }

    if (extension === ".docx") {
      // DOCX files are ZIP-based Office documents.
      const isZip =
        buffer.length >= 4 &&
        buffer[0] === 0x50 &&
        buffer[1] === 0x4b &&
        [0x03, 0x05, 0x07].includes(buffer[2]) &&
        [0x04, 0x06, 0x08].includes(buffer[3]);

      if (!isZip) {
        return res.status(400).json({
          success: false,
          message: "Invalid DOCX file.",
        });
      }
    }

    if (extension === ".txt") {
      // Reject binary files disguised as text.
      if (buffer.includes(0)) {
        return res.status(400).json({
          success: false,
          message: "Invalid text file.",
        });
      }

      // Verify that the contents are valid UTF-8.
      try {
        new TextDecoder("utf-8", { fatal: true }).decode(buffer);
      } catch {
        return res.status(400).json({
          success: false,
          message: "Text files must use UTF-8 encoding.",
        });
      }
    }

    next();
  } catch (error) {
    console.error("File validation error:", error.message);

    return res.status(400).json({
      success: false,
      message: "Unable to validate the uploaded file.",
    });
  }
};

export default validateUploadedFile;
