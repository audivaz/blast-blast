// Simulated API calls
const API = {
    getAllItems: async (page = 1, limit = 20) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // In a real application, this would be an API call to get paginated items
        const allItems = [
            { type: 'artist', name: 'Artist 1', image: 'imgs/album-03.png', genre: 'pop', popularity: 'trending' },
            { type: 'artist', name: 'Artist 2', image: 'imgs/album-04.png', genre: 'rock', popularity: 'most-popular' },
            // ... (add more items)
        ];

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        return allItems.slice(startIndex, endIndex);
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

const renderItem = (item) => {
    if (item.type === 'artist') {
        return renderArtistItem(item);
    } else if (item.type === 'album') {
        return renderMusicItem(item);
    } else if (item.type === 'genre') {
        return renderGenreItem(item);
    }
};

let currentPage = 1;
let isLoading = false;

// Add debouncing utility
let searchTimeout;
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
};

async function loadMoreItems(isNewSearch = false) {
    if (isLoading) return;
    isLoading = true;
    utils.showLoader();

    try {
        const items = await API.getAllItems(currentPage);
        
        // Group items by type
        const groupedItems = {
            artists: items.filter(item => item.type === 'artist'),
            music: items.filter(item => item.type === 'album'),
            genres: items.filter(item => item.type === 'genre')
        };

        Object.entries(groupedItems).forEach(([type, items]) => {
            const container = type === 'artists' ? '.featured-artists' :
                            type === 'music' ? '.recommended-music' :
                            '.genres';
            
            renderItemsToCarousel(container, items, isNewSearch);
        });

        currentPage++;
    } catch (error) {
        console.error('Error loading items:', error);
        showErrorMessage('Error loading content. Please try again later.');
    } finally {
        isLoading = false;
        utils.hideLoader();
    }
}

// Helper function to render items to carousel
function renderItemsToCarousel(containerSelector, items, isNewSearch) {
    const container = document.querySelector(`${containerSelector} .carousel`);
    if (!container) return;
    
    const itemsContainer = container.querySelector('.items');
    if (isNewSearch) {
        itemsContainer.innerHTML = '';
    }

    // Create document fragment for better performance
    const fragment = document.createDocumentFragment();
    
    items.forEach((item, index) => {
        if (index % 8 === 0) {
            const cell = document.createElement('div');
            cell.className = 'carousel-cell';
            cell.innerHTML = '<div class="items"></div>';
            fragment.appendChild(cell);
        }
        
        const itemElement = document.createElement('div');
        itemElement.className = 'item';
        itemElement.innerHTML = renderItem(item);
        fragment.appendChild(itemElement);
    });
    
    itemsContainer.appendChild(fragment);
    
    // Initialize/reinitialize Flickity
    const flkty = initializeCarousel(container);
    if (flkty) {
        flkty.reloadCells();
    }
}

// Helper function to show error messages
function showErrorMessage(message) {
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = message;
    document.querySelector('.container').appendChild(errorMessage);
    
    // Auto-remove error message after 5 seconds
    setTimeout(() => {
        errorMessage.remove();
    }, 5000);
}

function handleScroll() {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        loadMoreItems();
    }
}

function showNoResults(container) {
    const noResults = document.createElement('div');
    noResults.className = 'no-results';
    noResults.innerHTML = `
        <div class="empty-state">
            <p>No matching results found</p>
            <button class="primary-button" onclick="resetSearch()">Reset Search</button>
        </div>
    `;
    container.appendChild(noResults);
}

async function performSearch(searchTerm, filters = {}) {
    if (isLoading) return;
    
    const containers = document.querySelectorAll('.section');
    containers.forEach(container => container.classList.add('is-loading'));
    
    try {
        const items = await API.getAllItems(currentPage, 20, searchParams);
        
        containers.forEach(container => {
            container.classList.remove('is-loading');
            if (items.length === 0) {
                showNoResults(container);
            }
        });

        await loadMoreItems(true);

    } catch (error) {
        console.error('Search error:', error);
        containers.forEach(container => container.classList.remove('is-loading'));
    }
}

// Add touch event handling improvement
document.querySelectorAll('.carousel').forEach(carousel => {
    let startX;
    
    carousel.addEventListener('touchstart', (e) => {
        startX = e.touches[0].pageX;
    }, { passive: true });
    
    carousel.addEventListener('touchend', (e) => {
        const diffX = e.changedTouches[0].pageX - startX;
        if (Math.abs(diffX) < 5) {
            // Handle as click if barely moved
            e.target.click();
        }
    }, { passive: true });
});

// Add smooth transition handling
document.querySelectorAll('.section .item').forEach(item => {
    // Handle quick action buttons
    item.querySelectorAll('.quick-action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent item click
            
            // Add click animation
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                btn.style.transform = '';
            }, 150);

            const action = btn.getAttribute('aria-label');
            switch(action) {
                case 'Play':
                    // Handle play action
                    console.log('Playing...');
                    break;
                case 'Add to playlist':
                    // Handle add to playlist
                    console.log('Adding to playlist...');
                    break;
                case 'Share':
                    // Handle share
                    console.log('Sharing...');
                    break;
            }
        });
    });

    // Add hover sound effect (optional)
    item.addEventListener('mouseenter', () => {
        // You could add a subtle hover sound here
        // new Audio('hover-sound.mp3').play();
    });
});

// Smooth loading transitions
function revealItems() {
    const items = document.querySelectorAll('.section .item');
    items.forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 100); // Stagger the animations
    });
}

// Call this after content is loaded
document.addEventListener('DOMContentLoaded', () => {
    revealItems();
});

// Initialize the page when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    await loadHeader();
    
    // Mark the current page in the navigation
    const exploreLink = document.querySelector('a[href="explore.html"]');
    if (exploreLink) {
        exploreLink.setAttribute('aria-current', 'page');
    }

    loadMoreItems();
    
    // Debounced search input handler
    const searchInput = document.querySelector('.search-bar');
    searchInput.addEventListener('input', debounce((e) => {
        const searchTerm = e.target.value.trim();
        if (searchTerm.length >= 2) {
            performSearch(searchTerm);
        } else if (searchTerm.length === 0) {
            // Reset to initial state
            document.querySelector('.featured-artists .items').innerHTML = '';
            document.querySelector('.recommended-music .items').innerHTML = '';
            document.querySelector('.genres .items').innerHTML = '';
            currentPage = 1;
            loadMoreItems();
        }
    }, 300));

    // Search button click handler
    document.querySelector('.search-button').addEventListener('click', () => {
        const searchTerm = document.querySelector('.search-bar').value;
        if (searchTerm.trim() !== '') {
            performSearch(searchTerm);
        }
    });

    // Filter change handlers
    document.querySelectorAll('.filters-container select').forEach(select => {
        select.addEventListener('change', () => {
            const searchTerm = document.querySelector('.search-bar').value;
            performSearch(searchTerm);
        });
    });

    // Enhanced scroll handler
    const optimizedScrollHandler = debounce(() => {
        const scrollPosition = window.innerHeight + window.scrollY;
        const threshold = document.body.offsetHeight - 500;
        
        if (scrollPosition >= threshold) {
            loadMoreItems();
        }
    }, 150);

    window.addEventListener('scroll', optimizedScrollHandler, { passive: true });
});

// Optimize carousel initialization
function initializeCarousel(container) {
    if (!container) return;
    
    return new Flickity(container, {
        wrapAround: true,
        pageDots: true,
        prevNextButtons: true,
        autoPlay: 5000,
        pauseAutoPlayOnHover: true,
        lazyLoad: 2,
        cellSelector: '.carousel-cell',
        contain: true // Improves performance
    });
}

// Navbar and Dropdown functionality
document.addEventListener('DOMContentLoaded', () => {
    const profileButton = document.querySelector('.profile-button');
    const dropdown = document.querySelector('.dropdown');

    if (profileButton && dropdown) {
        profileButton.addEventListener('click', () => {
            const isExpanded = profileButton.getAttribute('aria-expanded') === 'true';
            profileButton.setAttribute('aria-expanded', !isExpanded);
            dropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (event) => {
            if (!profileButton.contains(event.target) && !dropdown.contains(event.target)) {
                profileButton.setAttribute('aria-expanded', 'false');
                dropdown.classList.remove('show');
            }
        });

        // Handle logout
        const logoutButton = dropdown.querySelector('.logout');
        if (logoutButton) {
            logoutButton.addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    // Add your logout logic here
                    window.location.href = 'login.html';
                } catch (error) {
                    console.error('Logout error:', error);
                }
            });
        }
    }
});
