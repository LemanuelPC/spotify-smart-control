// ==UserScript==
// @name         Video Playback Detection (Delayed Pause Confirmation)
// @namespace    https://github.com/LemanuelPC/spotify-smart-control
// @version      1.3
// @description  Detect when videos play, pause, or seek, and notify Spotify control script with delay handling for pause.
// @author       Luis Carvalho
// @match        *://*/*
// @grant        none
// ==/UserScript==

(() => {
    const STATE = {
        PLAYING: 'playing',
        PAUSED: 'paused',
    };

    let videoState = STATE.PAUSED; // Initial video state
    let isSeeking = false; // Flag to track if seeking is occurring
    let pauseTimer = null; // Timer for delayed pause handling

    const notifyServer = async (action) => {
        console.log(`Notifying server: ${action}`);
        try {
            await fetch('http://localhost:8888/video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });
        } catch (err) {
            console.error('Failed to notify server:', err);
        }
    };

    const handlePlay = () => {
        if (!isSeeking && videoState !== STATE.PLAYING) {
            console.log("Video playing. Pausing Spotify...");
            notifyServer('play'); // Pause Spotify
            videoState = STATE.PLAYING; // Update state
        }
    };

    const handlePause = (videoElement) => {
        // Delay handling of pause to confirm it isn't caused by seeking
        console.log("Pause event detected. Starting delay...");
        clearTimeout(pauseTimer); // Clear any existing timer
        pauseTimer = setTimeout(() => {
            if (!isSeeking && videoElement.paused) {
                console.log("Pause confirmed as user-initiated. Resuming Spotify...");
                notifyServer('pause'); // Resume Spotify
                videoState = STATE.PAUSED; // Update state
            } else {
                console.log("Pause event ignored due to seeking.");
            }
        }, 500); // 500ms delay
    };

    const handleSeeking = () => {
        console.log("Seeking started...");
        isSeeking = true;
        clearTimeout(pauseTimer); // Cancel any pending pause actions
    };

    const handleSeeked = (videoElement) => {
        console.log("Seeking completed.");
        isSeeking = false;
        if (!videoElement.paused) {
            console.log("Seeked and video is playing. Ensuring Spotify remains paused...");
            notifyServer('play'); // Ensure Spotify is paused
            videoState = STATE.PLAYING; // Update state
        } else {
            console.log("Seeked and video is paused. Ensuring Spotify resumes...");
            notifyServer('pause'); // Ensure Spotify resumes
            videoState = STATE.PAUSED; // Update state
        }
    };

    const attachListeners = (video) => {
        console.log("Attaching listeners to video:", video);

        video.addEventListener('play', handlePlay, true);
        video.addEventListener('pause', () => handlePause(video), true);
        video.addEventListener('seeking', handleSeeking, true);
        video.addEventListener('seeked', () => handleSeeked(video), true);
    };

    const monitorVideos = () => {
        const videos = document.querySelectorAll('video');
        videos.forEach((video) => {
            if (!video.hasAttribute('data-monitored')) {
                video.setAttribute('data-monitored', 'true');
                attachListeners(video);
            }
        });
    };

    // Dynamically monitor new videos added to the page
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes) {
                mutation.addedNodes.forEach((node) => {
                    if (node.tagName === 'VIDEO') {
                        monitorVideos();
                    }
                });
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Initial monitoring of existing videos
    monitorVideos();

    // Handle tab close or unload
    window.addEventListener('beforeunload', () => {
        if (videoState === STATE.PLAYING) {
            notifyServer('pause'); // Ensure Spotify resumes if tab is closed
        }
    });
})();
