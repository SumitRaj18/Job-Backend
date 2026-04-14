import DataURIParser from 'datauri/parser.js'
import path from 'path'

export const getDataUri = (file) => {
    const parser = new DataURIParser();
    // Ensure the extension includes the dot (e.g., .pdf)
    const extName = path.extname(file.originalname).toString();
    return parser.format(extName, file.buffer);
};