/**
 * @file googleDriveService.js
 * @description Google Drive integration service providing directory structure creation, file uploads, permissions, and authentication clients.
 * @architecture Service helper used by file upload routes and proxy endpoints (`/upload`, `/api/image-proxy`) to persist documents and media in Google Drive.
 * @agent_note Requires valid service account credentials via `GOOGLE_SERVICE_ACCOUNT` or local `service.json`. Ensure Drive API scopes and folder permissions remain intact.
 */
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const SCOPES = ['https://www.googleapis.com/auth/drive'];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let auth = null;
let drive = null;

/**
 * Ensures Google Drive client and auth credentials are fully loaded across all execution contexts.
 * Supports lazy initialization in case dotenv was not yet populated during module import.
 * @returns {import('googleapis').drive_v3.Drive|null} Initialized Google Drive v3 client instance.
 */
export function getDrive() {
  if (drive) return drive;

  // Auto-load dotenv if not already present in environment
  if (!process.env.GOOGLE_SERVICE_ACCOUNT) {
    try {
      dotenv.config({ path: path.resolve(__dirname, '../.env') });
      dotenv.config({ path: path.resolve(__dirname, '../../.env') });
      dotenv.config();
    } catch (e) {
      // Fallback for custom bundled environments
    }
  }

  try {
    if (process.env.GOOGLE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n'); 
      auth = new google.auth.GoogleAuth({
        credentials: serviceAccount,
        scopes: SCOPES,
      });
      drive = google.drive({ version: 'v3', auth });
    } else {
      const KEYFILEPATH = path.join(__dirname, '../service.json');
      if (fs.existsSync(KEYFILEPATH)) {
        auth = new google.auth.GoogleAuth({
          keyFile: KEYFILEPATH,
          scopes: SCOPES,
        });
        drive = google.drive({ version: 'v3', auth });
      } else {
        console.warn('Warning: Google Drive credentials (service.json or GOOGLE_SERVICE_ACCOUNT) not found. Drive features will be disabled.');
      }
    }
  } catch (error) {
    console.error('Error initializing Google Drive service:', error);
  }

  return drive;
}

// Initial attempt (e.g. if env already set)
getDrive();

/**
 * @desc    Create a folder on Google Drive
 * @param   {string} name - Name of the folder to create
 * @param   {string|null} [parentId=null] - Optional parent folder ID
 * @returns {Promise<Object>} Created Google Drive folder metadata containing id and name
 * @throws  {Error} When Google Drive service is uninitialized or API call fails
 */
export async function createFolder(name, parentId = null) {
  const fileMetadata = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
    ...(parentId && { parents: [parentId] }),
  };

  const driveClient = getDrive();
  if (!driveClient) {
    throw new Error('Google Drive service not initialized. Check credentials.');
  }

  const folder = await driveClient.files.create({
    resource: fileMetadata,
    fields: 'id, name',
  });
  return folder.data;
}

/**
 * @desc    Find a folder by name under an optional parent folder
 * @param   {string} name - Name of folder to search for
 * @param   {string|null} [parentId=null] - Parent folder ID in Google Drive
 * @returns {Promise<Object|null>} Found folder object containing id and name or null if not found
 * @throws  {Error} When Google Drive service is uninitialized
 */
export async function findFolder(name, parentId = null) {
  let query = `mimeType='application/vnd.google-apps.folder' and name='${name}' and trashed=false`;
  if (parentId) {
    query += ` and '${parentId}' in parents`;
  }
  const driveClient = getDrive();
  if (!driveClient) {
    throw new Error('Google Drive service not initialized. Check credentials.');
  }

  const res = await driveClient.files.list({
    q: query,
    fields: 'files(id, name)',
  });
  return res.data.files && res.data.files.length > 0 ? res.data.files[0] : null;
}

/**
 * @desc    Create or retrieve a multi-tiered folder structure for student assets
 * @param   {string} mainFolderName - Main community root folder name (e.g. "The Uniques 2.0")
 * @param   {string} studentId - Student identifier used as directory name
 * @param   {string[]} [subfolders=[]] - Subfolder category names (e.g. "certificate", "achievement", "profile")
 * @returns {Promise<{mainFolder: Object, studentFolder: Object, subfolders: Object}>} Structured directory tree objects
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
 * @desc    Upload a file stream to a specific folder on Google Drive with sanitized contextual naming and public read permissions
 * @param   {string} filePath - Path to the local file
 * @param   {string} destinationFolderId - Google Drive folder ID
 * @param   {Object} [options={}] - Optional parameters for file naming
 * @param   {string} [options.studentId] - Student ID for context
 * @param   {string} [options.category] - Category/subfolder name (certificate, profile, etc.)
 * @param   {string} [options.customPrefix] - Optional custom prefix
 * @returns {Promise<{fileName: string, originalName: string, fileId: string, fileUrl: string}>} File details including name, ID, and permanent URL or data link
 * @throws  {Error} When Google Drive service is uninitialized or upload fails
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

  const driveClient = getDrive();
  if (!driveClient) {
    throw new Error('Google Drive service not initialized. Check credentials.');
  }

  // Upload the file
  const file = await driveClient.files.create({
    resource: fileMetadata,
    media,
    fields: 'id, name',
  });
  
  // Set permission to "anyone with the link can view"
  await driveClient.permissions.create({
    fileId: file.data.id,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    }
  });
  
  // Get the shareable web link
  const getFile = await driveClient.files.get({
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

/**
 * @desc    Get the initialized Google Auth client instance
 * @returns {Promise<Object|undefined>} Google Auth client configured with Drive scopes
 */
export async function getAuth() {
  getDrive();
  return auth;
}

/**
 * @desc    Safely delete a file from Google Drive
 * @param   {string} fileId - The ID of the file to delete
 * @returns {Promise<boolean>} True if deleted successfully, false otherwise
 */
export async function deleteFile(fileId) {
  if (!fileId) return false;
  const driveClient = getDrive();
  if (!driveClient) {
    console.warn('Warning: Google Drive client not initialized. Skipping file deletion on Drive.');
    return false;
  }
  try {
    await driveClient.files.delete({
      fileId,
      supportsAllDrives: true,
    });
    return true;
  } catch (error) {
    console.error(`Error deleting file ${fileId} from Google Drive:`, error.message);
    return false;
  }
}