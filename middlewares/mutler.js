import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'profilePhoto') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true); // Accept image files only
    } else {
      cb(new Error('Only image files are allowed for profile photo!'), false);
    }
  } else if (file.fieldname === 'resume') {
    const validMimeTypes = ['application/pdf'];
    if (validMimeTypes.includes(file.mimetype)) {
      cb(null, true); // Accept PDF for resume
    } else {
      cb(new Error('Only PDF or Word files are allowed for resume!'), false);
    }
  } else {
    cb(new Error('Unexpected field'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB file limit
}).fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'resume', maxCount: 1 }
]);

export const singleUpload = upload;
