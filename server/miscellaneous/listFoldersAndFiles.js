// listFoldersAndFiles.js
import { google } from 'googleapis';
import fs from 'fs';
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
 * List all folders in the Drive.
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
 * List files inside a given folder.
 * @param {string} folderId - The ID of the folder.
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
 * Main function to list all folders and then list files for each folder.
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
