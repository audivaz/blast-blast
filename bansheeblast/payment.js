const cardTypes = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/,
    discover: /^6/
};

function detectCardType(number) {
    for (const [type, regex] of Object.entries(cardTypes)) {
        if (regex.test(number)) {
            return type;
        }
    }
    return 'generic';
}

function formatCardNumber(input) {
    let value = input.value.replace(/\D/g, '');
    let formattedValue = '';
    
    if (value.length > 0) {
        const cardType = detectCardType(value);
        const cardTypeIcon = input.parentElement.querySelector('.card-type-icon');
        if (cardTypeIcon) {
            cardTypeIcon.className = `card-type-icon fab fa-cc-${cardType}`;
        }
        
        // Format based on card type
        if (cardType === 'amex') {
            formattedValue = value.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3');
        } else {
            formattedValue = value.replace(/(\d{4})/g, '$1 ').trim();
        }
    }
    
    input.value = formattedValue;
}

function formatExpiryDate(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
        const month = parseInt(value.substring(0, 2));
        if (month > 12) value = '12' + value.slice(2);
        value = value.replace(/(\d{2})(\d{0,2})/, '$1/$2');
    }
    input.value = value;
}

function validateCVC(input) {
    let value = input.value.replace(/\D/g, '');
    input.value = value.slice(0, 4);
}

// Initialize form validation and formatting
document.addEventListener('DOMContentLoaded', () => {
    const cardNumber = document.getElementById('card-number');
    const expiryDate = document.getElementById('expiry-date');
    const cvc = document.getElementById('cvc');
    
    cardNumber.addEventListener('input', () => formatCardNumber(cardNumber));
    expiryDate.addEventListener('input', () => formatExpiryDate(expiryDate));
    cvc.addEventListener('input', () => validateCVC(cvc));
    
    // Payment method selection
    const paymentMethods = document.querySelectorAll('.payment-method');
    paymentMethods.forEach(method => {
        method.addEventListener('click', () => {
            paymentMethods.forEach(m => m.classList.remove('active'));
            method.classList.add('active');
        });
    });
});

// Save form progress
const saveProgress = debounce(() => {
    const formData = {
        cardName: document.getElementById('card-name').value,
        // Don't save sensitive data
        lastUpdated: new Date().toISOString()
    };
    sessionStorage.setItem('paymentProgress', JSON.stringify(formData));
}, 1000);

// Restore form progress
function restoreProgress() {
    const savedData = sessionStorage.getItem('paymentProgress');
    if (savedData) {
        const formData = JSON.parse(savedData);
        document.getElementById('card-name').value = formData.cardName;
    }
}

// Update HTML to add card type indicator
document.getElementById('card-number').insertAdjacentHTML(
    'afterend',
    '<i class="card-type-icon fab fa-cc-generic"></i>'
);