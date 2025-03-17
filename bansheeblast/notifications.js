// Simulated notifications data
let notifications = [
    {
        id: 1,
        icon: 'imgs/album-01.png',
        title: 'New Release',
        message: 'Your favorite artist just released a new album!',
        time: '2 hours ago',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
        id: 2,
        icon: 'imgs/profile-icon-B.png',
        title: 'Friend Activity',
        message: 'John Doe started following your playlist.',
        time: '1 day ago',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    {
        id: 3,
        icon: 'imgs/album-02.png',
        title: 'Playlist Update',
        message: 'Your "Summer Hits" playlist has been updated with new tracks.',
        time: '3 days ago',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
];

function createNotificationElement(notification) {
    const notificationElement = document.createElement('div');
    notificationElement.classList.add('notification');
    notificationElement.dataset.notificationId = notification.id;
    if (notification.read) {
        notificationElement.classList.add('read');
    }
    
    // Add staggered animation delay based on index
    notificationElement.style.animationDelay = `${notification.id * 0.1}s`;
    
    notificationElement.innerHTML = `
        <img src="${notification.icon}" alt="" class="notification-icon">
        <div class="notification-content">
            <div class="notification-title">${notification.title}</div>
            <div class="notification-message">${notification.message}</div>
            <div class="notification-time">${notification.time}</div>
        </div>
        <div class="notification-actions">
            <button onclick="markAsRead(${notification.id})" ${notification.read ? 'disabled' : ''} 
                    class="mark-read-btn">Mark as Read</button>
            <button onclick="deleteNotification(${notification.id})" 
                    class="delete-btn">Delete</button>
        </div>
    `;
    return notificationElement;
}

function loadNotifications() {
    const container = document.querySelector('.notifications-container');
    
    // Show loading state
    container.innerHTML = '<div class="loading-spinner">Loading notifications...</div>';
    
    // Simulate API delay (remove this when implementing backend)
    setTimeout(() => {
        container.innerHTML = ''; // Clear loading state
        
        if (notifications.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <img src="imgs/empty-notifications.png" alt="" loading="lazy">
                    <h3>No notifications yet</h3>
                    <p>When you receive notifications, they will appear here</p>
                </div>
            `;
            return;
        }
        
        sortNotifications();
        notifications.forEach(notification => {
            const notificationElement = createNotificationElement(notification);
            container.appendChild(notificationElement);
        });
    }, 500);
}

function sortNotifications() {
    notifications.sort((a, b) => b.timestamp - a.timestamp);
}

function markAsRead(id) {
    const notification = notifications.find(n => n.id === id);
    if (notification) {
        notification.read = true;
        const element = document.querySelector(`[data-notification-id="${id}"]`);
        if (element) {
            element.classList.add('read');
            element.querySelector('.notification-actions button:first-child').disabled = true;
        }
    }
}

function markAllAsRead() {
    notifications.forEach(notification => {
        markAsRead(notification.id);
    });
    loadNotifications();
}

function deleteNotification(id) {
    const element = document.querySelector(`[data-notification-id="${id}"]`);
    if (element) {
        element.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            notifications = notifications.filter(notification => notification.id !== id);
            loadNotifications();
        }, 300);
    }
}

function clearAllNotifications() {
    notifications = [];
    loadNotifications();
}

function handleError(error) {
    console.error('An error occurred:', error);
    // Display error message to user
    const errorMessage = document.createElement('div');
    errorMessage.textContent = 'An error occurred. Please try again later.';
    errorMessage.className = 'error-message';
    document.body.prepend(errorMessage);
    setTimeout(() => errorMessage.remove(), 5000);
}

document.addEventListener('DOMContentLoaded', () => {
    loadNotifications();
    document.getElementById('clearAllBtn').addEventListener('click', clearAllNotifications);
    document.getElementById('markAllReadBtn').addEventListener('click', markAllAsRead);
});
