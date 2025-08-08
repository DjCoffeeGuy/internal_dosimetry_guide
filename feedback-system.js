/**
 * User Feedback System for Internal Dosimetry Learning Platform
 * Builds on existing modal system architecture (glossary-modal.js pattern)
 * Enables section-level feedback collection with localStorage persistence
 */

// Feedback system state management
let feedbackStorage = {
    feedback: [],
    load() {
        const saved = localStorage.getItem('internal-dosimetry-feedback');
        if (saved) {
            this.feedback = JSON.parse(saved);
        }
    },
    save() {
        localStorage.setItem('internal-dosimetry-feedback', JSON.stringify(this.feedback));
    },
    add(feedbackData) {
        const feedback = {
            id: Date.now() + Math.random(),
            timestamp: new Date().toISOString(),
            module: feedbackData.module,
            section: feedbackData.section,
            category: feedbackData.category,
            message: feedbackData.message,
            userEmail: feedbackData.userEmail || '',
            status: 'pending'
        };
        this.feedback.push(feedback);
        this.save();
        return feedback;
    },
    export() {
        return {
            exportDate: new Date().toISOString(),
            totalFeedback: this.feedback.length,
            feedback: this.feedback
        };
    },
    clear() {
        this.feedback = [];
        this.save();
    }
};

// Feedback categories configuration
const FEEDBACK_CATEGORIES = {
    'content-correction': {
        icon: '✏️',
        label: 'Content Correction',
        description: 'Report factual errors, typos, or clarity issues',
        placeholder: 'Describe the error or issue you found...'
    },
    'content-suggestion': {
        icon: '💡',
        label: 'Content Suggestion',
        description: 'Suggest additional information, examples, or explanations',
        placeholder: 'What would you like to see added or improved?...'
    },
    'technical-issue': {
        icon: '🐛',
        label: 'Technical Issue',
        description: 'Report broken links, display problems, or functionality bugs',
        placeholder: 'Describe the technical problem you encountered...'
    },
    'educational-improvement': {
        icon: '📚',
        label: 'Educational Improvement',
        description: 'Suggest improvements to learning experience, quiz questions, or examples',
        placeholder: 'How could this section better support learning?...'
    }
};

// Global flag to prevent multiple initializations
let feedbackSystemInitialized = false;

// Initialize feedback system
function initializeFeedbackSystem() {
    // Prevent multiple initializations
    if (feedbackSystemInitialized) {
        console.log('Feedback system already initialized, skipping...');
        return;
    }
    
    feedbackStorage.load();
    
    // Clean up any existing feedback controls first
    removeExistingFeedbackControls();
    
    addFeedbackControlsToSections();
    createFeedbackModal();
    
    // Initialize floating indicator
    updateFloatingIndicator();
    
    feedbackSystemInitialized = true;
    
    console.log('Feedback system initialized with', feedbackStorage.feedback.length, 'stored feedback items');
}

// Remove any existing feedback controls to prevent duplicates
function removeExistingFeedbackControls() {
    const existingControls = document.querySelectorAll('.feedback-controls');
    console.log(`Removing ${existingControls.length} existing feedback controls`);
    existingControls.forEach(control => control.remove());
}

// Add feedback controls to all content sections
function addFeedbackControlsToSections() {
    // Target only main content sections that have progress tracking (exclude quiz and other sections)
    const contentSections = document.querySelectorAll('section.progress-section[id^="section-"]');
    
    console.log(`Found ${contentSections.length} progress sections for feedback controls`);
    
    contentSections.forEach((section, index) => {
        // Skip if this is the quiz section or already has feedback controls
        if (section.id === 'knowledge-check' || section.querySelector('.feedback-controls')) {
            console.log(`Skipping section ${section.id} - already has controls or is quiz`);
            return;
        }
        
        // Generate section identifier
        const sectionId = section.id;
        const moduleName = getModuleName();
        
        console.log(`Adding feedback controls to section: ${sectionId}`);
        
        // Find the completion button - look for buttons containing "complete" or "markSectionComplete"
        const completeButton = section.querySelector('button[id*="complete-btn"], button[onclick*="markSectionComplete"]');
        
        if (completeButton) {
            // Find the container holding the completion button (usually a div with mt-6 or similar)
            let buttonContainer = completeButton.closest('div');
            
            // Create feedback controls container
            const feedbackControls = document.createElement('div');
            feedbackControls.className = 'feedback-controls mt-4 pt-4 border-t border-stone-200 flex gap-2 justify-end opacity-70 hover:opacity-100 transition-opacity';
            
            // Create feedback buttons
            const suggestButton = createFeedbackButton('content-suggestion', sectionId, moduleName);
            const issueButton = createFeedbackButton('technical-issue', sectionId, moduleName);
            
            feedbackControls.appendChild(suggestButton);
            feedbackControls.appendChild(issueButton);
            
            // Add feedback controls after the button container
            buttonContainer.parentNode.insertBefore(feedbackControls, buttonContainer.nextSibling);
            
            console.log(`Added feedback controls after completion button for ${sectionId}`);
        } else {
            console.log(`No completion button found in ${sectionId}, skipping feedback controls`);
        }
    });
}

// Create individual feedback button
function createFeedbackButton(category, sectionId, moduleName) {
    const config = FEEDBACK_CATEGORIES[category];
    const button = document.createElement('button');
    
    button.className = 'feedback-btn px-3 py-1 text-xs text-stone-600 hover:text-stone-800 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded transition-colors';
    button.innerHTML = `${config.icon} ${config.label}`;
    button.setAttribute('data-section', sectionId);
    button.setAttribute('data-module', moduleName);
    button.setAttribute('data-category', category);
    
    button.addEventListener('click', (e) => {
        e.preventDefault();
        openFeedbackModal(sectionId, moduleName, category);
    });
    
    return button;
}

// Get current module name from page
function getModuleName() {
    // Extract from URL or title
    const path = window.location.pathname;
    if (path.includes('foundations')) return 'foundations';
    if (path.includes('bioassay')) return 'bioassay';
    if (path.includes('intake-assessment')) return 'intake-assessment';
    if (path.includes('dose-calculation')) return 'dose-calculation';
    return 'unknown';
}

// Create feedback modal (reuses pattern from glossary-modal.js)
function createFeedbackModal() {
    const modal = document.createElement('div');
    modal.id = 'feedback-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 hidden';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex justify-between items-center">
                <h3 id="feedback-modal-title" class="text-lg font-semibold text-stone-800">Submit Feedback</h3>
                <button id="feedback-modal-close" class="text-stone-400 hover:text-stone-600 text-2xl">&times;</button>
            </div>
            <div class="p-6">
                <div id="feedback-modal-content">
                    <form id="feedback-form">
                        <div class="mb-4">
                            <label for="feedback-category-select" class="block text-sm font-medium text-stone-700 mb-2">
                                Feedback Type *
                            </label>
                            <select 
                                id="feedback-category-select" 
                                name="category" 
                                class="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">Select feedback type...</option>
                                <option value="content-correction">✏️ Content Correction - Report factual errors, typos, or clarity issues</option>
                                <option value="content-suggestion">� Content Suggestion - Suggest additional information or improvements</option>
                                <option value="technical-issue">🐛 Technical Issue - Report broken links or functionality bugs</option>
                                <option value="educational-improvement">📚 Educational Improvement - Suggest learning experience improvements</option>
                            </select>
                        </div>
                        
                        <div class="mb-4">
                            <div id="feedback-category-info" class="bg-blue-50 p-3 rounded border border-blue-200 text-sm hidden">
                                <div class="flex items-start">
                                    <span id="feedback-category-icon" class="text-lg mr-2">📝</span>
                                    <div>
                                        <div id="feedback-category-label" class="font-medium text-blue-800">Feedback Category</div>
                                        <div id="feedback-category-description" class="text-blue-700 mt-1">
                                            Select feedback type and describe your suggestion or issue.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-4">
                            <label for="feedback-message" class="block text-sm font-medium text-stone-700 mb-2">
                                Your Message *
                            </label>
                            <textarea 
                                id="feedback-message" 
                                name="message" 
                                rows="6" 
                                class="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Describe your feedback in detail..."
                                required
                            ></textarea>
                        </div>
                        
                        <div class="mb-4">
                            <label for="feedback-email" class="block text-sm font-medium text-stone-700 mb-2">
                                Email (Optional)
                            </label>
                            <input 
                                type="email" 
                                id="feedback-email" 
                                name="email" 
                                class="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="your.email@example.com (for follow-up)"
                            />
                            <p class="text-xs text-stone-500 mt-1">Optional: Leave your email if you'd like updates on your feedback</p>
                        </div>
                        
                        <div class="bg-stone-50 p-3 rounded border text-sm text-stone-600 mb-4">
                            <strong>Section:</strong> <span id="feedback-section-info">Unknown</span><br>
                            <strong>Module:</strong> <span id="feedback-module-info">Unknown</span>
                        </div>
                        
                        <div class="flex gap-3 justify-end">
                            <button type="button" id="feedback-cancel" class="px-4 py-2 text-stone-600 bg-stone-100 hover:bg-stone-200 rounded transition-colors">
                                Cancel
                            </button>
                            <button type="button" id="feedback-save" class="px-4 py-2 bg-stone-600 hover:bg-stone-700 text-white rounded transition-colors">
                                💾 Save for Later
                            </button>
                            <button type="button" id="feedback-send" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
                                📧 Send Now
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Setup modal event listeners
    setupFeedbackModalListeners();
}

// Setup feedback modal event listeners
function setupFeedbackModalListeners() {
    const modal = document.getElementById('feedback-modal');
    const closeBtn = document.getElementById('feedback-modal-close');
    const cancelBtn = document.getElementById('feedback-cancel');
    const form = document.getElementById('feedback-form');
    const categorySelect = document.getElementById('feedback-category-select');
    
    // Handle category selection change
    if (categorySelect) {
        categorySelect.addEventListener('change', function() {
            const selectedCategory = this.value;
            const categoryInfo = document.getElementById('feedback-category-info');
            const messageTextarea = document.getElementById('feedback-message');
            
            if (selectedCategory && FEEDBACK_CATEGORIES[selectedCategory]) {
                const config = FEEDBACK_CATEGORIES[selectedCategory];
                
                // Update category info display
                document.getElementById('feedback-category-icon').textContent = config.icon;
                document.getElementById('feedback-category-label').textContent = config.label;
                document.getElementById('feedback-category-description').textContent = config.description;
                messageTextarea.placeholder = config.placeholder;
                
                // Show category info
                categoryInfo.classList.remove('hidden');
            } else {
                // Hide category info if no selection
                categoryInfo.classList.add('hidden');
                messageTextarea.placeholder = 'Describe your feedback in detail...';
            }
        });
    }
    
    // Close modal handlers
    closeBtn.addEventListener('click', closeFeedbackModal);
    cancelBtn.addEventListener('click', closeFeedbackModal);
    
    // New button handlers
    const saveBtn = document.getElementById('feedback-save');
    const sendBtn = document.getElementById('feedback-send');
    
    if (saveBtn) {
        saveBtn.addEventListener('click', handleSaveForLater);
    }
    
    if (sendBtn) {
        sendBtn.addEventListener('click', handleSendNow);
    }
    
    // Click outside to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeFeedbackModal();
    });
    
    // Escape key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeFeedbackModal();
        }
    });
}

// Open feedback modal with specific configuration
function openFeedbackModal(sectionId, moduleName, defaultCategory = null) {
    const modal = document.getElementById('feedback-modal');
    
    // Update modal title
    document.getElementById('feedback-modal-title').textContent = '💬 Submit Feedback';
    
    // Set section/module info
    document.getElementById('feedback-section-info').textContent = sectionId;
    document.getElementById('feedback-module-info').textContent = moduleName;
    
    // Store current feedback context
    modal.setAttribute('data-section', sectionId);
    modal.setAttribute('data-module', moduleName);
    
    // Reset form
    document.getElementById('feedback-form').reset();
    
    // Set default category if provided
    if (defaultCategory && FEEDBACK_CATEGORIES[defaultCategory]) {
        const categorySelect = document.getElementById('feedback-category-select');
        categorySelect.value = defaultCategory;
        // Trigger change event to update UI
        categorySelect.dispatchEvent(new Event('change'));
    } else {
        // Hide category info if no default
        document.getElementById('feedback-category-info').classList.add('hidden');
    }
    
    // Show modal
    modal.classList.remove('hidden');
    
    // Focus on category select first, then message if category is pre-selected
    if (defaultCategory) {
        document.getElementById('feedback-message').focus();
    } else {
        document.getElementById('feedback-category-select').focus();
    }
}

// Close feedback modal
function closeFeedbackModal() {
    const modal = document.getElementById('feedback-modal');
    modal.classList.add('hidden');
}

// Handle feedback form submission

// Show feedback success notification
function showFeedbackSuccess(feedback) {
    // Create temporary success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform';
    notification.innerHTML = `
        <div class="flex items-center gap-2">
            <span>✅</span>
            <div>
                <div class="font-semibold">Feedback Submitted!</div>
                <div class="text-sm opacity-90"> </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.remove('translate-x-full'), 100);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Handle "Save for Later" button click
function handleSaveForLater() {
    const feedbackData = collectFeedbackData();
    if (!feedbackData) return;
    
    // Save feedback to localStorage
    const saved = feedbackStorage.add(feedbackData);
    
    // Show success message
    showFeedbackSuccess(saved, 'saved');
    
    // Update floating indicator
    updateFloatingIndicator();
    
    // Close modal
    closeFeedbackModal();
}

// Handle "Send Now" button click  
function handleSendNow() {
    const feedbackData = collectFeedbackData();
    if (!feedbackData) return;
    
    // Create email content
    const emailContent = formatFeedbackEmail(feedbackData);
    
    // Open email client
    const mailto = `mailto:dj@theradguy.com?subject=${encodeURIComponent(emailContent.subject)}&body=${encodeURIComponent(emailContent.body)}`;
    window.open(mailto);
    
    // Show success message
    showEmailSentMessage();
    
    // Close modal
    closeFeedbackModal();
}

// Collect feedback data from form
function collectFeedbackData() {
    const modal = document.getElementById('feedback-modal');
    const form = document.getElementById('feedback-form');
    const formData = new FormData(form);
    
    const feedbackData = {
        category: formData.get('category'),
        section: modal.getAttribute('data-section'),
        module: modal.getAttribute('data-module'),
        message: formData.get('message'),
        userEmail: formData.get('email')
    };
    
    // Validate required fields
    if (!feedbackData.category) {
        alert('Please select a feedback type.');
        return null;
    }
    
    if (!feedbackData.message.trim()) {
        alert('Please enter your feedback message.');
        return null;
    }
    
    return feedbackData;
}

// Format feedback for email
function formatFeedbackEmail(feedbackData) {
    const subject = `Internal Dosimetry Feedback: ${feedbackData.category} - ${feedbackData.module}`;
    
    const body = `Internal Dosimetry Learning Platform Feedback
    
Category: ${FEEDBACK_CATEGORIES[feedbackData.category]?.label || feedbackData.category}
Module: ${feedbackData.module}
Section: ${feedbackData.section}
${feedbackData.userEmail ? `User Email: ${feedbackData.userEmail}` : ''}

Message:
${feedbackData.message}

---
Sent from Internal Dosimetry Learning Platform
Timestamp: ${new Date().toLocaleString()}`;
    
    return { subject, body };
}

// Show email sent message
function showEmailSentMessage() {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform';
    notification.innerHTML = `
        <div class="flex items-center gap-2">
            <span>📧</span>
            <div>
                <div class="font-semibold">Email Client Opened!</div>
                <div class="text-sm opacity-90">Your feedback is ready to send</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.remove('translate-x-full'), 100);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Quiz-specific email feedback function
function openQuizFeedbackEmail() {
    // Determine which module we're on
    const currentUrl = window.location.pathname;
    let moduleName = '';
    
    if (currentUrl.includes('foundations')) {
        moduleName = 'Module 1: Foundations';
    } else if (currentUrl.includes('bioassay')) {
        moduleName = 'Module 2: Bioassay';
    } else if (currentUrl.includes('intake-assessment')) {
        moduleName = 'Module 3: Intake Assessment';
    } else if (currentUrl.includes('dose-calculation')) {
        moduleName = 'Module 4: Dose Calculation';
    } else {
        moduleName = 'Unknown Module';
    }
    
    // Create pre-filled email content for quiz feedback
    const subject = `Internal Dosimetry Quiz Feedback: ${moduleName}`;
    const body = `Internal Dosimetry Learning Platform - Quiz Feedback

Module: ${moduleName}
Quiz Section: Knowledge Check Quiz

Please share your feedback about this quiz:
(Was it helpful? Too easy/hard? Missing content? Confusing questions?)

Your feedback:


---
Sent from Internal Dosimetry Learning Platform
Timestamp: ${new Date().toLocaleString()}`;
    
    const mailto = `mailto:dj@theradguy.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto);
    
    // Show success message
    showEmailSentMessage();
}

// Update floating indicator for saved feedback
function updateFloatingIndicator() {
    let indicator = document.getElementById('feedback-indicator');
    
    if (!indicator) {
        // Create floating indicator with reset button
        indicator = document.createElement('div');
        indicator.id = 'feedback-indicator';
        indicator.className = 'fixed bottom-4 right-4 bg-amber-500 text-white rounded-lg shadow-lg z-40 transition-colors';
        indicator.innerHTML = `
            <div class="flex items-center">
                <div class="px-3 py-2 cursor-pointer hover:bg-amber-600 transition-colors rounded-l-lg" onclick="sendAllFeedback()">
                    <div class="flex items-center gap-2">
                        <span>�</span>
                        <span class="text-sm">Send</span>
                        <span id="feedback-count">0</span>
                        <span class="text-sm">feedback</span>
                    </div>
                </div>
                <button id="feedback-reset-btn" class="px-2 py-2 hover:bg-red-600 bg-red-500 transition-colors rounded-r-lg border-l border-red-400" onclick="resetSavedFeedback()" title="Clear saved feedback">
                    <span class="text-xs">✕</span>
                </button>
            </div>
        `;
        
        document.body.appendChild(indicator);
    }
    
    // Update count
    const countElement = document.getElementById('feedback-count');
    if (countElement) {
        countElement.textContent = feedbackStorage.feedback.length;
    }
    
    // Show/hide indicator based on count
    if (feedbackStorage.feedback.length > 0) {
        indicator.style.display = 'block';
    } else {
        indicator.style.display = 'none';
    }
}

// Modified success message to handle different types
function showFeedbackSuccess(feedback, type = 'submitted') {
    const messages = {
        'submitted': {
            title: 'Feedback Submitted!',
            subtitle: 'Thank you for helping improve this content'
        },
        'saved': {
            title: 'Feedback Saved!',
            subtitle: 'You can send it later from the indicator'
        }
    };
    
    const msg = messages[type] || messages['submitted'];
    
    // Create temporary success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform';
    notification.innerHTML = `
        <div class="flex items-center gap-2">
            <span>✅</span>
            <div>
                <div class="font-semibold">${msg.title}</div>
                <div class="text-sm opacity-90">${msg.subtitle}</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.remove('translate-x-full'), 100);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Simple function to send all feedback via email
function sendAllFeedback() {
    feedbackStorage.load();
    
    if (feedbackStorage.feedback.length === 0) {
        alert('No feedback to send!');
        return;
    }
    
    // Format all feedback for email
    const subject = encodeURIComponent('Internal Dosimetry Learning Platform - User Feedback');
    let body = 'Hello! Here is feedback from the Internal Dosimetry Learning Platform:\n\n';
    
    feedbackStorage.feedback.forEach((fb, index) => {
        const category = FEEDBACK_CATEGORIES[fb.category]?.label || 'General Feedback';
        body += `--- Feedback ${index + 1} ---\n`;
        body += `Module: ${fb.module}\n`;
        body += `Section: ${fb.section}\n`;
        body += `Category: ${category}\n`;
        body += `Date: ${new Date(fb.timestamp).toLocaleDateString()}\n`;
        body += `Message: ${fb.message}\n`;
        if (fb.userEmail) {
            body += `User Email: ${fb.userEmail}\n`;
        }
        body += '\n';
    });
    
    body += `Total feedback items: ${feedbackStorage.feedback.length}\n`;
    body += `Export date: ${new Date().toLocaleDateString()}\n\n`;
    body += 'Thank you for improving the learning experience!';
    
    const encodedBody = encodeURIComponent(body);
    const mailtoLink = `mailto:dj@theradguy.com?subject=${subject}&body=${encodedBody}`;
    
    // Open email client
    window.location.href = mailtoLink;
    
    // Show success message
    showFeedbackNotification('📧 Opening your email client...', 'success');
    
    // Optionally clear feedback after sending
    setTimeout(() => {
        if (confirm('Feedback sent to your email client. Clear the saved feedback?')) {
            feedbackStorage.clear();
            updateFloatingIndicator();
            showFeedbackNotification('✅ Feedback cleared!', 'success');
        }
    }, 2000);
}

// Global function to reset saved feedback
function resetSavedFeedback() {
    if (feedbackStorage.feedback.length === 0) {
        alert('No saved feedback to clear.');
        return;
    }
    
    const count = feedbackStorage.feedback.length;
    if (confirm(`Are you sure you want to clear all ${count} saved feedback item${count > 1 ? 's' : ''}? This will allow you to try sending your feedback again.`)) {
        feedbackStorage.clear();
        updateFloatingIndicator();
        
        // Show success message
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform';
        notification.innerHTML = `
            <div class="flex items-center gap-2">
                <span>🗑️</span>
                <div>
                    <div class="font-semibold">Feedback Cleared!</div>
                    <div class="text-sm opacity-90">You can now submit new feedback</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.remove('translate-x-full'), 100);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Global function to open admin dashboard (called from HTML)
function openFeedbackAdminDashboard() {
    sendAllFeedback();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFeedbackSystem);
} else {
    initializeFeedbackSystem();
}
