// Simulated API calls
const API = {
    getAllItems: async () => {
        // In a real application, this would be an API call to get all items
        return [
            { type: 'artist', name: 'Artist 1', image: 'imgs/album-03.png', genre: 'pop', popularity: 'trending' },
            { type: 'artist', name: 'Artist 2', image: 'imgs/album-04.png', genre: 'rock', popularity: 'most-popular' },
            { type: 'artist', name: 'Artist 3', image: 'imgs/album-05.png', genre: 'hiphop', popularity: 'new-releases' },
            { type: 'artist', name: 'Artist 4', image: 'imgs/album-01.png', genre: 'jazz', popularity: 'trending' },
            { type: 'album', title: 'Album 1', image: 'imgs/album-01.png', genre: 'pop', releaseDate: '2023-05-01' },
            { type: 'album', title: 'Album 2', image: 'imgs/album-02.png', genre: 'rock', releaseDate: '2023-04-15' },
            { type: 'album', title: 'Album 3', image: 'imgs/album-03.png', genre: 'hiphop', releaseDate: '2023-03-30' },
            { type: 'album', title: 'Album 4', image: 'imgs/album-04.png', genre: 'jazz', releaseDate: '2023-02-14' },
            { type: 'genre', name: 'Pop', image: 'imgs/genre-pop.png' },
            { type: 'genre', name: 'Rock', image: 'imgs/genre-rock.png' },
            { type: 'genre', name: 'Hip-Hop', image: 'imgs/genre-hiphop.png' },
            { type: 'genre', name: 'Jazz', image: 'imgs/genre-jazz.png' }
        ];
    }
};

// Utility functions
const utils = {
    showLoader: () => {
        document.getElementById('loader').style.display = 'block';
    },
    hideLoader: () => {
        document.getElementById('loader').style.display = 'none';
    }
};

let currentPage = 1;
const itemsPerPage = 8;

async function loadSection(sectionClass, dataFetcher, itemRenderer) {
    utils.showLoader();
    const section = document.querySelector(`.${sectionClass} .items`);
    try {
        const allData = await dataFetcher();
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedData = allData.slice(startIndex, endIndex);
        section.innerHTML = paginatedData.map(itemRenderer).join('');
        
        updatePagination(allData.length);
    } catch (error) {
        console.error(`Error loading ${sectionClass}:`, error);
        section.innerHTML = `<p>Error loading content. Please try again later.</p>`;
    } finally {
        utils.hideLoader();
    }
}

function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.classList.toggle('active', i === currentPage);
        button.addEventListener('click', () => {
            currentPage = i;
            applyFilters();
        });
        paginationContainer.appendChild(button);
    }
}

// Render functions for different item types
const renderArtistItem = (item) => `
    <div class="item">
        <img class="artist-mic" src="${item.image}" alt="${item.name}" loading="lazy">
        <h3>${item.name}</h3>
        <button>View Profile</button>
    </div>
`;

const renderMusicItem = (item) => `
    <div class="item">
        <img class="music-note" src="${item.image}" alt="${item.title}" loading="lazy">
        <h3>${item.title}</h3>
        <button>Play</button>
    </div>
`;

const renderGenreItem = (item) => `
    <div class="item">
        <img src="${item.image}" alt="${item.name}" loading="lazy">
        <h3>${item.name}</h3>
    </div>
`;

function applyFilters() {
    const genreFilter = document.querySelector('.filter-genre').value;
    const popularityFilter = document.querySelector('.filter-popularity').value;
    const releaseDateFilter = document.querySelector('.filter-release-date').value;

    loadSection('featured-artists', () => 
        API.getAllItems().then(items => items.filter(item => 
            item.type === 'artist' && 
            (genreFilter === '' || item.genre === genreFilter) &&
            (popularityFilter === '' || item.popularity === popularityFilter)
        )),
        renderArtistItem
    );

    loadSection('recommended-music', () => 
        API.getAllItems().then(items => items.filter(item => 
            item.type === 'album' && 
            (genreFilter === '' || item.genre === genreFilter) &&
            (releaseDateFilter === '' || isWithinDateRange(item.releaseDate, releaseDateFilter))
        )),
        renderMusicItem
    );

    loadSection('genres', () => 
        API.getAllItems().then(items => items.filter(item => item.type === 'genre')),
        renderGenreItem
    );
}

function isWithinDateRange(dateString, range) {
    const date = new Date(dateString);
    const now = new Date();
    switch(range) {
        case 'last-week':
            return (now - date) / (1000 * 60 * 60 * 24) <= 7;
        case 'last-month':
            return (now - date) / (1000 * 60 * 60 * 24) <= 30;
        case 'last-year':
            return (now - date) / (1000 * 60 * 60 * 24) <= 365;
        default:
            return true;
    }
}

function performSearch(searchTerm) {
    const lowercaseSearch = searchTerm.toLowerCase();
    API.getAllItems().then(allItems => {
        const searchResults = allItems.filter(item => 
            (item.name && item.name.toLowerCase().includes(lowercaseSearch)) ||
            (item.title && item.title.toLowerCase().includes(lowercaseSearch))
        );

        document.querySelectorAll('.section').forEach(section => section.style.display = 'none');
        const existingSearchResults = document.querySelector('.search-results');
        if (existingSearchResults) {
            existingSearchResults.remove();
        }
        const searchResultsSection = document.createElement('div');
        searchResultsSection.className = 'section search-results';
        
        if (searchResults.length === 0) {
            searchResultsSection.innerHTML = '<h2>Search Results</h2><p>No results found.</p>';
        } else {
            searchResultsSection.innerHTML = `
                <h2>Search Results</h2>
                <div class="items">
                    ${searchResults.map(item => {
                        if (item.type === 'artist') return renderArtistItem(item);
                        if (item.type === 'album') return renderMusicItem(item);
                        if (item.type === 'genre') return renderGenreItem(item);
                    }).join('')}
                </div>
            `;
        }
        document.querySelector('.content-container').appendChild(searchResultsSection);
    });
}

// Initialize the page when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize follow state
    let isFollowing = false;
    const followBtn = document.querySelector('.follow-btn');
    
    if (followBtn) {
        followBtn.addEventListener('click', () => {
            isFollowing = !isFollowing;
            followBtn.innerHTML = isFollowing ? 
                '<i class="fas fa-user-check"></i> Following' : 
                '<i class="fas fa-user-plus"></i> Follow';
            followBtn.classList.toggle('following', isFollowing);
            
            // Add animation effect
            followBtn.style.transform = 'scale(0.95)';
            setTimeout(() => followBtn.style.transform = '', 150);
        });
    }

    // Initialize carousel for popular tracks
    const popularTracks = new Flickity('.popular-tracks .carousel', {
        cellAlign: 'left',
        contain: true,
        pageDots: false,
        wrapAround: true,
        autoPlay: false,
        prevNextButtons: true,
        adaptiveHeight: true
    });

    // Initialize gallery
    const gallery = new Flickity('.gallery', {
        cellAlign: 'left',
        contain: true,
        wrapAround: true,
        fullscreen: true,
        lazyLoad: 2
    });

    // Handle play button click
    const playBtn = document.querySelector('.play-btn');
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            // Add play animation
            playBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            setTimeout(() => {
                playBtn.innerHTML = '<i class="fas fa-play"></i> Play';
            }, 2000);
        });
    }

    // Lazy load images
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    }

    // Share functionality
    const shareBtn = document.querySelector('.share-btn');
    const shareModal = document.querySelector('#shareModal');
    let modalBackdrop;

    function createBackdrop() {
        modalBackdrop = document.createElement('div');
        modalBackdrop.className = 'modal-backdrop';
        document.body.appendChild(modalBackdrop);
    }

    function showShareModal() {
        createBackdrop();
        shareModal.hidden = false;
        modalBackdrop.hidden = false;
    }

    function hideShareModal() {
        shareModal.hidden = true;
        modalBackdrop.hidden = true;
        modalBackdrop.remove();
    }

    shareBtn.addEventListener('click', showShareModal);

    // Close modal when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) {
            hideShareModal();
        }
    });

    // Share options functionality
    const shareOptions = document.querySelectorAll('.share-option');
    shareOptions.forEach(option => {
        option.addEventListener('click', () => {
            const platform = option.dataset.platform;
            const artistName = document.querySelector('.artist-name h1').textContent;
            const currentUrl = window.location.href;

            switch(platform) {
                case 'facebook':
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank');
                    break;
                case 'twitter':
                    window.open(`https://twitter.com/intent/tweet?text=Check out ${encodeURIComponent(artistName)} on Banshee Music!&url=${encodeURIComponent(currentUrl)}`, '_blank');
                    break;
                case 'instagram':
                    // Instagram doesn't support direct sharing links
                    alert('Open Instagram app to share');
                    break;
                default:
                    // Copy link functionality
                    navigator.clipboard.writeText(currentUrl).then(() => {
                        const originalText = option.textContent;
                        option.textContent = 'Link Copied!';
                        setTimeout(() => {
                            option.innerHTML = '<i class="fas fa-link"></i>Copy Link';
                        }, 2000);
                    });
            }
            hideShareModal();
        });
    });
});
