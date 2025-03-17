// Function to load optimized images
function loadOptimizedImage(img) {
    const src = img.dataset.src;
    if (src) {
        img.src = src;
    }
}

// Intersection Observer for lazy loading images
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
                loadOptimizedImage(img);
                imageObserver.unobserve(img);
            }
        }
    });
});

document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    imageObserver.observe(img);
});

// Back to top button functionality
document.addEventListener('DOMContentLoaded', () => {
    const backToTopButton = document.getElementById('backToTop');
    
    if (backToTopButton) {
        // Show/hide based on scroll position
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });

        // Scroll to top when clicked
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});

// Navbar and Dropdown functionality
import { insertNavbar } from './components/Navbar.js';

document.addEventListener('DOMContentLoaded', () => {
    // Insert navbar
    insertNavbar();

    // Navbar dropdown functionality
    const profileButton = document.querySelector('.profile-button');
    const dropdown = document.querySelector('.dropdown');

    if (profileButton && dropdown) {
        profileButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const isExpanded = profileButton.getAttribute('aria-expanded') === 'true';
            
            profileButton.setAttribute('aria-expanded', !isExpanded);
            dropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && !profileButton.contains(e.target)) {
                dropdown.classList.remove('show');
                profileButton.setAttribute('aria-expanded', 'false');
            }
        });

        // Handle logout click
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

// Consolidated event listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // Image optimization
    document.querySelectorAll('img').forEach(loadOptimizedImage);
    
    // Section updates
    createStars();
    updateSection('trending', API.getTrendingMusic, updateMusicItem);
    updateSection('featured-artists', API.getFeaturedArtists, updateArtistItem);
    updateSection('new-releases', API.getNewReleases, updateMusicItem);
    updateSection('recommendations', API.getRecommendations, updateMusicItem);

    // Back to top functionality
    const backToTopButton = document.getElementById('backToTop');
    if (backToTopButton) {
        // Show/hide based on scroll position
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });

        // Scroll to top when clicked
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});

// Single star creation implementation
function createStars() {
    const starsContainer = document.querySelector('.stars');
    if (!starsContainer) return;
    
    starsContainer.innerHTML = '';
    
    // Create stars
    for (let i = 0; i < 20; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        
        // Random position
        const randomX = Math.random() * 100;
        const randomY = Math.random() * 100;
        star.style.left = `${randomX}%`;
        star.style.top = `${randomY}%`;
        
        starsContainer.appendChild(star);
    }
}

// Single initialization point
document.addEventListener('DOMContentLoaded', () => {
    createStars();
    // Recreate stars every 3 seconds
    setInterval(createStars, 3000);
});

// Simulated API calls
const API = {
    getTrendingMusic: async () => [
        { title: 'Album 1', image: 'imgs/album-01.png' },
        { title: 'Album 2', image: 'imgs/album-02.png' },
        { title: 'Album 3', image: 'imgs/album-03.png' },
        { title: 'Album 4', image: 'imgs/album-04.png' }
    ],
    getFeaturedArtists: async () => [
        { name: 'Artist 1', image: 'imgs/album-05.png' },
        { name: 'Artist 2', image: 'imgs/album-06.png' },
        { name: 'Artist 3', image: 'imgs/album-07.png' },
        { name: 'Artist 4', image: 'imgs/album-08.png' }
    ],
    getNewReleases: async () => [
        { title: 'Album 5', image: 'imgs/album-09.png' },
        { title: 'Album 6', image: 'imgs/album-10.png' }
    ],
    getRecommendations: async () => [
        { title: 'Recommended Album 1', image: 'imgs/note-B.png' },
        { title: 'Recommended Album 2', image: 'imgs/note-B.png' }
    ],
    logout: async () => {
        // Simulated logout API call
        // Replace with actual API call
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, 1000);
        });
    }
};

// Function to update sections with data
function updateSection(sectionId, apiCall, updateFunction) {
    const section = document.querySelector(`.${sectionId} .items`);
    apiCall().then(data => {
        data.forEach(item => {
            const element = updateFunction(item);
            section.appendChild(element);
        });
    });
}

// Function to update music items
function updateMusicItem(item) {
    const div = document.createElement('div');
    div.classList.add('item');
    div.innerHTML = `
        <img class="music-note" src="${item.image}" alt="${item.title}" loading="lazy">
        <h3>${item.title}</h3>
        <button aria-label="Play ${item.title}">Play</button>
    `;
    return div;
}

// Function to update artist items
function updateArtistItem(item) {
    const div = document.createElement('div');
    div.classList.add('item');
    div.innerHTML = `
        <img class="artist-mic" src="${item.image}" alt="${item.name}" loading="lazy">
        <h3>${item.name}</h3>
        <button aria-label="View Profile ${item.name}">View Profile</button>
    `;
    return div;
}

// Utility function to generate random numbers
function random_range(min, max) {
    return Math.random() * (max - min) + min;
}

// Initialize stars when page loads
document.addEventListener('DOMContentLoaded', () => {
    createStars();
});
