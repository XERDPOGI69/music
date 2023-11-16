// Your Spotify API credentials (replace with your own)
const CLIENT_ID = 'your_client_id';
const REDIRECT_URI = 'your_redirect_uri';
const TOKEN_KEY = 'spotify-token';

// Spotify API endpoints
const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=https://example.com/callback&scope=user-read-private%20user-read-email%20user-read-playback-state%20user-modify-playback-state%20playlist-read-private`;

const API_BASE = 'https://api.spotify.com/v1';

// Check if the user is already authenticated
const accessToken = getAccessTokenFromLocalStorage();

if (!accessToken) {
    // Redirect the user to Spotify for authentication
    window.location.replace(AUTH_URL);
} else {
    // Fetch user's playlists
    fetchPlaylists();
}

// Example function to fetch user's playlists
function fetchPlaylists() {
    fetch(`${API_BASE}/me/playlists`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => response.json())
    .then(data => displayPlaylists(data))
    .catch(error => console.error('Error fetching playlists:', error));
}

// Example function to display playlists
function displayPlaylists(playlists) {
    const playlistElement = document.getElementById('playlist');

    playlists.items.forEach(playlist => {
        const listItem = document.createElement('li');
        listItem.textContent = playlist.name;

        // Add click event listener to play the playlist
        listItem.addEventListener('click', () => playPlaylist(playlist.id));

        playlistElement.appendChild(listItem);
    });
}

// Example function to play a playlist
function playPlaylist(playlistId) {
    // Fetch tracks from the selected playlist
    fetch(`${API_BASE}/playlists/${playlistId}/tracks`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        // Extract track URIs from the playlist and start playback
        const trackUris = data.items.map(item => item.track.uri);
        startPlayback(trackUris);
    })
    .catch(error => console.error('Error fetching playlist tracks:', error));
}

// Example function to start playback
function startPlayback(uris) {
    // Use the Spotify Web Playback SDK to start playback
    const player = new Spotify.Player({
        name: 'Web Playback SDK Player',
        getOAuthToken: cb => { cb(accessToken); }
    });

    // Error handling
    player.addListener('initialization_error', ({ message }) => { console.error('Initialization error:', message); });
    player.addListener('authentication_error', ({ message }) => { console.error('Authentication error:', message); });
    player.addListener('account_error', ({ message }) => { console.error('Account error:', message); });
    player.addListener('playback_error', ({ message }) => { console.error('Playback error:', message); });

    // Playback status updates
    player.addListener('player_state_changed', state => {
        const { name, artists } = state.track_window.current_track;
        updateNowPlaying(name, artists.map(artist => artist.name).join(', '));
    });

    // Ready
    player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);

        // Play the selected tracks
        fetch(`${API_BASE}/me/player/play`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                uris: uris,
                device_id: device_id,
            }),
        });
    });

    // Connect to the player
    player.connect();
}

// Example function to update the currently playing track
function updateNowPlaying(trackName, artistName) {
    const trackInfoElement = document.getElementById('track-info');

    trackInfoElement.textContent = `${trackName} - ${artistName}`;
}

// Example event listeners for play, pause, and skip buttons
document.getElementById('play-button').addEventListener('click', play);
document.getElementById('prev-button').addEventListener('click', previous);
document.getElementById('next-button').addEventListener('click', next);

// Example functions for play, pause, and skip
function play() {
    // Add logic to play/pause the current track using Spotify API
}

function previous() {
    // Add logic to play the previous track using Spotify API
}

function next() {
    // Add logic to play the next track using Spotify API
}

// Helper function to get the access token from local storage
function getAccessTokenFromLocalStorage() {
    return localStorage.getItem(TOKEN_KEY);
}
