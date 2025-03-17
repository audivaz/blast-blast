
export function insertNavbar() {
    const header = document.createElement('header');
    header.setAttribute('role', 'banner');
    
    header.innerHTML = `
        <nav class="main-nav" role="navigation" aria-label="Main Navigation">
            <div class="nav-container">
                <!-- Logo Section -->
                <div class="logo">
                    <a href="index.html" aria-label="Go to home page">
                        <img src="imgs/logo-B.png" alt="Banshee Music Logo" loading="lazy">
                    </a>
                </div>

                <!-- Mobile Menu Toggle -->
                <button class="mobile-menu-toggle" aria-label="Toggle menu" aria-expanded="false" aria-controls="main-menu">
                    <span class="hamburger"></span>
                </button>

                <!-- Main Menu -->
                <div class="nav-content" id="main-menu">
                    <ul class="menu" role="menubar">
                        <li role="none"><a href="index.html" role="menuitem">Home</a></li>
                        <li role="none"><a href="explore.html" role="menuitem">Explore</a></li>
                        <li role="none"><a href="library.html" role="menuitem">Library</a></li>
                        <li role="none"><a href="player.html" role="menuitem">Player</a></li>
                    </ul>

                    <!-- User Profile -->
                    <div class="user-profile">
                        <button class="profile-button" aria-expanded="false" aria-controls="user-menu">
                            <img class="profile-icon" src="imgs/profile-icon-B.png" alt="User Profile" loading="lazy">
                        </button>
                        <div id="user-menu" class="dropdown" hidden>
                            <ul role="menu">
                                <li role="none"><a href="profile.html" role="menuitem">Profile</a></li>
                                <li role="none"><a href="settings.html" role="menuitem">Settings</a></li>
                                <li role="none"><a href="notifications.html" role="menuitem">Notifications</a></li>
                                <li role="none"><a href="#" role="menuitem" class="logout">Logout</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    `;

    // Set active state
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const activeLink = header.querySelector(`a[href="${currentPage}"]`);
    if (activeLink) {
        activeLink.setAttribute('aria-current', 'page');
        activeLink.classList.add('active');
    }

    // Mobile menu functionality
    const menuToggle = header.querySelector('.mobile-menu-toggle');
    const navContent = header.querySelector('.nav-content');
    
    menuToggle?.addEventListener('click', () => {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', !isExpanded);
        navContent.classList.toggle('show');
    });

    // Profile dropdown functionality
    const profileButton = header.querySelector('.profile-button');
    const dropdown = header.querySelector('.dropdown');
    
    profileButton?.addEventListener('click', () => {
        const isExpanded = profileButton.getAttribute('aria-expanded') === 'true';
        profileButton.setAttribute('aria-expanded', !isExpanded);
        dropdown.hidden = !isExpanded;
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.user-profile')) {
            dropdown.hidden = true;
            profileButton?.setAttribute('aria-expanded', 'false');
        }
    });

    document.body.prepend(header);
}
