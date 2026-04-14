import multer from 'multer';

const storage = multer.memoryStorage();

// Single upload for cases like Company Logo (where key is "file")
export const singleUpload = multer({ storage }).single("file");

export const profileUpload = multer({ storage }).fields([
    { name: 'resume', maxCount: 1 },
    { name: 'photo', maxCount: 1 }
]);