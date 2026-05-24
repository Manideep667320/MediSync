const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Resolve writable uploads directory (Vercel's /tmp in prod)
const useTmpDir = process.env.VERCEL === '1' || process.env.SERVERLESS_ENV === 'true';
const uploadsDir = useTmpDir
  ? path.join('/tmp', 'uploads')
  : path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create subdirectories
const dirs = ['prescriptions', 'profiles', 'signatures'];
dirs.forEach(dir => {
  const dirPath = path.join(uploadsDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'prescriptions';
    
    if (file.fieldname === 'profileImage') {
      folder = 'profiles';
    } else if (file.fieldname === 'signature') {
      folder = 'signatures';
    }
    
    cb(null, path.join(uploadsDir, folder));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|heic|heif|pdf|txt|text/i;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'text/plain';

  if (extname || mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only images, PDFs, and text files (.txt) are allowed!'));
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  },
  fileFilter: fileFilter
});

module.exports = upload;
