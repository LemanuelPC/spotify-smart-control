import { Command } from 'commander';
import { pauseSpotify, resumeSpotify, listDevices, nextTrack, previousTrack } from './spotifyControl.js';
import { toggleVideoDetection } from './videoDetection.js';
import { log } from './logger.js'; // Reusable logger module

const program = new Command();

program
    .name('spotify-automation')
    .description('Automate Spotify playback with Node.js')
    .version('1.0.0');

// Pause Spotify playback
program
    .command('pause')
    .alias('p')
    .description('Pause Spotify playback')
    .action(async () => {
        log('Executing "pause" command...');
        try {
            await pauseSpotify();
            log('Spotify playback paused.');
        } catch (err) {
            console.error('Failed to pause Spotify:', err.message);
            process.exit(1);
        }
    });

// Resume Spotify playback
program
    .command('resume')
    .alias('r')
    .description('Resume Spotify playback')
    .action(async () => {
        log('Executing "resume" command...');
        try {
            await resumeSpotify();
            log('Spotify playback resumed.');
        } catch (err) {
            console.error('Failed to resume Spotify:', err.message);
            process.exit(1);
        }
    });

// List active Spotify devices
program
    .command('devices')
    .alias('d')
    .description('List active Spotify devices')
    .action(async () => {
        log('Executing "devices" command...');
        try {
            await listDevices();
        } catch (err) {
            console.error('Failed to list Spotify devices:', err.message);
            process.exit(1);
        }
    });

// Skip to the next track
program
    .command('next')
    .alias('n')
    .description('Skip to the next Spotify track')
    .action(async () => {
        log('Executing "next" command...');
        try {
            await nextTrack();
            log('Skipped to the next Spotify track.');
        } catch (err) {
            console.error('Failed to skip to the next track:', err.message);
            process.exit(1);
        }
    });

// Skip to the previous track
program
    .command('previous')
    .alias('prev')
    .description('Skip to the previous Spotify track')
    .action(async () => {
        log('Executing "previous" command...');
        try {
            await previousTrack();
            log('Skipped to the previous Spotify track.');
        } catch (err) {
            console.error('Failed to skip to the previous track:', err.message);
            process.exit(1);
        }
    });

// Toggle video detection and control Spotify
program
    .command('toggle-video')
    .description('Detect video playback and control Spotify automatically (runs until manually stopped)')
    .action(() => {
        log('Executing "toggle-video" command...');
        toggleVideoDetection();
    });

if (!process.argv.slice(2).length) {
    program.outputHelp();
}

program.parse(process.argv);
