/**
 * @file getAccessToken.js
 * @description Standalone developer script to generate a signed JWT and exchange it for a Google Drive OAuth2 access token.
 * @architecture Standalone utility for testing or debugging Google Drive service account authentication outside the application runtime.
 * @agent_note Relies on a local `service.json` credential file in the same directory. Note that __dirname is used without ES module definition, so running directly in ESM requires attention.
 */
// getAccessToken.js
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

// Path to your service account JSON file (for development)
// In production, you might load this from an environment variable instead.
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service.json');

// Load service account credentials
const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE, 'utf8'));
const privateKey = serviceAccount.private_key;
const clientEmail = serviceAccount.client_email;

// Define JWT payload
const now = Math.floor(Date.now() / 1000);
const payload = {
  iss: clientEmail,                           // Issuer is the service account email
  scope: 'https://www.googleapis.com/auth/drive', // Scope required for Google Drive API
  aud: 'https://oauth2.googleapis.com/token', // Audience is the token endpoint
  iat: now,                                   // Issued at time
  exp: now + 3600                             // Expires in 1 hour
};

// Generate the JWT using RS256 algorithm
const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
console.log('Generated JWT:', token);

// Exchange the JWT for an access token
/**
 * @desc Exchanges a signed RS256 JWT assertion with Google OAuth2 server for a scoped access token.
 * @async
 * @returns {Promise<void>} Logs retrieved access token to console
 */
async function getAccessToken() {
  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
    params.append('assertion', token);

    const response = await axios.post('https://oauth2.googleapis.com/token', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    console.log('Access Token:', response.data.access_token);
  } catch (error) {
    console.error('Error fetching access token:', error.response ? error.response.data : error.message);
  }
}

getAccessToken();
