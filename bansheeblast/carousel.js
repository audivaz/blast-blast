document.addEventListener('DOMContentLoaded', () => {
    const carousels = document.querySelectorAll('.carousel-container');
    if (!carousels.length) return;

    carousels.forEach(carousel => {
        const track = carousel.querySelector('.carousel-track');
        const items = Array.from(track.children);
        const prevButton = carousel.querySelector('.carousel-prev');
        const nextButton = carousel.querySelector('.carousel-next');

        let currentIndex = 0;

        function getItemsPerView() {
            const viewportWidth = window.innerWidth;
            if (viewportWidth <= 480) return 1;
            if (viewportWidth <= 768) return 2;
            if (viewportWidth <= 1200) return 3;
            return 4;
        }

        function getItemWidth() {
            const containerWidth = carousel.clientWidth - 80; // Account for padding
            const itemsPerView = getItemsPerView();
            const gap = parseFloat(getComputedStyle(track).gap) || 32; // Default to 2rem if gap not set
            return (containerWidth - (gap * (itemsPerView - 1))) / itemsPerView;
        }

        function updateCarousel() {
            const itemsPerView = getItemsPerView();
            const maxIndex = Math.max(0, items.length - itemsPerView);
            currentIndex = Math.min(currentIndex, maxIndex);

            const itemWidth = getItemWidth();
            const gap = parseFloat(getComputedStyle(track).gap) || 32;
            const offset = currentIndex * (itemWidth + gap);

            // Update transform with smooth transition
            track.style.transform = `translateX(-${offset}px)`;
            
            // Update button states
            prevButton.disabled = currentIndex <= 0;
            nextButton.disabled = currentIndex >= maxIndex;

            // Update ARIA labels
            const totalGroups = Math.ceil(items.length / itemsPerView);
            const currentGroup = Math.floor(currentIndex / itemsPerView) + 1;
            carousel.setAttribute('aria-label', `Album carousel, group ${currentGroup} of ${totalGroups}`);

            // Update tabindex and visibility for items
            items.forEach((item, index) => {
                const isVisible = index >= currentIndex && index < currentIndex + itemsPerView;
                item.setAttribute('tabindex', isVisible ? '0' : '-1');
                item.setAttribute('aria-hidden', !isVisible);
                const playButton = item.querySelector('button');
                if (playButton) {
                    playButton.setAttribute('tabindex', isVisible ? '0' : '-1');
                }

                // Update item width and margin
                item.style.flex = `0 0 ${itemWidth}px`;
                item.style.minWidth = `${itemWidth}px`;
            });
        }

        // Event Listeners
        prevButton.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        });

        nextButton.addEventListener('click', () => {
            const itemsPerView = getItemsPerView();
            const maxIndex = Math.max(0, items.length - itemsPerView);
            if (currentIndex < maxIndex) {
                currentIndex++;
                updateCarousel();
            }
        });

        // Keyboard navigation
        carousel.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                    if (!prevButton.disabled) {
                        prevButton.click();
                        e.preventDefault();
                    }
                    break;
                case 'ArrowRight':
                    if (!nextButton.disabled) {
                        nextButton.click();
                        e.preventDefault();
                    }
                    break;
                case 'Home':
                    if (currentIndex !== 0) {
                        currentIndex = 0;
                        updateCarousel();
                        e.preventDefault();
                    }
                    break;
                case 'End':
                    const lastIndex = Math.max(0, items.length - getItemsPerView());
                    if (currentIndex !== lastIndex) {
                        currentIndex = lastIndex;
                        updateCarousel();
                        e.preventDefault();
                    }
                    break;
            }
        });

        // Handle window resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                updateCarousel();
            }, 250);
        });

        // Initialize carousel
        // Wait for images to load to get correct dimensions
        Promise.all(
            Array.from(carousel.getElementsByTagName('img'))
                .filter(img => !img.complete)
                .map(img => new Promise(resolve => {
                    img.onload = img.onerror = resolve;
                }))
        ).then(() => {
            // Set initial item widths
            const itemWidth = getItemWidth();
            items.forEach(item => {
                item.style.flex = `0 0 ${itemWidth}px`;
                item.style.minWidth = `${itemWidth}px`;
            });
            updateCarousel();
        });

        // Initial update
        updateCarousel();
    });
});
