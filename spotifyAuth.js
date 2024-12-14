import axios from 'axios';
import dotenv from 'dotenv';
import express from 'express';
import open from 'open';
import fs from 'fs';

dotenv.config();

const app = express();
const port = 8888;

let accessToken = null;
let refreshToken = null;

// Load tokens from file
function loadTokens() {
    try {
        const tokens = JSON.parse(fs.readFileSync('tokens.json'));
        accessToken = tokens.accessToken;
        refreshToken = tokens.refreshToken;
        console.log('Loaded saved tokens.');
    } catch (err) {
        console.log('No saved tokens found. Starting fresh.');
    }
}

// Save tokens to file
function saveTokens() {
    fs.writeFileSync('tokens.json', JSON.stringify({ accessToken, refreshToken }));
}

// Redirect user to Spotify authorization URL
app.get('/login', (req, res) => {
    const scopes = 'user-modify-playback-state user-read-playback-state';
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${process.env.SPOTIFY_CLIENT_ID}&scope=${encodeURIComponent(
        scopes
    )}&redirect_uri=${encodeURIComponent(redirectUri)}`;
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

        console.log('Access Token:', accessToken);
        console.log('Refresh Token:', refreshToken);

        // Shut down the server
        console.log('Shutting down the authentication server...');
        process.exit(0);
    } catch (err) {
        console.error('Error getting tokens:', err.response?.data || err.message);
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
        console.log('Access token refreshed:', accessToken);
    } catch (err) {
        console.error('Error refreshing access token:', err.response?.data || err.message);
    }
}

// Helper function to get the current access token
async function getAccessToken() {
    if (!accessToken) {
        throw new Error('Access token is not set. Please authenticate first.');
    }
    return accessToken;
}

// Start the server only if tokens are missing
loadTokens();

if (!accessToken || !refreshToken) {
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
        console.log('Opening browser to authenticate Spotify...');
        open(`http://localhost:${port}/login`);
    });
}

export { getAccessToken, refreshAccessToken };
