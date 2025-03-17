
// Add feature detection
const supportsBackdropFilter = CSS.supports('backdrop-filter', 'blur(10px)');
if (!supportsBackdropFilter) {
    document.documentElement.classList.add('no-backdrop-filter');
}

// Add offline support
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(registration => {
            console.log('ServiceWorker registration successful');
        })
        .catch(err => {
            console.error('ServiceWorker registration failed:', err);
        });
}

// Constants
const DEFAULT_PROFILE_IMAGE = './assets/images/default-profile.jpg';

// Mock data (replace with actual API calls later)
const mockUserData = {
    name: "John Doe",
    bio: "Music enthusiast | Playlist curator",
    stats: {
        playlists: 12,
        followers: 245,
        following: 180
    }
};

const mockPlaylists = [
    { id: 1, title: "Summer Vibes", tracks: 15 },
    { id: 2, title: "Workout Mix", tracks: 20 },
    { id: 3, title: "Chill Hours", tracks: 18 }
];

const mockRecentlyPlayed = [
    { id: 1, title: "Blinding Lights", artist: "The Weeknd", tracks: 1 },
    { id: 2, title: "Stay", artist: "Kid Laroi", tracks: 1 },
    { id: 3, title: "Heat Waves", artist: "Glass Animals", tracks: 1 }
];

const mockArtists = [
    { id: 1, name: "The Weeknd", followers: "2M" },
    { id: 2, name: "Dua Lipa", followers: "1.5M" },
    { id: 3, name: "Post Malone", followers: "1.8M" }
];

const mockConnections = {
    followers: [
        {
            id: 1,
            name: "Sarah Wilson",
            avatar: "imgs/avatar-1.jpg",
            mutualFriends: 3,
            isFollowing: false
        },
        // Add more mock followers...
    ],
    following: [
        {
            id: 2,
            name: "Mike Johnson",
            avatar: "imgs/avatar-2.jpg",
            mutualFriends: 5,
            isFollowing: true
        },
        // Add more mock following...
    ]
};

const mockActivities = [
    {
        id: 1,
        type: 'playlist_created',
        title: 'Created new playlist',
        description: 'Summer Vibes 2024',
        timestamp: '2024-01-15T10:30:00Z',
        likes: 12,
        comments: 3,
        icon: '🎵'
    },
    {
        id: 2,
        type: 'song_shared',
        title: 'Shared a song',
        description: '"Blinding Lights" by The Weeknd',
        timestamp: '2024-01-14T15:20:00Z',
        likes: 8,
        comments: 1,
        icon: '🎧'
    }
    // Add more activities...
];

// DOM Elements
const profileImage = document.getElementById('profile-image');
const profileName = document.getElementById('profile-name');
const profileBio = document.getElementById('profile-bio');
const playlistsCount = document.getElementById('playlists-count');
const followersCount = document.getElementById('followers-count');
const followingCount = document.getElementById('following-count');
const playlistsGrid = document.getElementById('playlists-grid');
const recentGrid = document.getElementById('recent-grid');
const artistsGrid = document.getElementById('artists-grid');
const editProfileModal = document.getElementById('edit-profile-modal');
const editProfileForm = document.getElementById('edit-profile-form');
const connectionsModal = document.getElementById('connections-modal');
const followersList = document.getElementById('followers-list');
const followingList = document.getElementById('following-list');
const activityFeed = document.getElementById('activity-feed');
const activityModal = document.getElementById('activity-modal');

// Add these utility functions at the top
const utils = {
    showLoader: (element) => {
        element.innerHTML = `
            <div class="loader-container">
                <div class="loader"></div>
            </div>`;
    },
    showError: (element, message) => {
        element.innerHTML = `
            <div class="error-container">
                <p>${message}</p>
                <button class="retry-btn">Retry</button>
            </div>`;
    }
};

const ErrorStates = {
    LOAD_FAILED: 'Failed to load content',
    UPDATE_FAILED: 'Failed to update profile',
    UPLOAD_FAILED: 'Failed to upload image'
};

function showError(container, message) {
    container.innerHTML = `
        <div class="error-state">
            <svg class="error-icon" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <p>${message}</p>
            <button class="retry-btn">Retry</button>
        </div>
    `;

    container.querySelector('.retry-btn').addEventListener('click', () => {
        initializeProfile();
    });
}

async function loadProfileData() {
    try {
        // Simulate API call
        const response = await fetch('/api/profile');
        if (!response.ok) throw new Error('Failed to load profile');
        const data = await response.json();
        
        // Set profile image with fallback
        const profileImage = document.getElementById('profile-image');
        profileImage.src = data.profileImage || DEFAULT_PROFILE_IMAGE;
        profileImage.onerror = () => {
            profileImage.src = DEFAULT_PROFILE_IMAGE;
        };
        
        return data;
    } catch (error) {
        throw new Error(ErrorStates.LOAD_FAILED);
    }
}

// Initialize profile
async function initializeProfile() {
    try {
        // Show loading state
        [playlistsGrid, recentGrid, artistsGrid].forEach(grid => {
            utils.showLoader(grid);
        });

        // Load profile data
        const userData = await loadProfileData();

        // Update profile information
        profileName.textContent = userData.name;
        profileBio.textContent = userData.bio;
        playlistsCount.textContent = userData.stats.playlists;
        followersCount.textContent = userData.stats.followers;
        followingCount.textContent = userData.stats.following;

        // Initialize other components
        setupEventListeners();
        setupModalHandlers();
        setupImageUpload();
        setupPlaylistInteractions();
        setupScrollAnimations();
        setupConnectionsModal();
        
        // Remove loading states
        [playlistsGrid, recentGrid, artistsGrid].forEach(grid => {
            utils.hideLoader(grid);
        });
    } catch (error) {
        console.error('Failed to initialize profile:', error);
        showError(error.message);
    }
}

// Render functions
function renderPlaylists() {
    playlistsGrid.innerHTML = mockPlaylists.map(playlist => `
        <div class="card" data-id="${playlist.id}">
            <div class="card-content">
                <h3 class="card-title">${playlist.title}</h3>
                <p class="card-subtitle">${playlist.tracks} tracks</p>
            </div>
        </div>
    `).join('');
}

function renderRecentlyPlayed() {
    recentGrid.innerHTML = mockRecentlyPlayed.map(track => `
        <div class="card" data-id="${track.id}">
            <div class="card-content">
                <h3 class="card-title">${track.title}</h3>
                <p class="card-subtitle">${track.artist}</p>
            </div>
        </div>
    `).join('');
}

function renderArtists() {
    artistsGrid.innerHTML = mockArtists.map(artist => `
        <div class="card" data-id="${artist.id}">
            <div class="card-content">
                <h3 class="card-title">${artist.name}</h3>
                <p class="card-subtitle">${artist.followers} followers</p>
            </div>
        </div>
    `).join('');
}

function renderActivityFeed() {
    activityFeed.innerHTML = mockActivities.map(activity => `
        <div class="activity-item" data-activity-id="${activity.id}">
            <div class="activity-icon">${activity.icon}</div>
            <div class="activity-content">
                <div class="activity-header">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-timestamp">${formatTimestamp(activity.timestamp)}</div>
                </div>
                <div class="activity-description">${activity.description}</div>
                <div class="activity-meta">
                    <span>
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        ${activity.likes}
                    </span>
                    <span>
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"/>
                        </svg>
                        ${activity.comments}
                    </span>
                </div>
            </div>
        </div>
    `).join('');
}

function setupActivityInteractions() {
    activityFeed.addEventListener('click', (e) => {
        const activityItem = e.target.closest('.activity-item');
        if (activityItem) {
            const activityId = activityItem.dataset.activityId;
            showActivityDetails(activityId);
        }
    });
}

function showActivityDetails(activityId) {
    const activity = mockActivities.find(a => a.id === parseInt(activityId));
    if (!activity) return;

    const detailsContainer = activityModal.querySelector('.activity-details');
    detailsContainer.innerHTML = `
        <div class="activity-detail-content">
            <h4>${activity.title}</h4>
            <p>${activity.description}</p>
            <div class="activity-interactions">
                <div class="likes">
                    <span>${activity.likes}</span> likes
                </div>
                <div class="comments">
                    <span>${activity.comments}</span> comments
                </div>
            </div>
        </div>
    `;

    activityModal.classList.add('active');
}

function setupInfiniteScroll() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadMoreActivities();
            }
        });
    }, { threshold: 0.5 });

    // Observe the last activity item
    const lastActivity = activityFeed.lastElementChild;
    if (lastActivity) {
        observer.observe(lastActivity);
    }
}

async function loadMoreActivities() {
    // Simulate loading more activities
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    activityFeed.appendChild(loadingIndicator);

    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Add more activities...
        loadingIndicator.remove();
    } catch (error) {
        console.error('Failed to load more activities:', error);
        loadingIndicator.innerHTML = 'Failed to load more activities. Tap to retry.';
        loadingIndicator.addEventListener('click', loadMoreActivities);
    }
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
}

// Event Listeners
function setupEventListeners() {
    // Edit profile button
    document.querySelector('.edit-profile-btn').addEventListener('click', () => {
        // Implement edit profile functionality
        console.log('Edit profile clicked');
    });

    // Edit profile image button
    document.querySelector('.edit-image-btn').addEventListener('click', () => {
        // Implement profile image change functionality
        console.log('Edit image clicked');
    });

    // View all buttons
    document.querySelectorAll('.view-all-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const section = e.target.dataset.section;
            console.log(`View all clicked for ${section}`);
            // Implement view all functionality
        });
    });

    // Card clicks
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            console.log(`Card clicked: ${id}`);
            // Implement card click functionality
        });
    });
}

function setupModalHandlers() {
    // Open modal
    document.querySelector('.edit-profile-btn').addEventListener('click', () => {
        editProfileModal.classList.add('active');
        document.getElementById('edit-name').value = profileName.textContent;
        document.getElementById('edit-bio').value = profileBio.textContent;
    });

    // Close modal
    document.querySelector('.cancel-btn').addEventListener('click', () => {
        editProfileModal.classList.remove('active');
    });

    // Handle form submission
    editProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newName = document.getElementById('edit-name').value;
        const newBio = document.getElementById('edit-bio').value;

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Update UI
            profileName.textContent = newName;
            profileBio.textContent = newBio;
            
            // Close modal
            editProfileModal.classList.remove('active');
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert('Failed to update profile. Please try again.');
        }
    });
}

function setupImageUpload() {
    const imageInput = document.createElement('input');
    imageInput.type = 'file';
    imageInput.accept = 'image/*';
    
    document.querySelector('.edit-image-btn').addEventListener('click', () => {
        imageInput.click();
    });

    imageInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const profileImage = document.getElementById('profile-image');
                profileImage.style.opacity = '0.5';
                
                // Compress image before upload
                const compressedImage = await compressImage(file);
                
                // Here you would typically upload the file to your server
                // For now, we'll just update the preview
                const reader = new FileReader();
                reader.onload = (e) => {
                    profileImage.src = e.target.result;
                    profileImage.style.opacity = '1';
                };
                reader.readAsDataURL(compressedImage);
                
            } catch (error) {
                console.error('Failed to upload image:', error);
                // Reset to default image if upload fails
                profileImage.src = DEFAULT_PROFILE_IMAGE;
                profileImage.style.opacity = '1';
                alert('Failed to upload image. Please try again.');
            }
        }
    });
}

function setupPlaylistInteractions() {
    const playlistCards = document.querySelectorAll('#playlists-grid .card');
    
    playlistCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.card-actions')) {
                const playlistId = card.dataset.id;
                // Navigate to playlist page
                console.log('Navigate to playlist:', playlistId);
            }
        });
    });
}

function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '50px'
    });

    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('animate-on-scroll');
        observer.observe(section);
    });
}

function setupConnectionsModal() {
    // Open modal on stats click
    document.getElementById('followers-stat').addEventListener('click', () => {
        openConnectionsModal('followers');
    });

    document.getElementById('following-stat').addEventListener('click', () => {
        openConnectionsModal('following');
    });

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            switchConnectionsTab(tab);
        });
    });

    // Close modal
    document.querySelector('#connections-modal .close-btn').addEventListener('click', () => {
        connectionsModal.classList.remove('active');
    });
}

function openConnectionsModal(tab) {
    connectionsModal.classList.add('active');
    switchConnectionsTab(tab);
}

function switchConnectionsTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // Show/hide appropriate list
    followersList.classList.toggle('hidden', tab !== 'followers');
    followingList.classList.toggle('hidden', tab !== 'following');

    // Load data if needed
    if (tab === 'followers') {
        renderConnectionsList(followersList, mockConnections.followers);
    } else {
        renderConnectionsList(followingList, mockConnections.following);
    }
}

function renderConnectionsList(container, connections) {
    container.innerHTML = connections.map(user => `
        <div class="connection-item" data-user-id="${user.id}">
            <img class="connection-avatar" src="${user.avatar}" alt="${user.name}'s avatar">
            <div class="connection-info">
                <div class="connection-name">${user.name}</div>
                <div class="connection-meta">${user.mutualFriends} mutual friends</div>
            </div>
            <div class="connection-actions">
                ${user.isFollowing ? 
                    `<button class="secondary-button unfollow-btn">Unfollow</button>` :
                    `<button class="primary-button follow-btn">Follow</button>`
                }
            </div>
        </div>
    `).join('');

    // Add event listeners for follow/unfollow buttons
    setupConnectionActions(container);
}

function setupConnectionActions(container) {
    container.querySelectorAll('.follow-btn, .unfollow-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const userId = e.target.closest('.connection-item').dataset.userId;
            const isFollowing = e.target.classList.contains('unfollow-btn');
            
            try {
                // Simulate API call
                await toggleFollow(userId, !isFollowing);
                
                // Update UI
                const newBtn = isFollowing ? 
                    `<button class="primary-button follow-btn">Follow</button>` :
                    `<button class="secondary-button unfollow-btn">Unfollow</button>`;
                
                e.target.parentElement.innerHTML = newBtn;
                
                // Update counts
                updateFollowCounts(!isFollowing);
            } catch (error) {
                console.error('Failed to update follow status:', error);
                alert('Failed to update follow status. Please try again.');
            }
        });
    });
}

async function toggleFollow(userId, shouldFollow) {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    // In real implementation, make API call here
    return true;
}

function updateFollowCounts(isIncrement) {
    const followingCount = document.getElementById('following-count');
    const currentCount = parseInt(followingCount.textContent);
    followingCount.textContent = isIncrement ? currentCount + 1 : currentCount - 1;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setupProfileImage();
    const playlistCards = document.querySelectorAll('.playlist-card:not(.create-playlist-card)');
    const createPlaylistCard = document.querySelector('.create-playlist-card');

    // Play button functionality
    playlistCards.forEach(card => {
        const playButton = card.querySelector('.play-overlay');
        playButton?.addEventListener('click', (e) => {
            e.stopPropagation();
            const playlistTitle = card.querySelector('.playlist-title').textContent;
            // Integrate with your audio player
            console.log(`Playing playlist: ${playlistTitle}`);
        });

        // Card click for viewing playlist details
        card.addEventListener('click', () => {
            const playlistTitle = card.querySelector('.playlist-title').textContent;
            // Navigate to playlist detail view
            console.log(`Viewing playlist: ${playlistTitle}`);
        });
    });

    // Create playlist functionality
    createPlaylistCard.addEventListener('click', () => {
        // Show create playlist modal
        showCreatePlaylistModal();
    });
});

function showCreatePlaylistModal() {
    // Implementation for create playlist modal
    console.log('Show create playlist modal');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeProfile);

// Update image compression settings for larger profile image
async function compressImage(file, options) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            let width = img.width;
            let height = img.height;
            
            // Increased max dimensions for better quality
            const maxWidth = 400;
            const maxHeight = 400;
            
            if (width > maxWidth) {
                height = (maxWidth * height) / width;
                width = maxWidth;
            }
            if (height > maxHeight) {
                width = (maxHeight * width) / height;
                height = maxHeight;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            ctx.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg', 0.9); // Increased quality to 0.9
        };
    });
}

function setupProfileImage() {
    const profileImage = document.getElementById('profile-image');
    const imageContainer = document.querySelector('.profile-image-container');

    // Set default image and error handling
    profileImage.onerror = () => {
        profileImage.src = DEFAULT_PROFILE_IMAGE;
        imageContainer.classList.add('error');
    };

    // Remove error class when image loads successfully
    profileImage.onload = () => {
        imageContainer.classList.remove('error');
    };

    // Image upload handling
    const editButton = document.querySelector('.edit-image-btn');
    editButton.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    profileImage.classList.add('loading');
                    // Here you would typically upload to your server
                    // For now, just preview the image
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        profileImage.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                } catch (error) {
                    console.error('Failed to update profile image:', error);
                    profileImage.src = DEFAULT_PROFILE_IMAGE;
                } finally {
                    profileImage.classList.remove('loading');
                }
            }
        };

        input.click();
    });
}

