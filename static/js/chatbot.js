// AgriGuru Chatbot JavaScript
class AgriGuruChatbot {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.languageSelect = document.getElementById('languageSelect');
        this.isLoading = false;
        
        this.initializeEventListeners();
        this.scrollToBottom();
    }
    
    initializeEventListeners() {
        // Send button click
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        
        // Enter key press
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Language change
        this.languageSelect.addEventListener('change', () => {
            this.handleLanguageChange();
        });
    }
    
    async sendMessage(isVoice = false) {
        const message = this.messageInput.value.trim();
        if (!message || this.isLoading) return;
        
        // Add user message to chat
        this.addMessage(message, 'user', isVoice);
        
        // Clear input
        this.messageInput.value = '';
        
        // Show loading state
        this.setLoading(true);
        
        try {
            // Send to backend
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    language: this.languageSelect.value,
                    is_voice: isVoice
                })
            });
            
            const data = await response.json();
            
            // Add bot response
            this.addMessage(data.response, 'bot');
            
            // Speak response if voice is enabled
            if (isVoice && window.speechSynthesis) {
                this.speakText(data.response, data.language);
            }
            
        } catch (error) {
            console.error('Chat error:', error);
            this.addMessage('Sorry, I encountered an error. Please try again.', 'bot');
        } finally {
            this.setLoading(false);
        }
    }
    
    addMessage(content, type, isVoice = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        const currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        if (type === 'user') {
            messageDiv.innerHTML = `
                <div class="d-flex align-items-start justify-content-end">
                    <div class="message-content">
                        <div class="bg-primary text-white rounded-3 p-3 shadow-sm">
                            <p class="mb-0">${content}</p>
                            ${isVoice ? '<small class="opacity-75"><i class="fas fa-microphone me-1"></i>Voice</small>' : ''}
                        </div>
                        <small class="text-muted">${currentTime}</small>
                    </div>
                    <div class="avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center ms-3" style="width: 40px; height: 40px;">
                        <i class="fas fa-user"></i>
                    </div>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="d-flex align-items-start">
                    <div class="avatar bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 40px; height: 40px;">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <div class="bg-white border rounded-3 p-3 shadow-sm">
                            <p class="mb-0">${content}</p>
                        </div>
                        <small class="text-muted">${currentTime}</small>
                    </div>
                </div>
            `;
        }
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    setLoading(loading) {
        this.isLoading = loading;
        this.sendBtn.disabled = loading;
        this.messageInput.disabled = loading;
        
        if (loading) {
            // Add loading message
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'message bot-message loading-message';
            loadingDiv.innerHTML = `
                <div class="d-flex align-items-start">
                    <div class="avatar bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 40px; height: 40px;">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <div class="bg-white border rounded-3 p-3 shadow-sm">
                            <div class="d-flex align-items-center">
                                <div class="spinner me-2"></div>
                                <span>AgriGuru is thinking...</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            this.chatMessages.appendChild(loadingDiv);
            this.scrollToBottom();
        } else {
            // Remove loading message
            const loadingMessage = this.chatMessages.querySelector('.loading-message');
            if (loadingMessage) {
                loadingMessage.remove();
            }
        }
    }
    
    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    handleLanguageChange() {
        const language = this.languageSelect.value;
        const greetings = {
            'en': "Language changed to English. How can I help you today?",
            'hi': "भाषा हिंदी में बदल दी गई है। आज मैं आपकी कैसे सहायता कर सकता हूँ?",
            'te': "భాష తెలుగులోకి మార్చబడింది. ఈరోజు నేను మీకు ఎలా సహాయం చేయగలను?",
            'ta': "மொழி தமிழாக மாற்றப்பட்டது. இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?"
        };
        
        this.addMessage(greetings[language] || greetings['en'], 'bot');
    }
    
    speakText(text, language = 'en') {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = this.getVoiceLanguage(language);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            
            window.speechSynthesis.speak(utterance);
        }
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
    
    // Public method to send voice message
    sendVoiceMessage(text) {
        this.messageInput.value = text;
        this.sendMessage(true);
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.agriGuruChatbot = new AgriGuruChatbot();
});

// Utility functions for external use
function addQuickMessage(message) {
    if (window.agriGuruChatbot) {
        window.agriGuruChatbot.messageInput.value = message;
        window.agriGuruChatbot.sendMessage();
    }
}

function changeLanguage(lang) {
    const select = document.getElementById('languageSelect');
    if (select) {
        select.value = lang;
        select.dispatchEvent(new Event('change'));
    }
}

// Quick action buttons
document.addEventListener('DOMContentLoaded', () => {
    // Add quick action buttons
    const quickActions = [
        { text: "What crops should I grow?", icon: "fas fa-seedling" },
        { text: "Weather forecast for my area", icon: "fas fa-cloud-sun" },
        { text: "Current market prices", icon: "fas fa-chart-line" },
        { text: "Government subsidies available", icon: "fas fa-hand-holding-usd" }
    ];
    
    // Add quick actions below chat input if element exists
    const chatInput = document.querySelector('.chat-input');
    if (chatInput) {
        const quickActionsDiv = document.createElement('div');
        quickActionsDiv.className = 'quick-actions mt-2';
        quickActionsDiv.innerHTML = `
            <small class="text-muted d-block mb-2">Quick actions:</small>
            <div class="d-flex flex-wrap gap-2">
                ${quickActions.map(action => `
                    <button class="btn btn-outline-success btn-sm" onclick="addQuickMessage('${action.text}')">
                        <i class="${action.icon} me-1"></i>${action.text}
                    </button>
                `).join('')}
            </div>
        `;
        chatInput.appendChild(quickActionsDiv);
    }
});
