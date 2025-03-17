// Core elements
const audio = document.getElementById('audio');
const playPauseBtn = document.getElementById('play-pause');
const progressBar = document.getElementById('progress');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const volumeControl = document.getElementById('volume');
const shuffleBtn = document.getElementById('shuffle-btn');
const hdBtn = document.getElementById('hd-btn');

// Consolidate state management
const playerState = {
    isPlaying: false,
    isShuffled: false,
    isHDEnabled: false,
    currentTrackIndex: 0
};

// Update playlist with the correct path
const playlist = [
    {
        title: 'Construyendo en el Espacio',
        artist: 'Luna Cantina',
        src: './mp3/Construyendo en el Espacio - Luna Cantina.mp3',
        hdSrc: './mp3/hd/Construyendo en el Espacio - Luna Cantina.mp3', // HD version
        image: './imgs/album-02.png',
        duration: '3:45'
    }
    // Add other songs here if needed
];

// Basic playback functions
function togglePlayPause() {
    if (playerState.isPlaying) {
        audio.pause();
    } else {
        audio.play().catch(e => console.log('Playback failed:', e));
    }
    playerState.isPlaying = !playerState.isPlaying;
    updatePlayPauseIcon();
}

function updatePlayPauseIcon() {
    const playIcon = playPauseBtn.querySelector('.play-icon');
    const pauseIcon = playPauseBtn.querySelector('.pause-icon');
    
    if (playerState.isPlaying) {
        playIcon.classList.add('hidden');
        pauseIcon.classList.remove('hidden');
    } else {
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
    }
}

function loadTrack(track) {
    // Use HD source if available and enabled
    const source = playerState.isHDEnabled && track.hdSrc ? track.hdSrc : track.src;
    audio.src = source;
    document.getElementById('song-title').textContent = track.title;
    document.getElementById('artist-name').textContent = track.artist;
    document.querySelector('.album-art').src = track.image;
    
    audio.load();
    renderPlaylist();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadTrack(playlist[playerState.currentTrackIndex]);
    setupEventListeners();
    audio.volume = volumeControl.value;
    updatePlayPauseIcon();
    renderPlaylist();
});

// Update progress
function updateProgress() {
    if (!audio.duration) return;
    
    const progressPercent = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
    currentTimeEl.textContent = formatTime(audio.currentTime);
}

// Progress bar click handling
function handleProgressBarClick(e) {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const progressBarWidth = progressBar.offsetWidth;
    const seekTime = (clickPosition / progressBarWidth) * audio.duration;
    
    // Add smooth seeking
    audio.currentTime = seekTime;
    updateProgress();
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function toggleShuffle() {
    playerState.isShuffled = !playerState.isShuffled;
    shuffleBtn.classList.toggle('active');
}

function toggleHD() {
    playerState.isHDEnabled = !playerState.isHDEnabled;
    hdBtn.classList.toggle('active');
    
    // If currently playing, reload the track with new quality
    if (playerState.isPlaying) {
        const currentTime = audio.currentTime;
        loadTrack(playlist[playerState.currentTrackIndex]);
        audio.currentTime = currentTime;
        audio.play();
    }
}

function handleVolumeChange(e) {
    const value = e.target.value;
    audio.volume = value;
    
    const volumeIcon = document.querySelector('.volume-control i');
    if (value >= 0.5) {
        volumeIcon.className = 'fas fa-volume-up';
    } else if (value > 0) {
        volumeIcon.className = 'fas fa-volume-down';
    } else {
        volumeIcon.className = 'fas fa-volume-mute';
    }
}

function setupEventListeners() {
    playPauseBtn.addEventListener('click', togglePlayPause);
    prevBtn.addEventListener('click', () => handleTrackChange(-1));
    nextBtn.addEventListener('click', () => handleTrackChange(1));
    volumeControl.addEventListener('input', handleVolumeChange);
    hdBtn.addEventListener('click', toggleHD);
    
    // Audio events
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', () => {
        totalTimeEl.textContent = formatTime(audio.duration);
    });
    
    // Initial state
    updatePlayPauseIcon();
    handleVolumeChange({ target: { value: volumeControl.value } });
}

// Combine track navigation logic
function handleTrackChange(direction) {
    playerState.currentTrackIndex = 
        (playerState.currentTrackIndex + direction + playlist.length) % playlist.length;
    loadTrack(playlist[playerState.currentTrackIndex]);
    if (playerState.isPlaying) {
        audio.play();
    }
    renderPlaylist();
}

function renderPlaylist() {
    const playlistEl = document.getElementById('playlist');
    playlistEl.innerHTML = playlist.map((track, index) => `
        <li class="playlist-item ${index === playerState.currentTrackIndex ? 'active' : ''}" 
            data-index="${index}"
            onclick="playTrack(${index})">
            <div class="playlist-item-info">
                <p class="playlist-item-title">${track.title}</p>
                <p class="playlist-item-artist">${track.artist}</p>
            </div>
            <span class="playlist-item-duration">${track.duration}</span>
        </li>
    `).join('');
}

function playTrack(index) {
    playerState.currentTrackIndex = index;
    loadTrack(playlist[index]);
    if (playerState.isPlaying) {
        audio.play();
    }
    renderPlaylist(); // Update playlist to show new active track
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Only if not typing in an input
        if (e.target.tagName === 'INPUT') return;
        
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                togglePlayPause();
                break;
            case 'ArrowLeft':
                if (e.ctrlKey) handleTrackChange(-1);
                else audio.currentTime -= 5;
                break;
            case 'ArrowRight':
                if (e.ctrlKey) handleTrackChange(1);
                else audio.currentTime += 5;
                break;
            case 'ArrowUp':
                e.preventDefault();
                audio.volume = Math.min(1, audio.volume + 0.1);
                volumeControl.value = audio.volume;
                break;
            case 'ArrowDown':
                e.preventDefault();
                audio.volume = Math.max(0, audio.volume - 0.1);
                volumeControl.value = audio.volume;
                break;
        }
    });
}

function enhanceProgressBar() {
    const progressContainer = document.querySelector('.progress-container');
    const progressBar = document.querySelector('.progress-bar');
    let isDragging = false;

    progressContainer.addEventListener('mousedown', startDragging);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDragging);
    
    // Touch support
    progressContainer.addEventListener('touchstart', startDragging);
    document.addEventListener('touchmove', drag);
    document.addEventListener('touchend', stopDragging);

    function startDragging(e) {
        isDragging = true;
        updateProgress(e);
    }

    function drag(e) {
        if (!isDragging) return;
        updateProgress(e);
    }

    function stopDragging() {
        isDragging = false;
    }

    function updateProgress(e) {
        const rect = progressBar.getBoundingClientRect();
        const x = (e.type.includes('touch') ? e.touches[0].clientX : e.clientX) - rect.left;
        const percent = Math.min(Math.max(x / rect.width, 0), 1);
        audio.currentTime = percent * audio.duration;
    }
}
