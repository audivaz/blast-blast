document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    initializeLoader();
});

function initializeEventListeners() {
    const modals = {
        edit: document.getElementById('editPlaylistModal'),
        create: document.getElementById('createPlaylistModal')
    };
    const buttons = {
        editPlaylist: document.getElementById('edit-playlist'),
        deletePlaylist: document.getElementById('delete-playlist'),
        createPlaylist: document.getElementById('create-playlist')
    };
    const dropdown = document.querySelector('.dropdown');
    const userProfile = document.querySelector('.user-profile');

    // Event Listeners for buttons
    buttons.editPlaylist.addEventListener('click', () => openModal(modals.edit));
    buttons.createPlaylist.addEventListener('click', () => openModal(modals.create));
    buttons.deletePlaylist.addEventListener('click', handleDeletePlaylist);

    document.querySelectorAll('.close').forEach(button => {
        button.addEventListener('click', () => closeModal(modals.edit) || closeModal(modals.create));
    });

    userProfile.addEventListener('click', (event) => {
        toggleDropdown(dropdown);
        event.stopPropagation();
    });

    document.addEventListener('click', (event) => {
        if (!userProfile.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.style.display = 'none';
        }
    });

    document.addEventListener('keydown', handleModalKeyboard);

    // Form Event Listeners
    document.getElementById('editPlaylistForm').addEventListener('submit', handleEditPlaylist);
    document.getElementById('createPlaylistForm').addEventListener('submit', handleCreatePlaylist);

    document.querySelectorAll('.remove-song').forEach(button => {
        button.addEventListener('click', handleRemoveSong);
    });

    window.addEventListener('click', (event) => {
        Object.values(modals).forEach(modal => {
            if (event.target === modal) closeModal(modal);
        });
    });
}

function initializeLoader() {
    const loader = document.getElementById('loader');
    window.onload = () => loader.style.display = 'none';
}

// Modal Functions
function openModal(modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    trapFocus(modal);
}

function closeModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    const form = modal.querySelector('form');
    if (form) form.reset();
    document.body.style.overflow = 'auto'
}

function handleModalKeyboard(event) {
    if (event.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(closeModal);
    }
}

// Helper Functions
function handleError(error) {
    console.error('An error occurred:', error);
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = 'An error occurred. Please try again later.';
    document.body.prepend(errorMessage);
    setTimeout(() => errorMessage.remove(), 5000);
}

function handleEditPlaylist(event) {
    event.preventDefault();
    try {
        const playlistName = document.getElementById('editPlaylistName').value;
        document.getElementById('playlist-name').innerText = playlistName;
        closeModal(document.getElementById('editPlaylistModal'));
    } catch (error) {
        handleError(error);
    }
}

function handleCreatePlaylist(event) {
    event.preventDefault();
    try {
        const newPlaylistName = document.getElementById('createPlaylistName').value;
        // Add logic to create new playlist
        closeModal(document.getElementById('createPlaylistModal'));
    } catch (error) {
        handleError(error);
    }
}

function handleDeletePlaylist() {
    if (confirm('Are you sure you want to delete this playlist?')) {
        try {
            // Add logic to delete playlist
        } catch (error) {
            handleError(error);
        }
    }
}

function handleRemoveSong(event) {
    if (confirm('Are you sure you want to remove this song from the playlist?')) {
        try {
            event.target.closest('.song-item').remove();
        } catch (error) {
            handleError(error);
        }
    }
}

function toggleDropdown(dropdown) {
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

function trapFocus(modal) {
    const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey) { // Shift + Tab
                if (document.activeElement === firstFocusable) {
                    lastFocusable.focus();
                    e.preventDefault();
                }
            } else { // Tab
                if (document.activeElement === lastFocusable) {
                    firstFocusable.focus();
                    e.preventDefault();
                }
            }
        }
    });
}
