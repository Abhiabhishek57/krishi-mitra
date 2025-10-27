// KRISHI-MITRA - Authentication Module

// Initialize Firebase
const app = firebase.initializeApp(CONFIG.FIREBASE_CONFIG);
const auth = firebase.auth();

// Translations object
const translations = {
    en: {
        subtitle: "Your Agricultural Advisory Companion",
        google_login: "Continue with Google",
        phone_login: "Login with Phone OTP",
        guest_login: "Continue as Guest",
        phone_number: "Phone Number",
        send_otp: "Send OTP",
        enter_otp: "Enter OTP",
        verify: "Verify & Login",
        login_success: "Successfully logged in!",
        otp_sent: "OTP sent successfully!",
        login_error: "Login failed. Please try again.",
        welcome_back: "Welcome back",
        guest_mode: "You're in guest mode"
    },
    ka: {
        subtitle: "ನಿಮ್ಮ ಕೃಷಿ ಸಲಹಾ ಸಹಾಯಕ",
        google_login: "Google ನೊಂದಿಗೆ ಮುಂದುವರಿಸಿ",
        phone_login: "ಫೋನ್ OTP ಮೂಲಕ ಲಾಗಿನ್ ಮಾಡಿ",
        guest_login: "ಅತಿಥಿಯಾಗಿ ಮುಂದುವರಿಸಿ",
        phone_number: "ಫೋನ್ ಸಂಖ್ಯೆ",
        send_otp: "OTP ಕಳುಹಿಸಿ",
        enter_otp: "OTP ನಮೂದಿಸಿ",
        verify: "ಪರಿಶೀಲಿಸಿ & ಲಾಗಿನ್ ಮಾಡಿ",
        login_success: "ಯಶಸ್ವಿಯಾಗಿ ಲಾಗಿನ್ ಆಗಿದೆ!",
        otp_sent: "OTP ಯಶಸ್ವಿಯಾಗಿ ಕಳುಹಿಸಲಾಗಿದೆ!",
        login_error: "ಲಾಗಿನ್ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
        welcome_back: "ಮತ್ತೆ ಸ್ವಾಗತ",
        guest_mode: "ನೀವು ಅತಿಥಿ ಮೋಡ್‌ನಲ್ಲಿದ್ದೀರಿ"
    },
    hi: {
        subtitle: "आपका कृषि सलाहकार साथी",
        google_login: "Google के साथ जारी रखें",
        phone_login: "फोन OTP से लॉगिन करें",
        guest_login: "अतिथि के रूप में जारी रखें",
        phone_number: "फोन नंबर",
        send_otp: "OTP भेजें",
        enter_otp: "OTP दर्ज करें",
        verify: "सत्यापित करें और लॉगिन करें",
        login_success: "सफलतापूर्वक लॉगिन किया गया!",
        otp_sent: "OTP सफलतापूर्वक भेजा गया!",
        login_error: "लॉगिन विफल। कृपया पुनः प्रयास करें।",
        welcome_back: "वापसी पर स्वागत है",
        guest_mode: "आप अतिथि मोड में हैं"
    }
};

// Authentication class
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.language = localStorage.getItem('language') || 'en';
        this.recaptchaVerifier = null;
        this.confirmationResult = null;
    }
    
    // Check if user is logged in
    isAuthenticated() {
        return !!auth.currentUser || localStorage.getItem('guestMode') === 'true';
    }
    
    // Get current user
    getCurrentUser() {
        if (auth.currentUser) {
            return {
                uid: auth.currentUser.uid,
                email: auth.currentUser.email,
                phone: auth.currentUser.phoneNumber,
                name: auth.currentUser.displayName || 'User',
                photoURL: auth.currentUser.photoURL,
                isGuest: false
            };
        } else if (localStorage.getItem('guestMode') === 'true') {
            return {
                name: 'Guest User',
                isGuest: true
            };
        }
        return null;
    }
    
    // Google Sign-In handler
    async signInWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await auth.signInWithPopup(provider);
            
            // Save user data
            const user = result.user;
            localStorage.setItem('userName', user.displayName);
            
            return { 
                success: true, 
                user: {
                    uid: user.uid,
                    name: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL
                }
            };
        } catch (error) {
            console.error("Google sign-in error:", error);
            return { success: false, error: error.message };
        }
    }
    
    // Phone authentication setup
    setupPhoneAuth() {
        // Create reCAPTCHA verifier
        this.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('sendOtp', {
            'size': 'invisible',
            'callback': (response) => {
                // reCAPTCHA solved, allow signInWithPhoneNumber.
            }
        });
    }
    
    // Send OTP to phone
    async sendPhoneOTP(phoneNumber) {
        try {
            if (!this.recaptchaVerifier) {
                this.setupPhoneAuth();
            }
            
            this.confirmationResult = await auth.signInWithPhoneNumber(phoneNumber, this.recaptchaVerifier);
            return { success: true };
        } catch (error) {
            console.error("Phone OTP error:", error);
            return { success: false, error: error.message };
        }
    }
    
    // Verify OTP code
    async verifyOTP(code) {
        try {
            if (!this.confirmationResult) {
                return { success: false, error: "No OTP was sent. Please request OTP first." };
            }
            
            const result = await this.confirmationResult.confirm(code);
            const user = result.user;
            
            return { 
                success: true, 
                user: {
                    uid: user.uid,
                    phone: user.phoneNumber
                }
            };
        } catch (error) {
            console.error("OTP verification error:", error);
            return { success: false, error: error.message };
        }
    }
    
    // Guest login
    loginAsGuest() {
        localStorage.setItem('guestMode', 'true');
        return { success: true };
    }
    
    // Logout
    logout() {
        return auth.signOut()
            .then(() => {
                localStorage.removeItem('guestMode');
                return { success: true };
            })
            .catch(error => {
                console.error("Logout error:", error);
                return { success: false, error: error.message };
            });
    }
}

// Language update function
function updateLanguage(lang) {
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
}

// Initialize auth manager
const authManager = new AuthManager();

// Add event listeners when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Google login
    const googleLoginBtn = document.getElementById('googleLogin');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', async () => {
            googleLoginBtn.innerHTML = '<span class="loading"></span>';
            const result = await authManager.signInWithGoogle();
            if (result.success) {
                showToast(translations[authManager.language].login_success, 'success');
                setTimeout(() => {
                    window.location.href = '/home.html';
                }, 1500);
            } else {
                showToast(translations[authManager.language].login_error, 'error');
                googleLoginBtn.innerHTML = `<img src="assets/images/google-icon.svg" alt="Google"> <span data-i18n="google_login">${translations[authManager.language].google_login}</span>`;
            }
        });
    }
    
    // Phone login
    const phoneLoginBtn = document.getElementById('phoneLogin');
    const sendOtpBtn = document.getElementById('sendOtp');
    const verifyOtpBtn = document.getElementById('verifyOtp');
    
    if (phoneLoginBtn) {
        phoneLoginBtn.addEventListener('click', () => {
            document.getElementById('phoneForm').style.display = 'block';
            document.querySelector('.auth-options').style.display = 'none';
        });
    }
    
    if (sendOtpBtn) {
        sendOtpBtn.addEventListener('click', async () => {
            const phoneNumber = document.getElementById('phone').value;
            if (!phoneNumber) {
                showToast('Please enter a valid phone number', 'error');
                return;
            }
            
            sendOtpBtn.innerHTML = '<span class="loading"></span>';
            const result = await authManager.sendPhoneOTP(phoneNumber);
            
            if (result.success) {
                document.getElementById('otpSection').style.display = 'block';
                showToast(translations[authManager.language].otp_sent, 'success');
            } else {
                showToast(result.error, 'error');
            }
            
            sendOtpBtn.innerHTML = `<span data-i18n="send_otp">${translations[authManager.language].send_otp}</span>`;
        });
    }
    
    if (verifyOtpBtn) {
        verifyOtpBtn.addEventListener('click', async () => {
            const otp = document.getElementById('otp').value;
            if (!otp) {
                showToast('Please enter the OTP', 'error');
                return;
            }
            
            verifyOtpBtn.innerHTML = '<span class="loading"></span>';
            const result = await authManager.verifyOTP(otp);
            
            if (result.success) {
                showToast(translations[authManager.language].login_success, 'success');
                setTimeout(() => {
                    window.location.href = 'pages/home.html';
                }, 1500);
            } else {
                showToast(result.error, 'error');
                verifyOtpBtn.innerHTML = `<span data-i18n="verify">${translations[authManager.language].verify}</span>`;
            }
        });
    }
    
    // Guest login
    const guestLoginBtn = document.getElementById('guestLogin');
    if (guestLoginBtn) {
        guestLoginBtn.addEventListener('click', () => {
            guestLoginBtn.innerHTML = '<span class="loading"></span>';
            const result = authManager.loginAsGuest();
            if (result.success) {
                showToast(translations[authManager.language].guest_mode, 'success');
                setTimeout(() => {
                    window.location.href = 'pages/home.html';
                }, 1500);
            }
        });
    }
    
    // Language selector
    const langButtons = document.querySelectorAll('.lang-btn');
    if (langButtons.length > 0) {
        langButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.getAttribute('data-lang');
                localStorage.setItem('language', lang);
                authManager.language = lang;
                updateLanguage(lang);
                
                // Update active state
                document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
        
        // Set active language on load
        const currentLang = localStorage.getItem('language') || 'en';
        document.querySelector(`.lang-btn[data-lang="${currentLang}"]`).classList.add('active');
        updateLanguage(currentLang);
    }
    
    // Check if user is already logged in
    if (authManager.isAuthenticated()) {
        window.location.href = 'pages/home.html';
    }
});

// Toast notification function
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}
    
// End of auth.js
