/**
 * Glossary Modal System for Internal Dosimetry Learning Platform
 * Provides popup definitions for technical terms with cross-references
 * Last Updated: August 5, 2025
 */

// CSS for glossary modal system
const GLOSSARY_MODAL_CSS = `
<style>
    .glossary-term {
        color: #1d4ed8;
        text-decoration: underline;
        text-decoration-style: dotted;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .glossary-term:hover {
        color: #1e40af;
        background-color: #dbeafe;
        text-decoration-style: solid;
    }
    
    .glossary-modal {
        display: none;
        position: fixed;
        z-index: 9999;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(2px);
    }
    
    .glossary-modal-content {
        background-color: white;
        margin: 5% auto;
        padding: 0;
        border-radius: 12px;
        width: 90%;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        animation: modalSlideIn 0.3s ease-out;
    }
    
    @keyframes modalSlideIn {
        from {
            opacity: 0;
            transform: translateY(-30px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
    
    .glossary-modal-header {
        background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
        color: white;
        padding: 20px 24px;
        border-radius: 12px 12px 0 0;
        position: relative;
    }
    
    .glossary-modal-close {
        position: absolute;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        font-weight: bold;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s ease;
    }
    
    .glossary-modal-close:hover {
        background-color: rgba(255, 255, 255, 0.2);
    }
    
    .glossary-modal-body {
        padding: 24px;
    }
    
    .glossary-term-title {
        font-size: 1.5rem;
        font-weight: bold;
        color: #1e40af;
        margin-bottom: 8px;
    }
    
    .glossary-category-badge {
        display: inline-block;
        background: #eff6ff;
        color: #1e40af;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.875rem;
        font-weight: 500;
        margin-bottom: 16px;
        text-transform: capitalize;
    }
    
    .glossary-definition {
        font-size: 1rem;
        line-height: 1.6;
        color: #374151;
        margin-bottom: 20px;
    }
    
    .glossary-related-terms {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #e5e7eb;
    }
    
    .glossary-related-title {
        font-weight: 600;
        color: #374151;
        margin-bottom: 8px;
    }
    
    .glossary-related-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }
    
    .glossary-related-term {
        background: #f3f4f6;
        color: #1e40af;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s ease;
        text-decoration: none;
    }
    
    .glossary-related-term:hover {
        background: #dbeafe;
        text-decoration: none;
        color: #1e40af;
    }
    
    .glossary-references {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #e5e7eb;
        font-size: 0.875rem;
        color: #6b7280;
    }
    
    .glossary-references-title {
        font-weight: 600;
        margin-bottom: 4px;
    }
    
    @media (max-width: 640px) {
        .glossary-modal-content {
            margin: 10px;
            width: calc(100% - 20px);
            max-height: calc(100vh - 20px);
        }
        
        .glossary-modal-header {
            padding: 16px 20px;
        }
        
        .glossary-modal-body {
            padding: 20px;
        }
    }
</style>`;

// HTML template for the glossary modal
const GLOSSARY_MODAL_HTML = `
<div id="glossary-modal" class="glossary-modal">
    <div class="glossary-modal-content">
        <div class="glossary-modal-header">
            <h2 id="glossary-modal-title" class="glossary-term-title"></h2>
            <button class="glossary-modal-close" onclick="closeGlossaryModal()">&times;</button>
        </div>
        <div class="glossary-modal-body">
            <div id="glossary-category-badge" class="glossary-category-badge"></div>
            <div id="glossary-definition" class="glossary-definition"></div>
            <div id="glossary-related-section" class="glossary-related-terms" style="display: none;">
                <div class="glossary-related-title">Related Terms:</div>
                <div id="glossary-related-list" class="glossary-related-list"></div>
            </div>
            <div id="glossary-references-section" class="glossary-references" style="display: none;">
                <div class="glossary-references-title">References:</div>
                <div id="glossary-references-text"></div>
            </div>
        </div>
    </div>
</div>`;

/**
 * Initialize the glossary system
 * Should be called when the page loads
 */
function initializeGlossarySystem() {
    // Add CSS to the document
    const style = document.createElement('style');
    style.innerHTML = GLOSSARY_MODAL_CSS.replace('<style>', '').replace('</style>', '');
    document.head.appendChild(style);
    
    // Add modal HTML to the document
    document.body.insertAdjacentHTML('beforeend', GLOSSARY_MODAL_HTML);
    
    // Add event listeners to all glossary terms
    setupGlossaryEventListeners();
    
    // Close modal when clicking outside
    document.getElementById('glossary-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeGlossaryModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeGlossaryModal();
        }
    });
}

/**
 * Set up event listeners for all glossary terms on the page
 */
function setupGlossaryEventListeners() {
    document.querySelectorAll('.glossary-term').forEach(term => {
        term.addEventListener('click', function(e) {
            e.preventDefault();
            const termKey = this.getAttribute('data-term');
            if (termKey) {
                showGlossaryModal(termKey);
            }
        });
    });
}

/**
 * Show the glossary modal with definition for the specified term
 * @param {string} termKey - The key for the glossary term
 */
function showGlossaryModal(termKey) {
    const definition = getGlossaryDefinition(termKey);
    
    if (!definition) {
        console.error('Glossary definition not found for term:', termKey);
        alert('Definition not available for this term. Please check back later.');
        return;
    }
    
    // Populate modal content
    document.getElementById('glossary-modal-title').textContent = definition.term;
    document.getElementById('glossary-category-badge').textContent = definition.category.replace('-', ' ');
    document.getElementById('glossary-definition').textContent = definition.definition;
    
    // Handle related terms
    const relatedSection = document.getElementById('glossary-related-section');
    const relatedList = document.getElementById('glossary-related-list');
    
    if (definition.relatedTerms && definition.relatedTerms.length > 0) {
        relatedList.innerHTML = '';
        definition.relatedTerms.forEach(relatedTermKey => {
            const relatedDef = getGlossaryDefinition(relatedTermKey);
            if (relatedDef) {
                const relatedElement = document.createElement('span');
                relatedElement.className = 'glossary-related-term';
                relatedElement.textContent = relatedDef.term;
                relatedElement.onclick = () => showGlossaryModal(relatedTermKey);
                relatedList.appendChild(relatedElement);
            }
        });
        relatedSection.style.display = 'block';
    } else {
        relatedSection.style.display = 'none';
    }
    
    // Handle references
    const referencesSection = document.getElementById('glossary-references-section');
    const referencesText = document.getElementById('glossary-references-text');
    
    if (definition.references) {
        referencesText.textContent = definition.references;
        referencesSection.style.display = 'block';
    } else {
        referencesSection.style.display = 'none';
    }
    
    // Show modal
    document.getElementById('glossary-modal').style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

/**
 * Close the glossary modal
 */
function closeGlossaryModal() {
    document.getElementById('glossary-modal').style.display = 'none';
    document.body.style.overflow = ''; // Restore background scrolling
}

/**
 * Add new glossary terms to the page after dynamic content is loaded
 * Should be called after adding new content with glossary terms
 */
function refreshGlossaryEventListeners() {
    setupGlossaryEventListeners();
}
