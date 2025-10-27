// Firebase config: use your actual credentials
const firebaseConfig = {
    AIzaSyCrdpbwrRfIUCYhDcniTCloTJSPGv35OaE
    // your API keys…
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    'size': 'invisible',
    'callback': function(response) {
        // reCAPTCHA solved
    }
});

function sendOtp() {
    const phoneNumber = "+91" + document.getElementById('phoneNumber').value;
    const appVerifier = window.recaptchaVerifier;
    auth.signInWithPhoneNumber(phoneNumber, appVerifier)
        .then(confirmationResult => {
            window.confirmationResult = confirmationResult;
            showToast('OTP sent to your phone', 'info');
        })
        .catch(error => {
            showToast('Error sending OTP: ' + error.message, 'error');
        });
}

function verifyOtp() {
    const code = document.getElementById('otpCode').value;
    window.confirmationResult.confirm(code)
        .then(result => {
            const user = result.user;
            showToast('Login successful!', 'success');
            // Redirect to dashboard or save user info
        })
        .catch(error => {
            showToast('Incorrect OTP: ' + error.message, 'error');
        });
}

