import axios from 'axios';
import { getAccessToken, refreshAccessToken } from './spotifyAuth.js';
import { log } from './logger.js'; // Reusable logger module

// Helper to send Spotify commands (e.g., pause, play)
async function sendSpotifyCommand(command, retryCount = 0) {
    const maxRetries = 1; // Set a limit for retries
    const validCommands = ['pause', 'play'];
    if (!validCommands.includes(command)) {
        throw new Error(`Invalid command: ${command}`);
    }

    const token = await getAccessToken();
    const endpoint = `https://api.spotify.com/v1/me/player/${command}`;

    try {
        await axios.put(endpoint, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        log(`Spotify ${command} command sent successfully.`);
    } catch (err) {
        if (err.response?.status === 404 && err.response?.data?.error?.reason === 'NO_ACTIVE_DEVICE') {
            log('No active Spotify device found. Please start playback on a device and try again.');
            return;
        }

        if (err.response?.status === 401 && retryCount < maxRetries) {
            log('Access token expired. Refreshing token...');
            await refreshAccessToken();
            return sendSpotifyCommand(command, retryCount + 1); // Retry with incremented count
        }

        log(`Failed to send Spotify ${command} command: ${err.response?.data || err.message}`);
    }
}

// Wrapper for pause command
async function pauseSpotify() {
    await sendSpotifyCommand('pause');
}

// Wrapper for play command
async function resumeSpotify() {
    await sendSpotifyCommand('play');
}

// Helper to log active devices
export function logDevices(devices) {
    if (devices.length === 0) {
        log('No active devices found. Make sure Spotify is running.');
    } else {
        log('Active devices:');
        devices.forEach((device) => {
            log(`- ${device.name} (${device.type})`);
        });
    }
}

// List all active Spotify devices
async function listDevices(retryCount = 0) {
    const maxRetries = 1;
    const token = await getAccessToken();
    try {
        const response = await axios.get('https://api.spotify.com/v1/me/player/devices', {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.data?.devices) {
            log('Unexpected response format:', response.data);
            return;
        }

        logDevices(response.data.devices);
    } catch (err) {
        if (err.response?.status === 401 && retryCount < maxRetries) {
            log('Access token expired. Refreshing token...');
            await refreshAccessToken();
            return listDevices(retryCount + 1);
        }

        log(`Failed to fetch devices: ${err.response?.data || err.message}`);
    }
}

// Skips to next track
async function nextTrack(retryCount = 0) {
    const maxRetries = 1;
    const token = await getAccessToken();

    try {
        await axios.post('https://api.spotify.com/v1/me/player/next', {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        log('Skipped to the next track.');
    } catch (err) {
        if (err.response?.status === 401 && retryCount < maxRetries) {
            log('Access token expired. Refreshing token...');
            await refreshAccessToken();
            return nextTrack(retryCount + 1);
        }
        log(`Failed to skip to the next track: ${err.response?.data || err.message}`);
    }
}

// Skips to previous track
async function previousTrack(retryCount = 0) {
    const maxRetries = 1;
    const token = await getAccessToken();

    try {
        await axios.post('https://api.spotify.com/v1/me/player/previous', {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        log('Skipped to the previous track.');
    } catch (err) {
        if (err.response?.status === 401 && retryCount < maxRetries) {
            log('Access token expired. Refreshing token...');
            await refreshAccessToken();
            return previousTrack(retryCount + 1);
        }
        log(`Failed to skip to the previous track: ${err.response?.data || err.message}`);
    }
}

export { pauseSpotify, resumeSpotify, listDevices, nextTrack, previousTrack };
