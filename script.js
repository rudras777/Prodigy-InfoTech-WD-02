class PremiumStopwatch {
    constructor() {
        // Core timing properties
        this.startTime = null;
        this.elapsedTime = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.intervalId = null;
        this.lapTimes = [];
        this.lapCounter = 0;
        
        // DOM elements
        this.elements = {
            timeDisplay: document.getElementById('timeDisplay'),
            hoursElement: document.querySelector('.time-hours'),
            minutesElement: document.querySelector('.time-minutes'),
            secondsElement: document.querySelector('.time-seconds'),
            millisecondsElement: document.querySelector('.time-milliseconds'),
            statusIndicator: document.getElementById('statusIndicator'),
            statusText: document.querySelector('.status-text'),
            startBtn: document.getElementById('startBtn'),
            pauseBtn: document.getElementById('pauseBtn'),
            resetBtn: document.getElementById('resetBtn'),
            lapBtn: document.getElementById('lapBtn'),
            fullscreenBtn: document.getElementById('fullscreenBtn'),
            themeToggle: document.getElementById('themeToggle'),
            lapTimesSection: document.getElementById('lapTimesSection'),
            lapTimesContainer: document.getElementById('lapTimesContainer'),
            clearLapsBtn: document.getElementById('clearLapsBtn')
        };
        
        // Theme management
        this.currentTheme = localStorage.getItem('stopwatch-theme') || 'light';
        
        // Initialize the application
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.applyTheme();
        this.updateDisplay();
        this.updateStatus('Ready');
        
        // Add smooth entrance animation
        setTimeout(() => {
            document.querySelector('.stopwatch-container').style.opacity = '1';
        }, 100);
    }
    
    setupEventListeners() {
        // Primary control buttons
        this.elements.startBtn.addEventListener('click', () => this.start());
        this.elements.pauseBtn.addEventListener('click', () => this.pause());
        this.elements.resetBtn.addEventListener('click', () => this.reset());
        
        // Secondary control buttons
        this.elements.lapBtn.addEventListener('click', () => this.recordLap());
        this.elements.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.elements.clearLapsBtn.addEventListener('click', () => this.clearLaps());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Fullscreen change events
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('MSFullscreenChange', () => this.handleFullscreenChange());
        
        // Prevent context menu on buttons for better UX
        document.querySelectorAll('.control-btn').forEach(btn => {
            btn.addEventListener('contextmenu', (e) => e.preventDefault());
        });
        
        // Add button press animations
        document.querySelectorAll('.control-btn').forEach(btn => {
            btn.addEventListener('mousedown', () => {
                btn.style.transform = 'translateY(-1px) scale(0.98)';
            });
            btn.addEventListener('mouseup', () => {
                btn.style.transform = '';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.isPaused = false;
            this.startTime = Date.now() - this.elapsedTime;
            
            // Start the high-precision timer
            this.intervalId = setInterval(() => {
                this.elapsedTime = Date.now() - this.startTime;
                this.updateDisplay();
            }, 1); // 1ms precision for ultra-smooth updates
            
            this.updateButtonStates();
            this.updateStatus('Running');
            this.addRunningAnimation();
            
            // Haptic feedback if available
            this.triggerHapticFeedback();
        }
    }
    
    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            this.isPaused = true;
            clearInterval(this.intervalId);
            
            this.updateButtonStates();
            this.updateStatus('Paused');
            this.removeRunningAnimation();
            
            this.triggerHapticFeedback();
        }
    }
    
    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.elapsedTime = 0;
        this.startTime = null;
        clearInterval(this.intervalId);
        
        this.updateDisplay();
        this.updateButtonStates();
        this.updateStatus('Ready');
        this.removeRunningAnimation();
        
        // Reset animation
        this.elements.timeDisplay.style.animation = 'fadeIn 0.3s ease-out';
        setTimeout(() => {
            this.elements.timeDisplay.style.animation = '';
        }, 300);
        
        this.triggerHapticFeedback();
    }
    
    recordLap() {
        if (this.isRunning) {
            this.lapCounter++;
            const currentTime = this.elapsedTime;
            const previousLapTime = this.lapTimes.length > 0 ? this.lapTimes[this.lapTimes.length - 1].time : 0;
            const splitTime = currentTime - previousLapTime;
            
            const lapData = {
                number: this.lapCounter,
                time: currentTime,
                split: splitTime,
                timestamp: new Date()
            };
            
            this.lapTimes.push(lapData);
            this.displayLapTime(lapData);
            this.showLapTimesSection();
            
            // Scroll to latest lap
            setTimeout(() => {
                const container = this.elements.lapTimesContainer;
                container.scrollTop = container.scrollHeight;
            }, 100);
            
            this.triggerHapticFeedback();
        }
    }
    
    displayLapTime(lapData) {
        const lapElement = document.createElement('div');
        lapElement.className = 'lap-time-item';
        lapElement.innerHTML = `
            <div class="lap-info">
                <span class="lap-number">Lap ${lapData.number}</span>
                <span class="lap-split">+${this.formatTime(lapData.split)}</span>
            </div>
            <span class="lap-time">${this.formatTime(lapData.time)}</span>
        `;
        
        this.elements.lapTimesContainer.appendChild(lapElement);
        
        // Add entrance animation
        setTimeout(() => {
            lapElement.style.opacity = '1';
            lapElement.style.transform = 'translateY(0)';
        }, 10);
    }
    
    clearLaps() {
        this.lapTimes = [];
        this.lapCounter = 0;
        this.elements.lapTimesContainer.innerHTML = '';
        this.hideLapTimesSection();
        this.triggerHapticFeedback();
    }
    
    showLapTimesSection() {
        this.elements.lapTimesSection.classList.add('visible');
    }
    
    hideLapTimesSection() {
        this.elements.lapTimesSection.classList.remove('visible');
    }
    
    toggleFullscreen() {
        const container = document.querySelector('.app-container');
        
        if (!document.fullscreenElement && !document.webkitFullscreenElement && 
            !document.mozFullScreenElement && !document.msFullscreenElement) {
            // Enter fullscreen
            if (container.requestFullscreen) {
                container.requestFullscreen();
            } else if (container.webkitRequestFullscreen) {
                container.webkitRequestFullscreen();
            } else if (container.mozRequestFullScreen) {
                container.mozRequestFullScreen();
            } else if (container.msRequestFullscreen) {
                container.msRequestFullscreen();
            }
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }
    
    handleFullscreenChange() {
        const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || 
                               document.mozFullScreenElement || document.msFullscreenElement);
        
        const container = document.querySelector('.app-container');
        if (isFullscreen) {
            container.classList.add('fullscreen-mode');
        } else {
            container.classList.remove('fullscreen-mode');
        }
    }
    
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        localStorage.setItem('stopwatch-theme', this.currentTheme);
        this.triggerHapticFeedback();
    }
    
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        
        // Add theme transition animation
        document.body.style.transition = 'all 0.3s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    }
    
    updateDisplay() {
        const timeObj = this.parseTime(this.elapsedTime);
        
        // Update individual time components with smooth transitions
        this.updateTimeComponent(this.elements.hoursElement, timeObj.hours);
        this.updateTimeComponent(this.elements.minutesElement, timeObj.minutes);
        this.updateTimeComponent(this.elements.secondsElement, timeObj.seconds);
        this.updateTimeComponent(this.elements.millisecondsElement, `.${timeObj.milliseconds}`);
    }
    
    updateTimeComponent(element, value) {
        if (element.textContent !== value) {
            element.style.transform = 'scale(1.1)';
            element.textContent = value;
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 100);
        }
    }
    
    parseTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const ms = Math.floor((milliseconds % 1000));
        
        return {
            hours: hours.toString().padStart(2, '0'),
            minutes: minutes.toString().padStart(2, '0'),
            seconds: seconds.toString().padStart(2, '0'),
            milliseconds: ms.toString().padStart(3, '0')
        };
    }
    
    formatTime(milliseconds) {
        const timeObj = this.parseTime(milliseconds);
        if (parseInt(timeObj.hours) > 0) {
            return `${timeObj.hours}:${timeObj.minutes}:${timeObj.seconds}.${timeObj.milliseconds}`;
        } else {
            return `${timeObj.minutes}:${timeObj.seconds}.${timeObj.milliseconds}`;
        }
    }
    
    updateButtonStates() {
        if (this.isRunning) {
            this.elements.startBtn.style.display = 'none';
            this.elements.pauseBtn.style.display = 'flex';
            this.elements.lapBtn.disabled = false;
        } else {
            this.elements.startBtn.style.display = 'flex';
            this.elements.pauseBtn.style.display = 'none';
            this.elements.lapBtn.disabled = !this.isPaused;
        }
        
        // Update button opacity based on state
        this.elements.lapBtn.style.opacity = this.elements.lapBtn.disabled ? '0.5' : '1';
        this.elements.resetBtn.style.opacity = (this.elapsedTime > 0) ? '1' : '0.7';
    }
    
    updateStatus(status) {
        this.elements.statusText.textContent = status;
        const indicator = this.elements.statusIndicator;
        
        // Remove all status classes
        indicator.classList.remove('running', 'paused');
        
        // Add appropriate status class
        if (status === 'Running') {
            indicator.classList.add('running');
        } else if (status === 'Paused') {
            indicator.classList.add('paused');
        }
    }
    
    addRunningAnimation() {
        this.elements.timeDisplay.classList.add('running');
    }
    
    removeRunningAnimation() {
        this.elements.timeDisplay.classList.remove('running');
    }
    
    handleKeyPress(event) {
        // Prevent default behavior for our shortcuts
        const shortcuts = ['Space', 'KeyR', 'KeyL', 'KeyF', 'KeyT'];
        if (shortcuts.includes(event.code)) {
            event.preventDefault();
        }
        
        switch (event.code) {
            case 'Space':
                if (this.isRunning) {
                    this.pause();
                } else {
                    this.start();
                }
                break;
            case 'KeyR':
                this.reset();
                break;
            case 'KeyL':
                this.recordLap();
                break;
            case 'KeyF':
                this.toggleFullscreen();
                break;
            case 'KeyT':
                this.toggleTheme();
                break;
        }
    }
    
    triggerHapticFeedback() {
        // Trigger haptic feedback on supported devices
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
    }
    
    // Export functionality for data persistence
    exportData() {
        const data = {
            lapTimes: this.lapTimes,
            totalTime: this.elapsedTime,
            exportDate: new Date().toISOString(),
            theme: this.currentTheme
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stopwatch-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // Performance monitoring
    getPerformanceMetrics() {
        return {
            lapCount: this.lapTimes.length,
            totalTime: this.elapsedTime,
            averageLapTime: this.lapTimes.length > 0 ? 
                this.lapTimes.reduce((sum, lap) => sum + lap.split, 0) / this.lapTimes.length : 0,
            fastestLap: this.lapTimes.length > 0 ? 
                Math.min(...this.lapTimes.map(lap => lap.split)) : 0,
            slowestLap: this.lapTimes.length > 0 ? 
                Math.max(...this.lapTimes.map(lap => lap.split)) : 0
        };
    }
}

// Initialize the stopwatch when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add loading animation
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
        
        // Initialize the premium stopwatch
        window.stopwatch = new PremiumStopwatch();
        
        // Add some easter eggs for power users
        console.log('🚀 Premium Stopwatch Pro initialized!');
        console.log('💡 Pro tip: Use keyboard shortcuts for faster control!');
        console.log('⌨️  Space: Start/Pause | R: Reset | L: Lap | F: Fullscreen | T: Theme');
        
        // Add performance monitoring in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            window.getStopwatchMetrics = () => window.stopwatch.getPerformanceMetrics();
            console.log('🔧 Development mode: Use getStopwatchMetrics() to view performance data');
        }
    }, 100);
});

// Service Worker registration for PWA capabilities (optional enhancement)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment to enable PWA features
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered'))
        //     .catch(registrationError => console.log('SW registration failed'));
    });
}

// Handle visibility change to pause when tab is not active (battery optimization)
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.stopwatch && window.stopwatch.isRunning) {
        // Optional: Auto-pause when tab becomes inactive
        // window.stopwatch.pause();
    }
});

// Prevent accidental page refresh when stopwatch is running
window.addEventListener('beforeunload', (event) => {
    if (window.stopwatch && window.stopwatch.isRunning) {
        event.preventDefault();
        event.returnValue = 'Stopwatch is currently running. Are you sure you want to leave?';
        return event.returnValue;
    }
});

// Add global error handling
window.addEventListener('error', (event) => {
    console.error('Stopwatch Error:', event.error);
    // Could implement error reporting here
});

// Performance optimization: Cleanup on page unload
window.addEventListener('unload', () => {
    if (window.stopwatch) {
        clearInterval(window.stopwatch.intervalId);
    }
});
