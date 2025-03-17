document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');

    // Show loading spinner
    function showLoader() {
        loader.style.display = 'block';
    }

    // Hide loading spinner
    function hideLoader() {
        loader.style.display = 'none';
    }

    // Main function to load library content
    async function loadLibrary() {
        showLoader();

        try {
            const playlists = await fetchPlaylists();
            const favoriteSongs = await fetchFavoriteSongs();
            const recentlyPlayed = await fetchRecentlyPlayed();

            appendItems('playlists-section', playlists, renderPlaylistItem);
            appendItems('favorite-songs', favoriteSongs, renderSongItem);
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

    // Append items to the respective sections
    function appendItems(sectionClass, items, renderFunction) {
        const carousel = document.querySelector(`.${sectionClass} .carousel`);
        if (!carousel) return;

        // Clear existing content
        carousel.innerHTML = '';
        
        // Group items into cells, 5 items per cell
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

        // Initialize or reinitialize Flickity
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
        imagesLoaded(carousel, function() {
            flkty.reloadCells();
            flkty.resize();
        });
    }

    // Render a playlist item
    function renderPlaylistItem(item) {
        return `
            <div class="item">
                <div class="img-container">
                    <img src="${item.image}" alt="${item.title}" loading="lazy">
                </div>
                <div class="item-content">
                    <h3>${item.title}</h3>
                    <button class="primary-button">Play</button>
                </div>
            </div>
        `;
    }

    // Render a song item
    function renderSongItem(item) {
        return `
            <div class="item">
                <div class="img-container">
                    <img src="${item.image}" alt="${item.title}" loading="lazy">
                </div>
                <div class="item-content">
                    <h3>${item.title}</h3>
                    <button class="primary-button">Play</button>
                </div>
            </div>
        `;
    }

    // Setup search functionality
    function setupSearch() {
        const searchInput = document.getElementById('search');
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const allItems = document.querySelectorAll('.item');
            
            allItems.forEach(item => {
                const title = item.querySelector('h3').textContent.toLowerCase();
                const artist = item.querySelector('p')?.textContent.toLowerCase() || '';
                item.style.display = (title.includes(searchTerm) || artist.includes(searchTerm)) ? 'block' : 'none';
            });
        });
    }

    // Add click events to items
    function addClickEvents() {
        const items = document.querySelectorAll('.item');
        items.forEach(item => {
            item.addEventListener('click', () => {
                const title = item.querySelector('h3').textContent;
                console.log(`Playing: ${title}`);
                // Here you would add logic to play the song or open the playlist
            });
        });
    }

    // Setup keyboard navigation for accessibility
    function setupKeyboardNavigation() {
        const items = document.querySelectorAll('.item');
        items.forEach(item => {
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    item.click();
                }
            });
        });
    }

    // Simulated API calls
    async function fetchPlaylists() {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return Array(15).fill(null).map((_, i) => ({
            title: `Playlist ${i + 1}`,
            image: `imgs/playlist${i + 1}.jpg`,
            trackCount: Math.floor(Math.random() * 20) + 5,
            duration: '2h 30m'
        }));
    }
    
    async function fetchFavoriteSongs() {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return [
            { title: 'Song Title 1', artist: 'Artist Name 1', image: 'imgs/song1.jpg' },
            { title: 'Song Title 2', artist: 'Artist Name 2', image: 'imgs/song2.jpg' },
            { title: 'Song Title 3', artist: 'Artist Name 3', image: 'imgs/song3.jpg' },
            { title: 'Song Title 4', artist: 'Artist Name 4', image: 'imgs/song4.jpg' }
        ];
    }
    
    async function fetchRecentlyPlayed() {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return [
            { title: 'Song Title 5', artist: 'Artist Name 5', image: 'imgs/song5.jpg' },
            { title: 'Song Title 6', artist: 'Artist Name 6', image: 'imgs/song6.jpg' },
            { title: 'Song Title 7', artist: 'Artist Name 7', image: 'imgs/song7.jpg' },
            { title: 'Song Title 8', artist: 'Artist Name 8', image: 'imgs/song8.jpg' }
        ];
    }

    // Initialize the library
    loadLibrary();
    setupSearch();

    function handleError(error) {
        console.error('An error occurred:', error);
        // Display error message to user
        const errorMessage = document.createElement('div');
        errorMessage.textContent = 'An error occurred. Please try again later.';
        errorMessage.className = 'error-message';
        document.body.prepend(errorMessage);
        setTimeout(() => errorMessage.remove(), 5000);
    }
});
