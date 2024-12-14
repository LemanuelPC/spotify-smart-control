import express from 'express';
import cors from 'cors';
import { pauseSpotify, resumeSpotify } from './spotifyControl.js';
import { log } from './logger.js';

const app = express();
const port = process.env.PORT || 8888;

app.use(cors());
app.use(express.json());

// Tracks the current video playback state
let isVideoPlaying = false;

// Define valid actions for scalability
const VALID_ACTIONS = ['play', 'pause'];

/**
 * Validate and handle incoming video actions.
 */
app.post('/video', async (req, res) => {
    const { action } = req.body;

    log(`Incoming request: ${JSON.stringify(req.body)} from ${req.ip}`);

    try {
        // Validate action
        if (!VALID_ACTIONS.includes(action)) {
            log(`Invalid action received: ${action}`);
            return res.status(400).send({ error: 'Invalid action.' });
        }

        // Handle 'play' action
        if (action === 'play') {
            if (!isVideoPlaying) {
                log('Video started playing. Pausing Spotify...');
                await pauseSpotify();
                isVideoPlaying = true; // Update state
            } else {
                log('Ignored redundant "play" action. Video is already playing.');
            }
        }

        // Handle 'pause' action
        if (action === 'pause') {
            if (isVideoPlaying) {
                log('Video stopped/paused. Resuming Spotify...');
                await resumeSpotify();
                isVideoPlaying = false; // Update state
            } else {
                log('Ignored redundant "pause" action. Video is already paused.');
            }
        }

        res.status(200).send({
            message: 'Action handled successfully.',
            state: isVideoPlaying ? 'paused' : 'playing',
        });
    } catch (err) {
        // Enhanced error logging
        log(`Error handling action '${action}': ${err.message}`);
        log(`Stack trace: ${err.stack}`);
        res.status(500).send({ error: 'Failed to handle action.', details: err.message });
    }
});

/**
 * Periodic state validation (optional, for debugging or recovery from desync).
 */
const validateState = () => {
    log(`Current state: isVideoPlaying = ${isVideoPlaying}`);
    // Additional validation logic can be added here if needed
};

// Schedule state validation every 60 seconds
setInterval(validateState, 60000);

/**
 * Start server.
 */
app.listen(port, () => {
    log(`Server running at http://localhost:${port}`);
    log('Listening for video playback events...');
});

/**
 * Graceful shutdown handler.
 */
process.on('SIGINT', () => {
    log('Shutting down server...');
    // Add any additional cleanup logic here if needed
    process.exit(0);
});
