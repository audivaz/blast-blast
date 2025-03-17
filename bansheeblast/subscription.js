// Import navbar functionality
import { insertNavbar } from './components/Navbar.js';
import { API, utils } from './api.js';

// Save last viewed plan
function saveLastViewedPlan(planId) {
    localStorage.setItem('lastViewedPlan', planId);
}

// Highlight last viewed plan on page load
document.addEventListener('DOMContentLoaded', () => {
    const lastPlan = localStorage.getItem('lastViewedPlan');
    if (lastPlan) {
        const planElement = document.querySelector(`[data-plan="${lastPlan}"]`);
        if (planElement) {
            planElement.closest('.plan').classList.add('last-viewed');
        }
    }
});

// Consolidated event listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // Insert navbar
    insertNavbar();

    const subscribeBtns = document.querySelectorAll('.subscribe-btn');
    subscribeBtns.forEach(btn => btn.addEventListener('click', handleSubscribe));
});

const analytics = {
    trackEvent(category, action, label) {
        // Integration with your analytics platform
        console.log(`Analytics: ${category} - ${action} - ${label}`);
    }
};

const enhancedAnalytics = {
    trackPlanView(planType) {
        analytics.trackEvent('Subscription_View', planType, {
            timestamp: new Date().toISOString(),
            viewDuration: 0,
            startTime: Date.now()
        });
    },
    
    trackFeatureInterest(feature, planType) {
        analytics.trackEvent('Feature_Interest', feature, {
            plan: planType,
            timestamp: new Date().toISOString()
        });
    }
};

async function handleSubscribe(event) {
    const plan = event.target.dataset.plan;
    analytics.trackEvent('Subscription', 'Click', plan);
    
    const button = event.target;
    button.classList.add('loading');
    
    try {
        const response = await API.subscribeToPlan(plan);
        showToast(`Successfully subscribed to ${plan} plan!`);
        // Redirect to appropriate page or update UI
    } catch (error) {
        console.error('Subscription error:', error);
        showToast('An error occurred during subscription. Please try again.', 'error');
    } finally {
        button.classList.remove('loading');
    }
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function formatPrice(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

// Usage in HTML
document.querySelectorAll('.price').forEach(price => {
    const amount = parseFloat(price.dataset.amount);
    price.textContent = formatPrice(amount) + '/month';
});

// Feature highlight animation
function highlightFeatures() {
    const features = document.querySelectorAll('.plan ul li');
    features.forEach((feature, index) => {
        setTimeout(() => {
            feature.classList.add('highlight');
        }, index * 100);
    });
}

// Plan comparison tooltip
function initializePlanComparison() {
    const plans = document.querySelectorAll('.plan');
    plans.forEach(plan => {
        plan.addEventListener('mouseover', () => {
            const features = plan.querySelectorAll('ul li');
            features.forEach(feature => {
                feature.setAttribute('data-tooltip', 'Click to compare');
            });
        });
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    highlightFeatures();
    initializePlanComparison();
    
    // Track plan views
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const plan = entry.target.querySelector('h2').textContent;
                enhancedAnalytics.trackPlanView(plan);
            }
        });
    });

    document.querySelectorAll('.plan').forEach(plan => {
        observer.observe(plan);
    });
});
