/**
 * @file listFoldersAndFiles.js
 * @description Standalone CLI utility script to discover, inspect, and recursively list folders and files in Google Drive.
 * @architecture Diagnostic tool for verifying Google Drive service account permissions and folder tree hierarchy.
 * @agent_note Executes automatically on file execution (`main()`). Loads credentials from `process.env.GOOGLE_SERVICE_ACCOUNT` in production or `../service.json` in development.
 */
// listFoldersAndFiles.js
import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

// Create __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCOPES = ['https://www.googleapis.com/auth/drive'];

let auth;
if (process.env.NODE_ENV === 'production') {
  // In production, load credentials from environment variable
  const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
  auth = new google.auth.GoogleAuth({
    credentials: serviceAccount,
    scopes: SCOPES,
  });
} else {
  // In development, load credentials from local service.json
  const KEYFILEPATH = path.join(__dirname, '../service.json');
  auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
  });
}

const drive = google.drive({ version: 'v3', auth });

/**
 * @desc Queries Google Drive API to list all untrashed folders.
 * @async
 * @returns {Promise<Array<{id: string, name: string}>>} List of Google Drive folder objects
 */
async function listFolders() {
  try {
    const res = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.folder' and trashed=false",
      fields: 'files(id, name)',
    });
    return res.data.files;
  } catch (error) {
    console.error('Error listing folders:', error);
  }
}

/**
 * @desc Queries Google Drive API to list untrashed files contained inside a specified parent folder.
 * @async
 * @param {string} folderId - The ID of the target folder in Google Drive
 * @returns {Promise<Array<{id: string, name: string}>>} List of file objects located within the folder
 */
async function listFilesInFolder(folderId) {
  try {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name)',
    });
    return res.data.files;
  } catch (error) {
    console.error(`Error listing files in folder ${folderId}:`, error);
  }
}

/**
 * @desc Orchestrates discovery by listing all root folders and printing file contents per folder.
 * @async
 * @returns {Promise<void>}
 */
async function main() {
  const folders = await listFolders();
  console.log('Folders:');
  console.log(folders);

  if (folders && folders.length > 0) {
    for (const folder of folders) {
      console.log(`\nFiles in folder "${folder.name}" (ID: ${folder.id}):`);
      const files = await listFilesInFolder(folder.id);
      console.log(files);
    }
  }
}

main();
