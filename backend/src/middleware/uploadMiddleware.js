
import multer from "multer";
import path from "path";

const allowedExtensions = [".pdf", ".docx", ".txt"];

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 1,
  },

  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      return callback(
        new Error("Only PDF, DOCX and TXT files are supported.")
      );
    }

    callback(null, true);
  },
});

export default upload;
