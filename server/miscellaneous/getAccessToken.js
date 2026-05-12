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
