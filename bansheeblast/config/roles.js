// Role definitions and permissions
const roles = {
    admin: {
        name: 'Admin',
        permissions: [
            'manage_users',
            'manage_content',
            'view_analytics',
            'manage_payments',
            'manage_artists',
            'all_access'
        ]
    },
    artist: {
        name: 'Artist',
        permissions: [
            'upload_music',
            'manage_own_content',
            'view_own_analytics',
            'manage_profile'
        ]
    },
    premium: {
        name: 'Premium User',
        permissions: [
            'stream_music',
            'create_playlists',
            'download_music',
            'ad_free'
        ]
    },
    user: {
        name: 'Regular User',
        permissions: [
            'stream_music',
            'create_playlists'
        ]
    }
};

module.exports = roles;
