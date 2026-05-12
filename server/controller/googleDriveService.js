import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const SCOPES = ['https://www.googleapis.com/auth/drive'];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let auth;
if (process.env.NODE_ENV === 'production') {
  // Load credentials from environment variable
  const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n'); 
  auth = new google.auth.GoogleAuth({
    credentials: serviceAccount,
    scopes: SCOPES,
  });
} else {
  // Load credentials from a local service.json file for development
  const KEYFILEPATH = path.join(__dirname, '../service.json');
  auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
  });
}

const drive = google.drive({ version: 'v3', auth });

/**
 * Create a folder on Google Drive.
 */
export async function createFolder(name, parentId = null) {
  const fileMetadata = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
    ...(parentId && { parents: [parentId] }),
  };

  const folder = await drive.files.create({
    resource: fileMetadata,
    fields: 'id, name',
  });
  return folder.data;
}

/**
 * Find a folder by name under a specific parent.
 */
export async function findFolder(name, parentId = null) {
  let query = `mimeType='application/vnd.google-apps.folder' and name='${name}' and trashed=false`;
  if (parentId) {
    query += ` and '${parentId}' in parents`;
  }
  const res = await drive.files.list({
    q: query,
    fields: 'files(id, name)',
  });
  return res.data.files && res.data.files.length > 0 ? res.data.files[0] : null;
}

/**
 * Create or retrieve the folder structure:
 *  - Main folder (e.g. "The Uniques 2.0")
 *  - Student folder (using the student ID) inside the main folder
 *  - One or more subfolders (e.g. "certificate", "achievement", "profile") inside the student folder
 */
export async function createFolderStructure(mainFolderName, studentId, subfolders = []) {
  // Main folder
  let mainFolder = await findFolder(mainFolderName);
  if (!mainFolder) {
    mainFolder = await createFolder(mainFolderName);
  }
  // Student-specific folder inside the main folder
  let studentFolder = await findFolder(studentId, mainFolder.id);
  if (!studentFolder) {
    studentFolder = await createFolder(studentId, mainFolder.id);
  }
  // Create subfolders inside the student folder
  const createdSubfolders = {};
  for (const subfolderName of subfolders) {
    let subfolder = await findFolder(subfolderName, studentFolder.id);
    if (!subfolder) {
      subfolder = await createFolder(subfolderName, studentFolder.id);
    }
    createdSubfolders[subfolderName] = subfolder;
  }
  return {
    mainFolder,
    studentFolder,
    subfolders: createdSubfolders,
  };
}
/**
 * Upload a file to a specific folder on Google Drive with improved naming.
 * @param {string} filePath - Path to the local file
 * @param {string} destinationFolderId - Google Drive folder ID
 * @param {Object} options - Optional parameters for file naming
 * @param {string} options.studentId - Student ID for context
 * @param {string} options.category - Category/subfolder name (certificate, profile, etc.)
 * @param {string} options.customPrefix - Optional custom prefix
 * @returns {Object} File details including name, ID and URL
 */
export async function uploadFile(filePath, destinationFolderId, options = {}) {
  const { studentId, category, customPrefix } = options;
  
  // Get original filename and split into name and extension
  const originalFileName = path.basename(filePath);
  const fileExt = path.extname(originalFileName);
  const fileNameWithoutExt = path.basename(originalFileName, fileExt);
  
  // Create timestamp for uniqueness
  const timestamp = new Date().toISOString().replace(/[:.-]/g, '').slice(0, 14);
  
  // Build new filename with context information
  let newFileName = '';
  
  if (studentId) {
    newFileName += `${studentId}_`;
  }
  
  if (category) {
    newFileName += `${category}_`;
  }
  
  if (customPrefix) {
    newFileName += `${customPrefix}_`;
  }
  
  // Add sanitized original name and timestamp
  newFileName += `${fileNameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '')}_${timestamp}${fileExt}`;
  
  const fileMetadata = {
    name: newFileName,
    parents: [destinationFolderId],
  };
  
  const media = {
    body: fs.createReadStream(filePath),
  };

  // Upload the file
  const file = await drive.files.create({
    resource: fileMetadata,
    media,
    fields: 'id, name',
  });
  
  // Set permission to "anyone with the link can view"
  await drive.permissions.create({
    fileId: file.data.id,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    }
  });
  
  // Get the shareable web link
  const getFile = await drive.files.get({
    fileId: file.data.id,
    fields: '*',
    supportsAllDrives: true,
  });

  const fileId = file.data.id;
  let fileUrl;


  // Try to get the permanent thumbnail from contentHints
  if (getFile.data.contentHints && 
      getFile.data.contentHints.thumbnail && 
      getFile.data.contentHints.thumbnail.image) {
    // This is a base64 encoded image that won't expire
    const thumbnailImage = getFile.data.contentHints.thumbnail.image;
    fileUrl = `data:image/png;base64,${thumbnailImage}`;
  }else if (getFile.data.webContentLink) {
    // Fallback to the webViewLink if thumbnail is not available
    fileUrl = getFile.data.webContentLink;
  }

  return {
    fileName: file.data.name,
    originalName: originalFileName,
    fileId,
    fileUrl,
  };
}

// Add this export if not already present
export async function getAuth() {
  // Return the same auth object you use for other Drive operations
  return auth;
}