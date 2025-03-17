document.addEventListener('DOMContentLoaded', () => {
    // Get subscription details from URL parameters or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const plan = urlParams.get('plan') || localStorage.getItem('selectedPlan') || 'Premium';
    
    // Calculate next billing date
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    
    // Update DOM with subscription details
    document.getElementById('planName').textContent = plan;
    document.getElementById('nextBilling').textContent = nextBillingDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Get user email from localStorage or session
    const userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
    if (userEmail) {
        document.getElementById('userEmail').textContent = userEmail;
    }
    
    // Handle receipt download
    document.querySelector('.download-receipt').addEventListener('click', generateReceipt);
});

function generateReceipt() {
    // Implement receipt generation logic here
    // Could use PDF.js or similar library to generate a PDF receipt
    console.log('Generating receipt...');
    // For now, just show a toast message
    showToast('Receipt downloaded successfully!');
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}