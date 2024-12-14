import { Command } from 'commander';
import { pauseSpotify, resumeSpotify, listDevices } from './spotifyControl.js';
import activeWin from 'active-win';

const program = new Command();

async function toggleVideoDetection() {
    console.log('Starting video detection...');
    let isVideoPlaying = false;

    const videoKeywords = ['YouTube', 'Netflix', 'Vimeo', 'Twitch', 'Video'];

    setInterval(async () => {
        try {
            const activeWindow = await activeWin();

            if (!activeWindow) {
                console.log('No active window detected.');
                return;
            }

            const windowTitle = activeWindow.title;
            const appName = activeWindow.owner.name;

            // Check if the active window belongs to a video-playing app
            const isVideoWindow = videoKeywords.some((keyword) => windowTitle.includes(keyword) || appName.includes(keyword));

            if (isVideoWindow && !isVideoPlaying) {
                console.log(`Video detected: ${windowTitle} (${appName}). Pausing Spotify...`);
                await pauseSpotify();
                isVideoPlaying = true;
            } else if (!isVideoWindow && isVideoPlaying) {
                console.log('No video detected. Resuming Spotify...');
                await resumeSpotify();
                isVideoPlaying = false;
            }
        } catch (err) {
            console.error('Error during video detection:', err.message);
        }
    }, 5000); // Poll every 5 seconds
}

program
    .name('spotify-automation')
    .description('Automate Spotify playback with Node.js')
    .version('1.0.0');

program
    .command('pause')
    .description('Pause Spotify playback')
    .action(async () => {
        try {
            await pauseSpotify();
        } catch (err) {
            console.error('Failed to pause Spotify:', err.message);
        }
    });

program
    .command('resume')
    .description('Resume Spotify playback')
    .action(async () => {
        try {
            await resumeSpotify();
        } catch (err) {
            console.error('Failed to resume Spotify:', err.message);
        }
    });

program
    .command('devices')
    .description('List active Spotify devices')
    .action(async () => {
        try {
            await listDevices(); // List devices directly
        } catch (err) {
            console.error('Failed to list Spotify devices:', err.message);
        }
    });

program
    .command('toggle-video')
    .description('Detect video playback and control Spotify automatically')
    .action(toggleVideoDetection);

if (!process.argv.slice(2).length) {
    program.outputHelp();
}

program.parse(process.argv);
