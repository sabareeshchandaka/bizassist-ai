
import multer from "multer";

const uploadErrorMiddleware = (error, req, res, next) => {
  if (!error) {
    return next();
  }

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        message: "File is too large. Maximum upload size is 5 MB.",
      });
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Only one document can be uploaded at a time.",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid file upload.",
    });
  }

  console.error("Upload middleware error:", error.message);

  return res.status(400).json({
    success: false,
    message: error.message || "Unable to upload this file.",
  });
};

export default uploadErrorMiddleware;
