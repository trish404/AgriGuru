// AgriGuru Voice Recognition JavaScript
class VoiceRecognition {
    constructor() {
        this.recognition = null;
        this.isRecording = false;
        this.voiceBtn = document.getElementById('voiceBtn');
        this.languageSelect = document.getElementById('languageSelect');
        
        this.initializeVoiceRecognition();
        this.initializeEventListeners();
    }
    
    initializeVoiceRecognition() {
        // Check for browser support
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
        } else if ('SpeechRecognition' in window) {
            this.recognition = new SpeechRecognition();
        } else {
            console.warn('Speech recognition not supported');
            this.disableVoiceButton();
            return;
        }
        
        // Configure recognition
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;
        
        // Set initial language
        this.updateLanguage();
        
        // Event listeners
        this.recognition.onstart = () => this.onRecognitionStart();
        this.recognition.onresult = (event) => this.onRecognitionResult(event);
        this.recognition.onerror = (event) => this.onRecognitionError(event);
        this.recognition.onend = () => this.onRecognitionEnd();
    }
    
    initializeEventListeners() {
        if (this.voiceBtn) {
            this.voiceBtn.addEventListener('click', () => this.toggleRecording());
        }
        
        if (this.languageSelect) {
            this.languageSelect.addEventListener('change', () => this.updateLanguage());
        }
    }
    
    toggleRecording() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }
    
    startRecording() {
        if (!this.recognition) {
            this.showError('Voice recognition not supported in your browser');
            return;
        }
        
        try {
            this.recognition.start();
        } catch (error) {
            console.error('Error starting recognition:', error);
            this.showError('Error starting voice recognition');
        }
    }
    
    stopRecording() {
        if (this.recognition) {
            this.recognition.stop();
        }
    }
    
    onRecognitionStart() {
        this.isRecording = true;
        this.updateVoiceButton();
        this.showStatus('Listening... Speak now!', 'info');
    }
    
    onRecognitionResult(event) {
        const result = event.results[0];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;
        
        console.log('Voice recognition result:', transcript, 'Confidence:', confidence);
        
        if (confidence > 0.5) {
            // Send voice message through chatbot
            if (window.agriGuruChatbot) {
                window.agriGuruChatbot.sendVoiceMessage(transcript);
            } else {
                // Fallback: put text in input field
                const messageInput = document.getElementById('messageInput');
                if (messageInput) {
                    messageInput.value = transcript;
                }
            }
            this.showStatus(`Voice recognized: "${transcript}"`, 'success');
        } else {
            this.showStatus('Could not understand clearly. Please try again.', 'warning');
        }
    }
    
    onRecognitionError(event) {
        console.error('Speech recognition error:', event.error);
        
        let errorMessage = 'Voice recognition error';
        switch (event.error) {
            case 'no-speech':
                errorMessage = 'No speech detected. Please try again.';
                break;
            case 'audio-capture':
                errorMessage = 'Microphone not accessible. Please check permissions.';
                break;
            case 'not-allowed':
                errorMessage = 'Microphone permission denied. Please allow microphone access.';
                break;
            case 'network':
                errorMessage = 'Network error. Please check your connection.';
                break;
            default:
                errorMessage = `Recognition error: ${event.error}`;
        }
        
        this.showError(errorMessage);
    }
    
    onRecognitionEnd() {
        this.isRecording = false;
        this.updateVoiceButton();
    }
    
    updateVoiceButton() {
        if (!this.voiceBtn) return;
        
        if (this.isRecording) {
            this.voiceBtn.classList.add('recording');
            this.voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
            this.voiceBtn.title = 'Stop Recording';
        } else {
            this.voiceBtn.classList.remove('recording');
            this.voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            this.voiceBtn.title = 'Voice Input';
        }
    }
    
    updateLanguage() {
        if (!this.recognition || !this.languageSelect) return;
        
        const language = this.languageSelect.value;
        const langMap = {
            'en': 'en-US',
            'hi': 'hi-IN',
            'te': 'te-IN',
            'ta': 'ta-IN'
        };
        
        this.recognition.lang = langMap[language] || 'en-US';
    }
    
    showStatus(message, type = 'info') {
        this.showNotification(message, type, 3000);
    }
    
    showError(message) {
        this.showNotification(message, 'error', 5000);
    }
    
    showNotification(message, type, duration) {
        // Create or get notification container
        let notificationContainer = document.getElementById('voiceNotifications');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'voiceNotifications';
            notificationContainer.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                z-index: 9999;
                max-width: 300px;
            `;
            document.body.appendChild(notificationContainer);
        }
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} alert-dismissible fade show`;
        notification.innerHTML = `
            <i class="fas fa-microphone me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        notificationContainer.appendChild(notification);
        
        // Auto remove after duration
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, duration);
    }
    
    disableVoiceButton() {
        if (this.voiceBtn) {
            this.voiceBtn.disabled = true;
            this.voiceBtn.title = 'Voice recognition not supported';
            this.voiceBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
        }
    }
    
    // Public methods
    isSupported() {
        return this.recognition !== null;
    }
    
    getCurrentLanguage() {
        return this.languageSelect ? this.languageSelect.value : 'en';
    }
}

// Text-to-Speech functionality
class TextToSpeech {
    constructor() {
        this.synthesis = window.speechSynthesis;
        this.voices = [];
        this.loadVoices();
    }
    
    loadVoices() {
        if (this.synthesis) {
            this.voices = this.synthesis.getVoices();
            
            // Load voices when they become available
            if (this.voices.length === 0) {
                this.synthesis.onvoiceschanged = () => {
                    this.voices = this.synthesis.getVoices();
                };
            }
        }
    }
    
    speak(text, language = 'en', rate = 0.9, pitch = 1) {
        if (!this.synthesis) {
            console.warn('Text-to-speech not supported');
            return;
        }
        
        // Cancel any ongoing speech
        this.synthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.lang = this.getVoiceLanguage(language);
        
        // Try to find a suitable voice
        const voice = this.findBestVoice(language);
        if (voice) {
            utterance.voice = voice;
        }
        
        // Event listeners
        utterance.onstart = () => console.log('Speech started');
        utterance.onend = () => console.log('Speech ended');
        utterance.onerror = (event) => console.error('Speech error:', event.error);
        
        this.synthesis.speak(utterance);
    }
    
    findBestVoice(language) {
        const langCode = this.getVoiceLanguage(language);
        return this.voices.find(voice => voice.lang === langCode) || 
               this.voices.find(voice => voice.lang.startsWith(langCode.split('-')[0]));
    }
    
    getVoiceLanguage(lang) {
        const langMap = {
            'en': 'en-US',
            'hi': 'hi-IN',
            'te': 'te-IN',
            'ta': 'ta-IN'
        };
        return langMap[lang] || 'en-US';
    }
    
    stop() {
        if (this.synthesis) {
            this.synthesis.cancel();
        }
    }
    
    isSupported() {
        return 'speechSynthesis' in window;
    }
}

// Initialize voice features when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize voice recognition
    window.voiceRecognition = new VoiceRecognition();
    
    // Initialize text-to-speech
    window.textToSpeech = new TextToSpeech();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (event) => {
        // Ctrl/Cmd + Shift + V for voice input
        if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'V') {
            event.preventDefault();
            if (window.voiceRecognition && window.voiceRecognition.isSupported()) {
                window.voiceRecognition.toggleRecording();
            }
        }
    });
    
    // Show voice shortcuts help
    const helpText = document.createElement('div');
    helpText.className = 'text-muted small mt-1';
    helpText.innerHTML = '<i class="fas fa-keyboard me-1"></i>Tip: Press Ctrl+Shift+V for voice input';
    
    const chatInput = document.querySelector('.chat-input');
    if (chatInput && window.voiceRecognition && window.voiceRecognition.isSupported()) {
        chatInput.appendChild(helpText);
    }
});

// Export for external use
window.AgriGuruVoice = {
    startRecording: () => window.voiceRecognition && window.voiceRecognition.startRecording(),
    stopRecording: () => window.voiceRecognition && window.voiceRecognition.stopRecording(),
    speak: (text, language) => window.textToSpeech && window.textToSpeech.speak(text, language),
    stopSpeech: () => window.textToSpeech && window.textToSpeech.stop(),
    isVoiceSupported: () => window.voiceRecognition && window.voiceRecognition.isSupported(),
    isSpeechSupported: () => window.textToSpeech && window.textToSpeech.isSupported()
};
