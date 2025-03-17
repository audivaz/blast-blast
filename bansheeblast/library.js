// Enhanced state management matching player pattern
const libraryState = {
    currentFilter: 'all',
    searchQuery: '',
    loading: false,
    error: null,
    items: [],
    updateState(newState) {
        Object.assign(this, newState);
        this.render();
    }
};

// Error handling constants
const ERROR_STATES = {
    NETWORK_ERROR: 'Check your internet connection',
    AUTH_ERROR: 'Please log in again',
    SERVER_ERROR: 'Server is temporarily unavailable',
    NOT_FOUND: 'Content not found'
};

// Cache management
const CACHE_CONFIG = {
    key: 'library-cache-v1',
    maxAge: 1000 * 60 * 60 // 1 hour
};

document.addEventListener('DOMContentLoaded', () => {
    // Feature detection
    const features = {
        intersectionObserver: 'IntersectionObserver' in window,
        webAnimations: 'animate' in Element.prototype,
        customProperties: CSS.supports('(--custom-property: red)')
    };

    // Initialize components
    initializeLoader();
    initializeSearch();
    initializeLazyLoading();
    initializeKeyboardShortcuts();
    setupAnalytics();
    loadLibrary();

    // Add ARIA live region for dynamic updates
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('role', 'status');
    document.body.appendChild(liveRegion);

    // Initialize loader
    function initializeLoader() {
        const loader = document.getElementById('loader');

        function showLoader() {
            loader.style.display = 'block';
            libraryState.loading = true;
        }

        function hideLoader() {
            loader.style.display = 'none';
            libraryState.loading = false;
        }

        return { showLoader, hideLoader };
    }

    // Initialize search with debounce
    function initializeSearch() {
        const searchInput = document.getElementById('search');
        
        const debounce = (func, wait) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        };

        const handleSearch = debounce((searchTerm) => {
            libraryState.updateState({ searchQuery: searchTerm });
            filterItems(searchTerm);
        }, 300);

        searchInput.addEventListener('input', (e) => handleSearch(e.target.value));
    }

    // Initialize lazy loading
    function initializeLazyLoading() {
        if (features.intersectionObserver) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            observer.unobserve(img);
                        }
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        } else {
            // Fallback for browsers without IntersectionObserver
            document.querySelectorAll('img[data-src]').forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            });
        }
    }

    // Initialize keyboard shortcuts
    function initializeKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && !e.ctrlKey) {
                e.preventDefault();
                document.querySelector('#library-search').focus();
            }
        });
    }

    // Cache management functions
    async function cacheLibraryData(data) {
        try {
            localStorage.setItem(CACHE_CONFIG.key, JSON.stringify({
                timestamp: Date.now(),
                data
            }));
        } catch (e) {
            console.warn('Cache storage failed:', e);
        }
    }

    async function getCachedData() {
        try {
            const cached = localStorage.getItem(CACHE_CONFIG.key);
            if (!cached) return null;

            const { timestamp, data } = JSON.parse(cached);
            if (Date.now() - timestamp > CACHE_CONFIG.maxAge) {
                localStorage.removeItem(CACHE_CONFIG.key);
                return null;
            }

            return data;
        } catch (e) {
            console.warn('Cache retrieval failed:', e);
            return null;
        }
    }

    // Main library loading function
    async function loadLibrary() {
        const { showLoader, hideLoader } = initializeLoader();
        showLoader();

        try {
            // Try to get cached data first
            const cachedData = await getCachedData();
            if (cachedData) {
                renderLibrary(cachedData);
                return;
            }

            const [playlists, favoriteSongs, recentlyPlayed] = await Promise.all([
                fetchPlaylists(),
                fetchFavoriteSongs(),
                fetchRecentlyPlayed()
            ]);

            const libraryData = { playlists, favoriteSongs, recentlyPlayed };
            await cacheLibraryData(libraryData);
            renderLibrary(libraryData);

        } catch (error) {
            handleError(error);
        } finally {
            hideLoader();
        }
    }

    // Error handling
    function handleError(error) {
        this.ui.hideLoading();
        this.ui.showError(error.message);
    }

    // Analytics
    function setupAnalytics() {
        window.trackUserInteraction = function(action, category, label) {
            if (typeof analytics !== 'undefined') {
                analytics.track({
                    action,
                    category,
                    label,
                    timestamp: new Date().toISOString()
                });
            }
        };
    }

    // Enhanced render function with smooth transitions
    function renderLibrary(data) {
        const { playlists, favoriteSongs, recentlyPlayed } = data;
        
        // Add fade-in animation
        const sections = document.querySelectorAll('.library-section');
        sections.forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
        });

        // Render content
        appendItems('playlists-section', playlists, renderPlaylistItem);
        appendItems('liked-songs', favoriteSongs, renderSongItem);
        appendItems('recently-played', recentlyPlayed, renderSongItem);

        // Animate sections
        requestAnimationFrame(() => {
            sections.forEach(section => {
                section.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            });
        });

        setupCarousels();
        addEventListeners();
    }

    // Enhanced appendItems function
    function appendItems(sectionClass, items, renderFunction) {
        const carousel = document.querySelector(`.${sectionClass} .carousel`);
        if (!carousel) return;

        carousel.innerHTML = '';
        
        const itemsPerCell = 5;
        for (let i = 0; i < items.length; i += itemsPerCell) {
            const cellItems = items.slice(i, i + itemsPerCell);
            const cell = document.createElement('div');
            cell.className = 'carousel-cell';
            
            const itemsContainer = document.createElement('div');
            itemsContainer.className = 'items';
            itemsContainer.innerHTML = cellItems.map(renderFunction).join('');
            
            cell.appendChild(itemsContainer);
            carousel.appendChild(cell);
        }

        initializeCarousel(carousel);
    }

    // Initialize carousel with Flickity
    function initializeCarousel(carousel) {
        if (carousel.flickity) {
            carousel.flickity.destroy();
        }

        const flkty = new Flickity(carousel, {
            cellAlign: 'left',
            contain: true,
            wrapAround: true,
            pageDots: true,
            prevNextButtons: true,
            autoPlay: false,
            fade: true,
            dragThreshold: 10,
            adaptiveHeight: true
        });

        // Update layout after images load
        if (typeof imagesLoaded === 'function') {
            imagesLoaded(carousel, function() {
                flkty.reloadCells();
                flkty.resize();
            });
        }
    }

    // Add filter functionality
    function filterLibrary(filter) {
        const items = document.querySelectorAll('.item');
        items.forEach(item => {
            const itemType = item.dataset.type;
            if (filter === 'all' || itemType === filter) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Add event listeners to filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const filter = button.dataset.filter;
            filterLibrary(filter);
        });
    });

    // Add search functionality
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        const items = document.querySelectorAll('.item');
        items.forEach(item => {
            const title = item.querySelector('h3').textContent.toLowerCase();
            const artist = item.querySelector('p').textContent.toLowerCase();
            if (title.includes(query) || artist.includes(query)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });

    // Main function to load library content
    async function loadLibrary() {
        showLoader();

        try {
            const playlists = await fetchPlaylists();
            const favoriteSongs = await fetchFavoriteSongs();
            const recentlyPlayed = await fetchRecentlyPlayed();

            appendItems('playlists-section', playlists, renderPlaylistItem);
            appendItems('liked-songs', favoriteSongs, renderSongItem); // Updated section class
            appendItems('recently-played', recentlyPlayed, renderSongItem);

            addClickEvents();
            setupKeyboardNavigation();
        } catch (error) {
            console.error('Error loading library:', error);
            let errorMessage = 'Error loading content. Please try again later.';
            if (error.message === 'Network error') {
                errorMessage = 'Unable to connect to the server. Please check your internet connection.';
            } else if (error.message === 'Not found') {
                errorMessage = 'The requested content could not be found.';
            }
            document.querySelectorAll('.items').forEach(section => {
                section.innerHTML = `<p>${errorMessage}</p>`;
            });
        } finally {
            hideLoader();
        }
    }

    function initializeSection(sectionClass, items) {
        const section = document.querySelector(`.${sectionClass} .items`);
        if (!section) return;

        section.innerHTML = items.map(item => `
            <div class="item" data-type="songs">
                <div class="img-container">
                    <img src="${item.image}" alt="${item.title}" loading="lazy">
                    <div class="play-overlay">
                        <button class="play-button" aria-label="Play ${item.title}">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>
                </div>
                <div class="item-content">
                    <div class="text-content">
                        <h3>${item.title}</h3>
                        <p>${item.artist}</p>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function setupEventListeners() {
        // Add click events for play buttons
        document.querySelectorAll('.play-button').forEach(button => {
            button.addEventListener('click', handlePlayClick);
        });

        // Add keyboard navigation
        document.addEventListener('keydown', handleKeyboardNavigation);
    }

    function handlePlayClick(event) {
        const button = event.currentTarget;
        const songData = {
            title: button.dataset.songTitle,
            artist: button.dataset.artist,
            image: button.dataset.image,
            src: button.dataset.src
        };
        // Handle play functionality
        console.log('Playing:', songData);
        // Add actual play implementation here
    }

    function handleKeyboardNavigation(event) {
        // Add keyboard navigation implementation
    }

    // Initialize carousels with consistent options
    function setupCarousels() {
        const carousels = document.querySelectorAll('.carousel');
        carousels.forEach(carousel => {
            new Flickity(carousel, {
                cellAlign: 'left',
                contain: true,
                wrapAround: true,
                pageDots: true,
                prevNextButtons: true,
                adaptiveHeight: false,
                dragThreshold: 10,
                fade: true
            });
        });
    }

    // Back to Top Button Functionality
    const backToTopButton = document.getElementById('backToTop');

    function toggleBackToTopButton() {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    }

    window.addEventListener('scroll', toggleBackToTopButton);

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Footer Year Update
    const copyrightYear = document.querySelector('.copyright');
    if (copyrightYear) {
        const currentYear = new Date().getFullYear();
        copyrightYear.textContent = `© ${currentYear} Banshee Music App. All rights reserved.`;
    }

    // Initialize the library
    async function initLibrary() {
        showLoader();
        try {
            const data = await loadLibraryData();
            renderLibrary(data);
        } catch (error) {
            handleError(error);
        }
    }

    initLibrary();
});

// Enhanced library functionality
class LibraryManager {
    constructor() {
        this.state = {
            filter: 'all',
            searchQuery: '',
            loading: false,
            items: {
                playlists: [],
                likedSongs: [],
                recentlyPlayed: []
            }
        };
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadInitialData();
        this.initializeCarousels();
        this.setupSearch();
        this.setupFilters();
    }

    setupEventListeners() {
        // Create playlist button
        document.querySelector('.create-playlist-btn')?.addEventListener('click', () => {
            this.handleCreatePlaylist();
        });

        // Play all buttons
        document.querySelectorAll('.play-all-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.closest('.library-section');
                this.handlePlayAll(section.dataset.type);
            });
        });

        // Item click handlers
        document.addEventListener('click', (e) => {
            const item = e.target.closest('.carousel-item');
            if (item) {
                this.handleItemClick(item);
            }
        });
    }

    async loadInitialData() {
        this.setState({ loading: true });
        try {
            const [playlists, likedSongs, recentlyPlayed] = await Promise.all([
                this.fetchPlaylists(),
                this.fetchLikedSongs(),
                this.fetchRecentlyPlayed()
            ]);

            this.setState({
                items: { playlists, likedSongs, recentlyPlayed },
                loading: false
            });
        } catch (error) {
            console.error('Failed to load library data:', error);
            this.setState({ loading: false, error });
        }
    }

    initializeCarousels() {
        document.querySelectorAll('.carousel').forEach(carousel => {
            new Flickity(carousel, {
                cellAlign: 'left',
                contain: true,
                wrapAround: true,
                pageDots: true,
                prevNextButtons: true,
                adaptiveHeight: false,
                dragThreshold: 10,
                fade: true
            });
        });
    }

    setupSearch() {
        const searchInput = document.getElementById('library-search');
        if (!searchInput) return;

        const debounce = (fn, delay) => {
            let timeoutId;
            return (...args) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => fn.apply(this, args), delay);
            };
        };

        searchInput.addEventListener('input', debounce((e) => {
            this.handleSearch(e.target.value);
        }, 300));
    }

    setupFilters() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleFilterChange(e.target.dataset.filter);
            });
        });
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.render();
    }

    render() {
        if (this.state.loading) {
            this.renderLoadingState();
            return;
        }

        this.renderPlaylists();
        this.renderLikedSongs();
        this.renderRecentlyPlayed();
    }

    // Additional methods would go here...
}

class RecentlyPlayedSection {
    constructor() {
        this.carousel = document.querySelector('.recently-played .carousel');
        this.itemsPerPage = 5;
    }

    async initialize() {
        if (!this.carousel) return;
        
        try {
            showLoader();
            const recentlyPlayed = await this.fetchRecentlyPlayed();
            this.renderItems(recentlyPlayed);
            this.initializeCarousel();
            this.addEventListeners();
        } catch (error) {
            console.error('Error loading recently played:', error);
            this.showError('Unable to load recently played tracks');
        } finally {
            hideLoader();
        }
    }

    async fetchRecentlyPlayed() {
        // This would be replaced with actual API call
        const response = await fetch('/api/recently-played');
        if (!response.ok) throw new Error('Failed to fetch recently played');
        return await response.json();
    }

    renderItems(items) {
        // Clear existing content
        this.carousel.innerHTML = '';
        
        // Create carousel cells
        for (let i = 0; i < items.length; i += this.itemsPerPage) {
            const cellItems = items.slice(i, i + this.itemsPerPage);
            const cell = this.createCarouselCell(cellItems);
            this.carousel.appendChild(cell);
        }
    }

    createCarouselCell(items) {
        const cell = document.createElement('div');
        cell.className = 'carousel-cell';
        
        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'items';
        
        itemsContainer.innerHTML = items.map(item => `
            <div class="item" data-id="${item.id}">
                <div class="img-container">
                    <img src="${item.image}" alt="${item.title}" loading="lazy">
                    <div class="play-overlay">
                        <button class="play-button" aria-label="Play ${item.title}">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>
                </div>
                <div class="item-content">
                    <div class="text-content">
                        <h3>${item.title}</h3>
                        <p>${item.artist}</p>
                    </div>
                </div>
            </div>
        `).join('');

        cell.appendChild(itemsContainer);
        return cell;
    }

    initializeCarousel() {
        if (this.flickityInstance) {
            this.flickityInstance.destroy();
        }

        this.flickityInstance = new Flickity(this.carousel, {
            cellAlign: 'left',
            contain: true,
            wrapAround: true,
            pageDots: true,
            prevNextButtons: true,
            autoPlay: false,
            fade: true,
            dragThreshold: 10,
            adaptiveHeight: true
        });
    }

    addEventListeners() {
        this.carousel.addEventListener('click', (e) => {
            const playButton = e.target.closest('.play-button');
            if (playButton) {
                const item = playButton.closest('.item');
                const id = item.dataset.id;
                this.handlePlay(id);
            }
        });
    }

    handlePlay(id) {
        // Handle play functionality
        console.log(`Playing track ${id}`);
        // Add your play logic here
    }

    showError(message) {
        this.carousel.innerHTML = `
            <div class="error-message">
                <p>${message}</p>
                <button class="retry-button">Retry</button>
            </div>
        `;

        const retryButton = this.carousel.querySelector('.retry-button');
        if (retryButton) {
            retryButton.addEventListener('click', () => this.initialize());
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    const cache = new Map();

    // Enhanced loader management
    const LoaderManager = {
        show() {
            loader.style.display = 'block';
            document.body.classList.add('loading');
        },
        hide() {
            loader.style.display = 'none';
            document.body.classList.remove('loading');
        }
    };

    // Cache management
    const CacheManager = {
        set(key, data) {
            cache.set(key, {
                timestamp: Date.now(),
                data
            });
        },
        get(key) {
            const cached = cache.get(key);
            if (!cached) return null;
            if (Date.now() - cached.timestamp > CACHE_DURATION) {
                cache.delete(key);
                return null;
            }
            return cached.data;
        }
    };

    // Enhanced error handling
    class LibraryError extends Error {
        constructor(message, type = 'GENERAL') {
            super(message);
            this.type = type;
        }
    }

    // Main function to load library content with enhanced error handling
    async function loadLibrary() {
        LoaderManager.show();

        try {
            const [playlists, favoriteSongs, recentlyPlayed] = await Promise.all([
                fetchWithCache('playlists'),
                fetchWithCache('favoriteSongs'),
                fetchWithCache('recentlyPlayed')
            ]);

            appendItems('playlists-section', playlists, renderPlaylistItem);
            appendItems('favorite-songs', favoriteSongs, renderSongItem);
            appendItems('recently-played', recentlyPlayed, renderSongItem);

            initializeInteractions();
        } catch (error) {
            handleError(error);
        } finally {
            LoaderManager.hide();
        }
    }

    // Enhanced fetch with caching
    async function fetchWithCache(endpoint) {
        const cached = CacheManager.get(endpoint);
        if (cached) return cached;

        try {
            let data;
            switch (endpoint) {
                case 'playlists':
                    data = await fetchPlaylists();
                    break;
                case 'favoriteSongs':
                    data = await fetchFavoriteSongs();
                    break;
                case 'recentlyPlayed':
                    data = await fetchRecentlyPlayed();
                    break;
                default:
                    throw new LibraryError('Invalid endpoint', 'FETCH_ERROR');
            }
            
            CacheManager.set(endpoint, data);
            return data;
        } catch (error) {
            throw new LibraryError(
                `Failed to fetch ${endpoint}: ${error.message}`,
                'FETCH_ERROR'
            );
        }
    }

    // Enhanced error handling
    function handleError(error) {
        console.error('Library Error:', error);
        
        const errorMessages = {
            'FETCH_ERROR': 'Unable to load content. Please check your connection.',
            'RENDER_ERROR': 'Error displaying content. Please refresh the page.',
            'GENERAL': 'An unexpected error occurred. Please try again.'
        };

        const message = errorMessages[error.type] || errorMessages.GENERAL;
        
        document.querySelectorAll('.items').forEach(section => {
            section.innerHTML = `
                <div class="error-state">
                    <p>${message}</p>
                    <button class="retry-button" onclick="window.location.reload()">
                        Retry
                    </button>
                </div>
            `;
        });
    }

    // Initialize all interactions
    function initializeInteractions() {
        setupKeyboardNavigation();
        addClickEvents();
        setupSearch();
        initializeCarousels();
    }

    // Enhanced keyboard navigation
    function setupKeyboardNavigation() {
        const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const focusable = [...document.querySelectorAll(focusableElements)]
                    .filter(el => !el.hasAttribute('disabled'));
                
                if (e.shiftKey) {
                    handleTabNavigation(focusable, e, 'backward');
                } else {
                    handleTabNavigation(focusable, e, 'forward');
                }
            }
        });

        // Enhanced item navigation
        document.querySelectorAll('.item').forEach(item => {
            item.addEventListener('keydown', (e) => {
                const actions = {
                    'Enter': () => item.querySelector('.play-button')?.click(),
                    'Space': () => item.querySelector('.play-button')?.click(),
                    'ArrowRight': () => focusNextItem(item),
                    'ArrowLeft': () => focusPreviousItem(item)
                };

                if (actions[e.code]) {
                    e.preventDefault();
                    actions[e.code]();
                }
            });
        });
    }

    function handleTabNavigation(focusable, event, direction) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        
        if (direction === 'backward' && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (direction === 'forward' && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    // Initialize carousels with error handling
    function initializeCarousels() {
        document.querySelectorAll('.carousel').forEach(carousel => {
            try {
                if (carousel.flickity) {
                    carousel.flickity.destroy();
                }

                const flkty = new Flickity(carousel, {
                    cellAlign: 'left',
                    contain: true,
                    wrapAround: true,
                    pageDots: true,
                    prevNextButtons: true,
                    autoPlay: false,
                    fade: true,
                    dragThreshold: 10,
                    adaptiveHeight: true
                });

                // Update layout after images load
                imagesLoaded(carousel, () => {
                    flkty.reloadCells();
                    flkty.resize();
                });
            } catch (error) {
                console.error('Carousel initialization error:', error);
                carousel.innerHTML = '<p>Error loading carousel. Please refresh the page.</p>';
            }
        });
    }

    // Start the library
    loadLibrary();
});
