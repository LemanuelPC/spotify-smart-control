import axios from 'axios';
import { getAccessToken, refreshAccessToken } from './spotifyAuth.js';

async function sendSpotifyCommand(command) {
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
        console.log(`Spotify ${command} command sent successfully.`);
    } catch (err) {
        if (err.response?.status === 404 && err.response?.data?.error?.reason === 'NO_ACTIVE_DEVICE') {
            console.error('No active Spotify device found. Please start playback on a device and try again.');
            return;
        }
        if (err.response?.status === 401) {
            console.warn('Access token expired. Refreshing token...');
            await refreshAccessToken();
            return sendSpotifyCommand(command); // Retry the command
        }
        console.error(`Failed to send Spotify ${command} command:`, {
            status: err.response?.status,
            data: err.response?.data,
            message: err.message,
        });
    }
}

async function pauseSpotify() {
    await sendSpotifyCommand('pause');
}

async function resumeSpotify() {
    await sendSpotifyCommand('play');
}

async function listDevices() {
    const token = await getAccessToken();
    try {
        const response = await axios.get('https://api.spotify.com/v1/me/player/devices', {
            headers: { Authorization: `Bearer ${token}` },
        });
        const devices = response.data.devices;

        if (devices.length === 0) {
            console.log('No active devices found. Make sure Spotify is running.');
        } else {
            console.log('Active devices:');
            devices.forEach((device) => {
                console.log(`- ${device.name} (${device.type})`);
            });
        }
    } catch (err) {
        console.error('Failed to fetch devices:', err.response?.data || err.message);
    }
}

export { pauseSpotify, resumeSpotify, listDevices  };
