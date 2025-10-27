/**
 * Language utility for Krishi Mitra application
 * Handles translation between English, Kannada, and Hindi
 */

const LanguageManager = (function() {
    // Available languages
    const languages = {
        en: { name: 'English', code: 'en' },
        kn: { name: 'ಕನ್ನಡ', code: 'kn' },
        hi: { name: 'हिंदी', code: 'hi' }
    };

    // Default language
    let currentLanguage = localStorage.getItem('krishiMitraLanguage') || 'en';

    // Cache for translated content
    const translationCache = {};

    /**
     * Initialize the language manager
     */
    function init() {
        // Apply saved language preference
        applyLanguage(currentLanguage);
        
        // Add language selector to the page if it doesn't exist
        if (!document.querySelector('.language-selector')) {
            createLanguageSelector();
        }
    }

    /**
     * Create and append language selector to the page
     */
    function createLanguageSelector() {
        const selector = document.createElement('div');
        selector.className = 'language-selector fixed top-4 right-4 z-50';
        
        const dropdown = document.createElement('div');
        dropdown.className = 'relative inline-block text-left';
        
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500';
        button.innerHTML = `<span>${languages[currentLanguage].name}</span>
                           <svg class="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                             <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                           </svg>`;
        
        const dropdownContent = document.createElement('div');
        dropdownContent.className = 'hidden origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none';
        dropdownContent.role = 'menu';
        dropdownContent.ariaOrientation = 'vertical';
        dropdownContent.ariaLabelledby = 'options-menu';
        
        const dropdownList = document.createElement('div');
        dropdownList.className = 'py-1';
        dropdownList.role = 'none';
        
        // Add language options
        Object.keys(languages).forEach(langCode => {
            const option = document.createElement('a');
            option.href = '#';
            option.className = `block px-4 py-2 text-sm ${langCode === currentLanguage ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} hover:bg-gray-100 hover:text-gray-900`;
            option.role = 'menuitem';
            option.textContent = languages[langCode].name;
            option.dataset.lang = langCode;
            
            option.addEventListener('click', function(e) {
                e.preventDefault();
                changeLanguage(langCode);
                dropdownContent.classList.add('hidden');
            });
            
            dropdownList.appendChild(option);
        });
        
        // Toggle dropdown visibility
        button.addEventListener('click', function() {
            dropdownContent.classList.toggle('hidden');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!selector.contains(e.target)) {
                dropdownContent.classList.add('hidden');
            }
        });
        
        dropdownContent.appendChild(dropdownList);
        dropdown.appendChild(button);
        dropdown.appendChild(dropdownContent);
        selector.appendChild(dropdown);
        
        document.body.appendChild(selector);
    }

    /**
     * Change the current language
     * @param {string} langCode - Language code (en, kn, hi)
     */
    function changeLanguage(langCode) {
        if (languages[langCode]) {
            currentLanguage = langCode;
            localStorage.setItem('krishiMitraLanguage', langCode);
            applyLanguage(langCode);
        }
    }

    /**
     * Apply the selected language to the page
     * @param {string} langCode - Language code (en, kn, hi)
     */
    function applyLanguage(langCode) {
        // Update language selector if it exists
        const selector = document.querySelector('.language-selector button span');
        if (selector) {
            selector.textContent = languages[langCode].name;
        }
        
        // Don't translate if English is selected (it's the default)
        if (langCode === 'en') {
            resetToEnglish();
            return;
        }
        
        // Translate all translatable elements
        translatePage(langCode);
    }

    /**
     * Reset page content to English
     */
    function resetToEnglish() {
        const elements = document.querySelectorAll('[data-original-text]');
        elements.forEach(element => {
            if (element.dataset.originalText) {
                element.textContent = element.dataset.originalText;
            }
        });
    }

    /**
     * Translate the entire page to the selected language
     * @param {string} langCode - Language code (en, kn, hi)
     */
    async function translatePage(langCode) {
        // Show loading indicator
        showTranslationLoading();
        
        // First, collect all translatable elements
        const translatableElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, button, label, a, span, option, li, input[type="submit"], input[type="button"], div.card-title, div.card-text, th, td');
        
        // Create a batch translation request for better performance
        const textsToTranslate = [];
        const elementsToUpdate = [];
        
        for (const element of translatableElements) {
            // Skip elements with no-translate class, empty content, or Font Awesome icons
            if (element.classList.contains('no-translate') || 
                !element.textContent.trim() || 
                element.classList.contains('fa') ||
                element.classList.contains('fas') ||
                element.classList.contains('far') ||
                element.classList.contains('fab')) {
                continue;
            }
            
            // Handle placeholder attributes for inputs
            if (element.tagName === 'INPUT' && element.placeholder) {
                if (!element.dataset.originalPlaceholder) {
                    element.dataset.originalPlaceholder = element.placeholder;
                }
                
                textsToTranslate.push(element.dataset.originalPlaceholder);
                elementsToUpdate.push({
                    element: element,
                    type: 'placeholder'
                });
            }
            
            // Handle regular text content
            if (element.textContent.trim()) {
                // Store original text if not already stored
                if (!element.dataset.originalText) {
                    element.dataset.originalText = element.textContent;
                }
                
                const originalText = element.dataset.originalText;
                
                // Skip translation for very short text (likely icons or symbols)
                if (originalText.length <= 1) {
                    continue;
                }
                
                textsToTranslate.push(originalText);
                elementsToUpdate.push({
                    element: element,
                    type: 'text'
                });
            }
            
            // Handle title attributes
            if (element.title) {
                if (!element.dataset.originalTitle) {
                    element.dataset.originalTitle = element.title;
                }
                
                textsToTranslate.push(element.dataset.originalTitle);
                elementsToUpdate.push({
                    element: element,
                    type: 'title'
                });
            }
            
            // Handle value attributes for buttons and inputs
            if ((element.tagName === 'INPUT' || element.tagName === 'BUTTON') && element.value) {
                if (!element.dataset.originalValue) {
                    element.dataset.originalValue = element.value;
                }
                
                textsToTranslate.push(element.dataset.originalValue);
                elementsToUpdate.push({
                    element: element,
                    type: 'value'
                });
            }
        }
        
        // Translate all texts in batch
        try {
            const translatedTexts = await Promise.all(
                textsToTranslate.map(text => translateText(text, langCode))
            );
            
            // Update all elements with translations
            for (let i = 0; i < elementsToUpdate.length; i++) {
                const { element, type } = elementsToUpdate[i];
                const translatedText = translatedTexts[i];
                
                switch (type) {
                    case 'text':
                        element.textContent = translatedText;
                        break;
                    case 'placeholder':
                        element.placeholder = translatedText;
                        break;
                    case 'title':
                        element.title = translatedText;
                        break;
                    case 'value':
                        element.value = translatedText;
                        break;
                }
            }
        } catch (error) {
            console.error('Translation error:', error);
        }
        
        // Hide loading indicator
        hideTranslationLoading();
    }
    
    /**
     * Show translation loading indicator
     */
    function showTranslationLoading() {
        // Create loading indicator if it doesn't exist
        if (!document.getElementById('translation-loading')) {
            const loadingDiv = document.createElement('div');
            loadingDiv.id = 'translation-loading';
            loadingDiv.className = 'fixed top-0 left-0 w-full h-1 bg-green-100 z-50';
            
            const progressBar = document.createElement('div');
            progressBar.className = 'h-full bg-green-500 transition-all duration-300 ease-out';
            progressBar.style.width = '0%';
            
            loadingDiv.appendChild(progressBar);
            document.body.appendChild(loadingDiv);
            
            // Animate progress bar
            setTimeout(() => {
                progressBar.style.width = '70%';
            }, 100);
        } else {
            const progressBar = document.querySelector('#translation-loading div');
            progressBar.style.width = '0%';
            document.getElementById('translation-loading').style.display = 'block';
            setTimeout(() => {
                progressBar.style.width = '70%';
            }, 100);
        }
    }
    
    /**
     * Hide translation loading indicator
     */
    function hideTranslationLoading() {
        const loadingDiv = document.getElementById('translation-loading');
        if (loadingDiv) {
            const progressBar = loadingDiv.querySelector('div');
            progressBar.style.width = '100%';
            
            setTimeout(() => {
                loadingDiv.style.display = 'none';
            }, 500);
        }
    }

    /**
     * Translate text using Google Translate API
     * @param {string} text - Text to translate
     * @param {string} targetLang - Target language code
     * @returns {Promise<string>} - Translated text
     */
    async function translateText(text, targetLang) {
        // Check cache first
        const cacheKey = `${text}_${targetLang}`;
        if (translationCache[cacheKey]) {
            return translationCache[cacheKey];
        }
        
        // For development/demo purposes, we'll use a simple simulation
        // In production, replace this with actual Google Translate API call
        const translated = simulateTranslation(text, targetLang);
        
        // Cache the result
        translationCache[cacheKey] = translated;
        
        return translated;
    }

    /**
     * Simulate translation (for demo purposes)
     * In production, replace with actual Google Translate API
     * @param {string} text - Text to translate
     * @param {string} targetLang - Target language code
     * @returns {string} - Simulated translated text
     */
    function simulateTranslation(text, targetLang) {
        // Common agricultural terms in different languages
        const commonTerms = {
            'kn': {
                'Soil': 'ಮಣ್ಣು',
                'Test': 'ಪರೀಕ್ಷೆ',
                'Farm': 'ಕೃಷಿ',
                'Crop': 'ಬೆಳೆ',
                'Water': 'ನೀರು',
                'Submit': 'ಸಲ್ಲಿಸು',
                'Next': 'ಮುಂದೆ',
                'Back': 'ಹಿಂದೆ',
                'Location': 'ಸ್ಥಳ',
                'Village': 'ಗ್ರಾಮ',
                'Field': 'ಹೊಲ',
                'Size': 'ಗಾತ್ರ',
                'Color': 'ಬಣ್ಣ',
                'Texture': 'ಮೇಲ್ಮೈ',
                'Results': 'ಫಲಿತಾಂಶಗಳು',
                'Login': 'ಲಾಗಿನ್',
                'Register': 'ನೋಂದಣಿ',
                'Home': 'ಮುಖಪುಟ',
                'About': 'ನಮ್ಮ ಬಗ್ಗೆ',
                'Contact': 'ಸಂಪರ್ಕಿಸಿ',
                'Krishi Mitra': 'ಕೃಷಿ ಮಿತ್ರ'
            },
            'hi': {
                'Soil': 'मिट्टी',
                'Test': 'परीक्षण',
                'Farm': 'खेत',
                'Crop': 'फसल',
                'Water': 'पानी',
                'Submit': 'जमा करें',
                'Next': 'अगला',
                'Back': 'पीछे',
                'Location': 'स्थान',
                'Village': 'गांव',
                'Field': 'खेत',
                'Size': 'आकार',
                'Color': 'रंग',
                'Texture': 'बनावट',
                'Results': 'परिणाम',
                'Login': 'लॉगिन',
                'Register': 'पंजीकरण',
                'Home': 'होम',
                'About': 'हमारे बारे में',
                'Contact': 'संपर्क करें',
                'Krishi Mitra': 'कृषि मित्र'
            }
        };
        
        // Simple word replacement for demo
        let translated = text;
        
        if (commonTerms[targetLang]) {
            Object.keys(commonTerms[targetLang]).forEach(term => {
                const regex = new RegExp(`\\b${term}\\b`, 'gi');
                translated = translated.replace(regex, commonTerms[targetLang][term]);
            });
        }
        
        // Add a suffix to indicate translation in demo mode
        if (translated === text) {
            translated = targetLang === 'kn' ? `${text} (ಕನ್ನಡ)` : `${text} (हिंदी)`;
        }
        
        return translated;
    }

    /**
     * Get the current language code
     * @returns {string} - Current language code
     */
    function getCurrentLanguage() {
        return currentLanguage;
    }

    /**
     * Get all available languages
     * @returns {Object} - Available languages
     */
    function getAvailableLanguages() {
        return languages;
    }

    // Public API
    return {
        init,
        changeLanguage,
        getCurrentLanguage,
        getAvailableLanguages,
        translateText
    };
})();

// Initialize language manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    LanguageManager.init();
});