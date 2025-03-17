import { API, utils } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', handleLogin);
});

async function handleLogin(event) {
    event.preventDefault();
    
    const username = event.target.username.value;
    const password = event.target.password.value;
    const rememberMe = event.target.remember.checked;

    utils.showLoader();

    try {
        const response = await API.login(username, password);
        if (response.success) {
            if (rememberMe) {
                localStorage.setItem('token', response.token);
            } else {
                sessionStorage.setItem('token', response.token);
            }
            showMessage('Login successful!', false);
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showMessage('Invalid username or password. Please try again.', true);
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('An error occurred. Please try again later.', true);
    } finally {
        utils.hideLoader();
    }
}

function showMessage(message, isError = false) {
    const messageElement = document.getElementById('message');
    messageElement.textContent = message;
    messageElement.className = `message ${isError ? 'error' : 'success'}`;
    messageElement.style.display = 'block';
    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 3000);
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
