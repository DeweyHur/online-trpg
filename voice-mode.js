// Simple Voice Mode System for TRPG Chat
// Minimal toggle button that reads the latest chat message

class VoiceMode {
    constructor() {
        this.isEnabled = false; // Disabled by default
        this.isSpeaking = false;
        this.selectedVoice = null;
        this.availableVoices = [];
        this.languageVoices = [];

        this.init();
    }

    init() {
        // Wait for voices to load
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = () => {
                this.loadVoices();
            };
        }

        this.loadVoices();
        this.createSimpleToggle();
        this.hookIntoDisplayMessage();
    }

    loadVoices() {
        const voices = speechSynthesis.getVoices();
        console.log('Available voices:', voices.length);

        // Store all available voices for random selection
        this.availableVoices = voices;

        // Get current language
        const currentLang = window.languageManager?.currentLanguage || 'en';
        console.log('Current language setting:', currentLang);

        // Filter voices based on current language
        this.languageVoices = voices.filter(voice => {
            const voiceLang = voice.lang.split('-')[0]; // Get base language code
            return voiceLang === currentLang;
        });

        // Fallback to English if no voices for current language
        if (this.languageVoices.length === 0) {
            console.log('No voices for current language, falling back to English');
            this.languageVoices = voices.filter(voice =>
                voice.lang.startsWith('en') ||
                voice.name.toLowerCase().includes('english') ||
                voice.name.toLowerCase().includes('us english') ||
                voice.name.toLowerCase().includes('uk english')
            );
        }

        console.log('Language voices available:', this.languageVoices.length);
        this.languageVoices.forEach((voice, index) => {
            console.log(`Language Voice ${index}: ${voice.name} (${voice.lang})`);
        });

        console.log('Voices loaded, will pick randomly when enabled');
    }

    createSimpleToggle() {
        // Remove existing toggle if any
        this.removeToggle();

        // Create simple toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'voice-toggle';
        toggleBtn.className = 'bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded transition duration-300 ml-2';
        toggleBtn.innerHTML = '🔇';
        toggleBtn.title = window.languageManager?.getText('enableVoice') || 'Enable Voice';

        // Find the member toggle and insert voice toggle next to it
        const memberToggle = document.getElementById('toggle-members-btn');
        if (memberToggle) {
            memberToggle.parentNode.insertBefore(toggleBtn, memberToggle.nextSibling);
        } else {
            // Fallback: add to the top of the page
            document.body.insertBefore(toggleBtn, document.body.firstChild);
        }

        toggleBtn.addEventListener('click', () => {
            this.isEnabled = !this.isEnabled;
            console.log('Voice mode toggled:', this.isEnabled);

            if (this.isEnabled) {
                // Pick a random voice for current language when enabling
                if (this.languageVoices && this.languageVoices.length > 0) {
                    const randomIndex = Math.floor(Math.random() * this.languageVoices.length);
                    this.selectedVoice = this.languageVoices[randomIndex];
                    console.log('Randomly selected language voice:', this.selectedVoice.name);
                } else if (this.availableVoices && this.availableVoices.length > 0) {
                    // Fallback to any voice if no language-specific voices
                    const randomIndex = Math.floor(Math.random() * this.availableVoices.length);
                    this.selectedVoice = this.availableVoices[randomIndex];
                    console.log('Randomly selected voice (fallback):', this.selectedVoice.name);
                }

                toggleBtn.className = 'bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-2 py-1 rounded transition duration-300 ml-2';
                toggleBtn.innerHTML = '🔊';
                toggleBtn.title = window.languageManager?.getText('disableVoice') || 'Disable Voice';

                // Test speech to confirm it's working
                setTimeout(() => {
                    this.speakText('Voice mode enabled');
                }, 100);

            } else {
                toggleBtn.className = 'bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded transition duration-300 ml-2';
                toggleBtn.innerHTML = '🔇';
                toggleBtn.title = window.languageManager?.getText('enableVoice') || 'Enable Voice';
                this.stopSpeaking();
            }
        });
    }

    speakText(text) {
        if (!this.isEnabled || !('speechSynthesis' in window)) {
            return;
        }

        console.log('Attempting to speak:', text.substring(0, 50) + '...');
        const cleanText = this.cleanTextForSpeech(text);
        if (!cleanText.trim()) {
            return;
        }

        try {
            if (!('speechSynthesis' in window)) {
                console.error('❌ Speech synthesis not supported in this browser');
                return;
            }

            const voices = speechSynthesis.getVoices();
            console.log('Available voices count:', voices.length);

            if (voices.length === 0) {
                console.error('No voices available!');
                return;
            }

            // Create utterance
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            // Use selected voice if available, otherwise use first available
            if (this.selectedVoice) {
                utterance.voice = this.selectedVoice;
                console.log('Using selected voice:', this.selectedVoice.name);
            } else {
                utterance.voice = voices[0];
                console.log('Using fallback voice:', voices[0].name);
            }

            // Set up event handlers
            utterance.onstart = () => {
                console.log('✅ Speech started successfully');
                this.isSpeaking = true;
            };

            utterance.onend = () => {
                console.log('✅ Speech ended successfully');
                this.isSpeaking = false;
            };

            utterance.onerror = (event) => {
                console.error('❌ Speech error:', event);
                this.isSpeaking = false;
            };

            // Speak the text
            console.log('🎤 Calling speechSynthesis.speak for automatic speech...');
            try {
                speechSynthesis.speak(utterance);
                console.log('✅ Automatic speech speak() called successfully');
            } catch (error) {
                console.error('❌ Error calling speak() for automatic speech:', error);
            }

        } catch (error) {
            console.error('Error in speakText:', error);
        }
    }

    cleanTextForSpeech(text) {
        // Remove markdown formatting
        return text
            .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
            .replace(/\*(.*?)\*/g, '$1') // Italic
            .replace(/`(.*?)`/g, '$1') // Code
            .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
            .replace(/^#+\s+/gm, '') // Headers
            .replace(/\n+/g, ' ') // Multiple newlines to space
            .replace(/\s+/g, ' ') // Multiple spaces to single space
            .trim();
    }

    stopSpeaking() {
        try {
            if (speechSynthesis.speaking) {
                console.log('Stopping speech synthesis');
                speechSynthesis.cancel();
                setTimeout(() => {
                    this.isSpeaking = false;
                    console.log('Speech stopped');
                }, 100);
            } else {
                this.isSpeaking = false;
                console.log('No speech was playing');
            }
        } catch (error) {
            console.error('Error stopping speech:', error);
            this.isSpeaking = false;
        }
    }

    // Hook into the existing displayMessage function
    hookIntoDisplayMessage() {
        const originalDisplayMessage = window.displayMessage;

        window.displayMessage = function (messageData) {
            // Call original function
            originalDisplayMessage(messageData);

            // Speak the message if voice mode is enabled
            if (window.voiceMode && window.voiceMode.isEnabled) {
                console.log('Voice mode enabled, speaking message');
                window.voiceMode.speakText(messageData.text);
            }
        };
    }

    removeToggle() {
        const existingToggle = document.getElementById('voice-toggle');
        if (existingToggle) {
            existingToggle.remove();
        }
    }
}

// Initialize voice mode when the page loads
if (typeof window !== 'undefined') {
    window.VoiceMode = VoiceMode;

    // Initialize after DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('Initializing voice mode...');
            window.voiceMode = new VoiceMode();
        });
    } else {
        console.log('Initializing voice mode immediately...');
        window.voiceMode = new VoiceMode();
    }
} 