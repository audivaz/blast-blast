export const API = {
    getTrendingMusic: async () => {
        // Simulate API call
        return [
            { title: 'Album 1', image: 'imgs/album-01.png' },
            { title: 'Album 2', image: 'imgs/album-02.png' }
        ];
    },
    getFeaturedArtists: async () => {
        // Simulate API call
        return [
            { name: 'Artist 1', image: 'imgs/album-03.png' },
            { name: 'Artist 2', image: 'imgs/album-04.png' }
        ];
    },
    getNewReleases: async () => {
        // Simulate API call
        return [
            { title: 'Album 3', image: 'imgs/album-05.png' },
            { title: 'Album 4', image: 'imgs/album-02.png' }
        ];
    }
};
