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
                            <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
                                Submit Feedback
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
    
    // Form submission
    form.addEventListener('submit', handleFeedbackSubmission);
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
function handleFeedbackSubmission(e) {
    e.preventDefault();
    
    const modal = document.getElementById('feedback-modal');
    const formData = new FormData(e.target);
    
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
        return;
    }
    
    if (!feedbackData.message.trim()) {
        alert('Please enter your feedback message.');
        return;
    }
    
    // Save feedback
    const saved = feedbackStorage.add(feedbackData);
    
    // Show success message
    showFeedbackSuccess(saved);
    
    // Close modal
    closeFeedbackModal();
}

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
                <div class="text-sm opacity-90">Thank you for helping improve this content</div>
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

// Setup admin dashboard (simple version for testing)
// Setup admin dashboard (modal version)
function setupAdminDashboard() {
    // Check if admin modal already exists
    let adminModal = document.getElementById('admin-feedback-modal');
    
    if (!adminModal) {
        // Create admin modal
        adminModal = document.createElement('div');
        adminModal.id = 'admin-feedback-modal';
        adminModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 hidden';
        adminModal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div class="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex justify-between items-center">
                    <h3 class="text-lg font-semibold text-stone-800">🛠️ Feedback Admin Dashboard</h3>
                    <button id="admin-modal-close" class="text-stone-400 hover:text-stone-600 text-2xl">&times;</button>
                </div>
                <div class="p-6">
                    <div class="mb-4 flex gap-3">
                        <button id="export-feedback" class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors">
                            📥 Export Data
                        </button>
                        <button id="clear-feedback" class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors">
                            🗑️ Clear All
                        </button>
                        <div class="ml-auto text-sm text-stone-600 flex items-center">
                            Total Feedback: <span id="feedback-count" class="ml-1 font-semibold">0</span>
                        </div>
                    </div>
                    <div id="feedback-list" class="space-y-4">
                        <!-- Feedback items will be populated here -->
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(adminModal);
        
        // Setup admin modal event listeners
        setupAdminModalListeners();
    }
    
    // Load and display feedback
    feedbackStorage.load();
    updateAdminDashboard();
    
    // Show the modal
    adminModal.classList.remove('hidden');
}

// Setup admin modal event listeners
function setupAdminModalListeners() {
    const modal = document.getElementById('admin-feedback-modal');
    const closeBtn = document.getElementById('admin-modal-close');
    const exportBtn = document.getElementById('export-feedback');
    const clearBtn = document.getElementById('clear-feedback');
    
    // Close modal
    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });
    
    // Click outside to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
    
    // Export feedback
    exportBtn.addEventListener('click', exportFeedbackData);
    
    // Clear feedback
    clearBtn.addEventListener('click', clearAllFeedback);
}

// Update admin dashboard display
function updateAdminDashboard() {
    const countElement = document.getElementById('feedback-count');
    const listElement = document.getElementById('feedback-list');
    
    if (countElement) {
        countElement.textContent = feedbackStorage.feedback.length;
    }
    
    if (listElement) {
        if (feedbackStorage.feedback.length === 0) {
            listElement.innerHTML = '<div class="text-center text-stone-500 py-8">No feedback submitted yet</div>';
        } else {
            listElement.innerHTML = feedbackStorage.feedback.map(fb => `
                <div class="border border-stone-200 rounded-lg p-4 bg-stone-50">
                    <div class="flex items-start justify-between mb-2">
                        <div class="flex items-center">
                            <span class="text-lg mr-2">${FEEDBACK_CATEGORIES[fb.category]?.icon || '💬'}</span>
                            <div>
                                <div class="font-medium text-stone-800">${FEEDBACK_CATEGORIES[fb.category]?.label || 'General Feedback'}</div>
                                <div class="text-sm text-stone-600">${fb.module} › ${fb.section}</div>
                            </div>
                        </div>
                        <div class="text-xs text-stone-400">${new Date(fb.timestamp).toLocaleString()}</div>
                    </div>
                    <div class="text-stone-700 mb-2">${fb.message}</div>
                    ${fb.userEmail ? `<div class="text-xs text-stone-500">Contact: ${fb.userEmail}</div>` : ''}
                </div>
            `).join('');
        }
    }
}

// Export feedback data
function exportFeedbackData() {
    const data = feedbackStorage.export();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `internal-dosimetry-feedback-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Feedback data exported successfully!');
}

// Clear all feedback data
function clearAllFeedback() {
    if (confirm('Are you sure you want to clear all feedback data? This cannot be undone.')) {
        feedbackStorage.clear();
        updateAdminDashboard();
        alert('All feedback data cleared.');
    }
}

// Global function to open admin dashboard (called from HTML)
function openFeedbackAdminDashboard() {
    // Simple password protection for admin access
    const adminPassword = prompt('Enter admin password to access feedback dashboard:');
    
    // You can change this password for production
    const correctPassword = 'healthphysics2025';
    
    if (adminPassword === correctPassword) {
        setupAdminDashboard();
    } else if (adminPassword !== null) { // null means user cancelled
        alert('Incorrect password. Access denied.');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFeedbackSystem);
} else {
    initializeFeedbackSystem();
}
