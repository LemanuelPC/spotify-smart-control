import activeWin from 'active-win';
import { pauseSpotify, resumeSpotify } from './spotifyControl.js';
import { log } from './logger.js'; // Reusable logging module

// Video Detection Function
export async function toggleVideoDetection() {
    const POLLING_INTERVAL = parseInt(process.env.POLLING_INTERVAL, 10) || 5000;
    const videoKeywords = process.env.VIDEO_KEYWORDS
        ? process.env.VIDEO_KEYWORDS.split(',')
        : ['YouTube', 'Netflix', 'Vimeo', 'Twitch', 'Video'];

    log(`Starting video detection with polling interval: ${POLLING_INTERVAL}ms`);
    let isVideoPlaying = false;

    const intervalId = setInterval(async () => {
        try {
            const activeWindow = await activeWin();
            if (!activeWindow || !activeWindow.title || !activeWindow.owner?.name) {
                log('No active window detected or insufficient data.');
                return;
            }

            const windowTitle = activeWindow.title;
            const appName = activeWindow.owner.name;

            log(`Active window detected: "${windowTitle}" (${appName})`);

            const isVideoWindow = videoKeywords.some((keyword) =>
                windowTitle.toLowerCase().includes(keyword.toLowerCase()) ||
                appName.toLowerCase().includes(keyword.toLowerCase())
            );

            if (isVideoWindow !== isVideoPlaying) {
                if (isVideoWindow) {
                    log(`Video detected: "${windowTitle}" (${appName}). Pausing Spotify...`);
                    try {
                        await pauseSpotify();
                    } catch (err) {
                        console.error('Failed to pause Spotify:', err.message);
                    }
                } else {
                    log('No video detected. Resuming Spotify...');
                    try {
                        await resumeSpotify();
                    } catch (err) {
                        console.error('Failed to resume Spotify:', err.message);
                    }
                }
                isVideoPlaying = isVideoWindow; // Update state only on change
            }
        } catch (err) {
            console.error('Error during video detection:', err.message);
        }
    }, POLLING_INTERVAL);

    // Graceful Exit Handling
    process.on('SIGINT', () => {
        clearInterval(intervalId);
        log('Video detection stopped.');
        process.exit();
    });
}
