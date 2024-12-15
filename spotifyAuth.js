import axios from 'axios';
import dotenv from 'dotenv';
import express from 'express';
import open from 'open';
import fs from 'fs';
import { log } from './logger.js'; // Centralized logger

dotenv.config();

const app = express();
const port = process.env.PORT || 8888;

let accessToken = null;
let refreshToken = null;

// Check required environment variables
if (!process.env.SPOTIFY_REDIRECT_URI || !process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
    throw new Error('Missing Spotify environment variables. Please check your .env file.');
}

// Load tokens from file
function loadTokens() {
    try {
        const tokens = JSON.parse(fs.readFileSync('tokens.json'));
        accessToken = tokens.accessToken;
        refreshToken = tokens.refreshToken;
        log('Loaded saved tokens.');
    } catch {
        log('No saved tokens found. Starting fresh.');
    }
}

// Save tokens to file
function saveTokens() {
    fs.writeFileSync('tokens.json', JSON.stringify({ accessToken, refreshToken }));
    log('Tokens saved successfully.');
}

// Validate access token
async function validateAccessToken() {
    try {
        await axios.get('https://api.spotify.com/v1/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        log('Access token is valid.');
    } catch (err) {
        log(`Access token is invalid. Refreshing... Error: ${err.message}`);
        await refreshAccessToken();
    }
}

// Redirect user to Spotify authorization URL
app.get('/login', (req, res) => {
    const SPOTIFY_SCOPES = [
        'user-modify-playback-state',
        'user-read-playback-state',
    ].join(' ');

    const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${process.env.SPOTIFY_CLIENT_ID}&scope=${encodeURIComponent(SPOTIFY_SCOPES)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    res.redirect(authUrl);
});

// Handle the callback and get tokens
app.get('/callback', async (req, res) => {
    const code = req.query.code;

    try {
        const response = await axios.post(
            'https://accounts.spotify.com/api/token',
            new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
                client_id: process.env.SPOTIFY_CLIENT_ID,
                client_secret: process.env.SPOTIFY_CLIENT_SECRET,
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        accessToken = response.data.access_token;
        refreshToken = response.data.refresh_token;
        saveTokens();

        res.send('Authorization successful! You can close this window.');
        log('Access Token:', accessToken);
        log('Refresh Token:', refreshToken);

        log('Shutting down the authentication server...');
        process.exit(0);
    } catch (err) {
        log(`Error getting tokens: ${err.message}`);
        res.send('Failed to authorize.');
    }
});

// Refresh access token when needed
async function refreshAccessToken() {
    try {
        const response = await axios.post(
            'https://accounts.spotify.com/api/token',
            new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: process.env.SPOTIFY_CLIENT_ID,
                client_secret: process.env.SPOTIFY_CLIENT_SECRET,
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        accessToken = response.data.access_token;
        saveTokens();
        log('Access token refreshed:', accessToken);
    } catch (err) {
        log('Error refreshing access token:', err.response?.data || err.message);
    }
}

// Helper function to get the current access token
async function getAccessToken() {
    if (!accessToken) {
        throw new Error('Access token is not set. Please authenticate first.');
    }
    return accessToken;
}

// Start the server
(async () => {
    loadTokens();
    if (accessToken && refreshToken) {
        await validateAccessToken();
    } else {
        app.listen(port, () => {
            log(`Server running on http://localhost:${port}`);
            log('Opening browser to authenticate Spotify...');
            open(`http://localhost:${port}/login`);
        });
    }
})();

// Export functions for external use
export { getAccessToken, refreshAccessToken };
