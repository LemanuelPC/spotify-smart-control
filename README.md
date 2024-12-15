# **Spotify Smart Control**

A Node.js application for managing Spotify playback intelligently. The app features two modes:
1. **Smart Control via Browser Video Playback**: Automatically pause or resume Spotify when playing, pausing, or seeking videos in your browser.
2. **Command-Line Interface (CLI) for Manual Control**: Includes manual Spotify controls and a basic smart control based on active window keywords.

This project combines Spotify's Web API and Tampermonkey browser scripting to deliver a seamless user experience.

---

## **Features**

### **Main Functionality: Smart Control with Browser Video Playback**
- Pauses Spotify when a video starts playing in the browser.
- Resumes Spotify when the video is paused, stopped, or the tab is closed.
- Handles seeking within videos to prevent Spotify playback interruptions.
- Requires the included **Tampermonkey script** for video playback detection.

### **CLI Features**
- Pause Spotify playback.
- Resume Spotify playback.
- Skip to the next track.
- Skip to the previous track.
- List active Spotify devices.
- **Basic Smart Control Mode**: Detects active windows containing specific keywords (e.g., YouTube, Netflix) and automatically pauses or resumes Spotify playback.

---

## **Requirements**
- **Node.js** (v16 or higher)
- **Spotify Premium account** (required for Spotify Web API control)
- **Tampermonkey browser extension** (or equivalent userscript manager)

---

## **Installation**

### **1. Clone the Repository**
```bash
git clone https://github.com/LemanuelPC/spotify-smart-control.git
cd spotify-smart-control
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Set Up Environment Variables**
Create a `.env` file in the root directory with the following variables:
```
SPOTIFY_CLIENT_ID=<your_spotify_client_id>
SPOTIFY_CLIENT_SECRET=<your_spotify_client_secret>
SPOTIFY_REDIRECT_URI=http://localhost:8888/callback
PORT=8888
```

- Obtain the Spotify API credentials from the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/).

### **4. Install the Tampermonkey Script**
- Copy the contents of the `tampermonkey/spotify-video-control.user.js` file.
- Paste it into a new script in your Tampermonkey extension (or any other userscript manager).
- Save and enable the script.

---

## **Usage**

### **1. Start the Server**
```bash
npm start
```

- If tokens are not saved, your default browser will open for Spotify authentication.
- If already authenticated, the server will validate and refresh tokens as needed.

### **2. Smart Control with Browser Video Playback**
- When a video starts playing in your browser, Spotify playback will pause automatically.
- When the video is paused, stopped, or the tab is closed, Spotify playback will resume.

### **3. CLI Mode**
```bash
node index.js [command]
```
#### **Available Commands**
- **`pause`**: Pause Spotify playback.
- **`resume`**: Resume Spotify playback.
- **`next`**: Skip to the next track.
- **`previous`**: Skip to the previous track.
- **`devices`**: List active Spotify devices.
- **`toggle-video`**: Enable basic smart control based on active window keywords (e.g., YouTube, Netflix).

---

## **Deployment**

This project is designed to run locally. However, parts of the project could be adapted for deployment:

- **Browser Extension**:
    - The Tampermonkey script could be converted into a standalone browser extension for easier distribution.

- **Server Deployment**:
    - The server could be hosted on platforms like Heroku, AWS, or Render, allowing remote control of Spotify from any device.

- **Cross-Platform Integration**:
    - Combine the app with Electron.js or similar frameworks to create a desktop application.

---

## **Key Skills Demonstrated**
- **Node.js**: Core backend development.
- **Spotify Web API**: Integration for playback control.
- **Tampermonkey**: Browser scripting for real-time video playback detection.
- **Express.js**: RESTful API development.
- **Environment Variables**: Secure credential management using `.env`.
- **Asynchronous Programming**: Handling API requests and browser events effectively.
- **Error Handling**: Graceful handling of API failures and invalid states.
- **Cross-Origin Resource Sharing (CORS)**: Seamless communication between browser scripts and the Node.js backend.

---

## **Contributing**
Contributions are welcome! To contribute:
1. Fork this repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes and push:
   ```bash
   git commit -m "Add feature-name"
   git push origin feature-name
   ```
4. Open a pull request.

---

## **License**
This project is licensed under the [MIT License](LICENSE).

---

## **Acknowledgments**
- **Spotify Web API**: For enabling playback control.
- **Tampermonkey**: For browser scripting capabilities.
- **Node.js**: For powering the backend.
