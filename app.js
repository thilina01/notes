// Global variables
let contentTypes = [];
let currentContentType = null;
let currentItems = [];
let currentItem = 'all';

// SVG icons
const icons = {
    check: `<svg class="icon-check" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
    </svg>`,
    chevron: `<svg class="icon-chevron" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
    </svg>`
};

// Load content configuration by scanning content folder
async function loadContentConfig() {
    try {
        // Try to load content files from manifest first
        let contentFiles = await loadFromManifest();
        
        // If manifest fails, fall back to discovery
        if (contentFiles.length === 0) {
            console.log('Manifest not available, discovering files...');
            contentFiles = await discoverContentFiles();
        }
        
        contentTypes = [];
        
        for (const file of contentFiles) {
            try {
                const response = await fetch(file);
                if (response.ok) {
                    const data = await response.json();
                    if (data.config && data.config.enabled) {
                        contentTypes.push({
                            id: data.config.id,
                            name: data.config.name,
                            description: data.config.description,
                            icon: data.config.icon,
                            dataFile: file
                        });
                    }
                }
            } catch (error) {
                console.warn(`Could not load ${file}:`, error.message);
            }
        }
        
        if (contentTypes.length === 0) {
            throw new Error('No enabled content types found');
        }
        
        console.log('✅ Loaded content configuration');
        console.log('📊 Enabled content types:', contentTypes.map(ct => ct.id));
        
        renderSidebar();
        initializeSidebarToggle();
        
        // Load the first enabled content type
        if (contentTypes.length > 0) {
            await loadContentData(contentTypes[0].id);
        }
    } catch (error) {
        console.error('Error loading content config:', error);
        showError('Failed to load content configuration. Using fallback data.');
        
        // Create fallback content type and data
        const fallbackContentType = {
            id: 'fallback',
            name: 'Sample Content',
            description: 'Fallback content for demonstration',
            icon: '📝',
            enabled: true,
            dataFile: 'fallback'
        };
        
        contentTypes = [fallbackContentType];
        renderSidebar();
        initializeSidebarToggle();
        
        // Load fallback data
        currentItems = await loadEmbeddedData();
        currentContentType = 'fallback';
        currentItem = 'all';
        renderApplication();
    }
}

// Load content files from manifest
async function loadFromManifest() {
    try {
        const response = await fetch('content/manifest.json');
        if (response.ok) {
            const manifest = await response.json();
            
            // Handle both old and new manifest formats
            let contentFiles;
            if (Array.isArray(manifest.contentFiles)) {
                // New format with ordering
                contentFiles = manifest.contentFiles
                    .sort((a, b) => (a.order || 999) - (b.order || 999))
                    .map(item => `content/${item.file}`);
                console.log(`📋 Loaded ${contentFiles.length} files from manifest (ordered)`);
            } else {
                // Old format (backward compatibility)
                contentFiles = manifest.contentFiles.map(file => `content/${file}`);
                console.log(`📋 Loaded ${contentFiles.length} files from manifest (legacy)`);
            }
            
            return contentFiles;
        }
    } catch (error) {
        console.log('Manifest not available:', error.message);
    }
    return [];
}

// Discover content files by trying common patterns
async function discoverContentFiles() {
    const commonFiles = [
        'java-versions.json',
        'java-advanced.json', 
        'spring-versions.json',
        'docker-versions.json',
        'kubernetes.json',
        'notes.json',
        'content-template.json',
        'python-example.json',
        'git-commands-example.json'
    ];
    
    const discoveredFiles = [];
    
    // Try each common file
    for (const fileName of commonFiles) {
        try {
            const response = await fetch(`content/${fileName}`);
            if (response.ok) {
                discoveredFiles.push(`content/${fileName}`);
                console.log(`✅ Discovered: content/${fileName}`);
            }
        } catch (error) {
            console.log(`❌ Not found: content/${fileName}`);
        }
    }
    
    // Try to discover additional files with common patterns
    const additionalPatterns = [
        'java-*.json',
        'spring-*.json', 
        'docker-*.json',
        'kubernetes-*.json',
        '*-example.json',
        '*-template.json'
    ];
    
    // For now, we'll stick with the common files approach
    // In a real implementation, you might want to maintain a manifest file
    // or use server-side directory listing
    
    console.log(`📁 Discovered ${discoveredFiles.length} content files`);
    return discoveredFiles;
}

// Initialize sidebar toggle functionality
function initializeSidebarToggle() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebarToggle');
    
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        
        // Update toggle icon
        const icon = toggleBtn.querySelector('.toggle-icon');
        if (sidebar.classList.contains('collapsed')) {
            icon.innerHTML = '<path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>';
        } else {
            icon.innerHTML = '<path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>';
        }
    });
}

// Load data for specific content type
async function loadContentData(contentTypeId) {
    try {
        const contentType = contentTypes.find(ct => ct.id === contentTypeId);
        if (!contentType) {
            throw new Error(`Content type ${contentTypeId} not found`);
        }

        const response = await fetch(contentType.dataFile);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        currentItems = data.content; // Changed from data.versions to data.content
        currentContentType = contentTypeId;
        currentItem = 'all';
        
        console.log(`✅ Loaded data from ${contentType.dataFile}`);
        updateMainContent(contentType);
        renderSidebar(); // Re-render sidebar to update active state
        renderApplication();
    } catch (error) {
        console.warn(`⚠️ Failed to load ${contentTypeId} data, using fallback:`, error.message);
        // Fallback to generic data
        currentItems = await loadEmbeddedData();
        currentContentType = contentTypes.length > 0 ? contentTypes[0].id : 'fallback';
        currentItem = 'all';
        renderSidebar(); // Re-render sidebar to update active state
        renderApplication();
    }
}

// Update main content title and subtitle
function updateMainContent(contentType) {
    const mainTitle = document.getElementById('mainTitle');
    const mainSubtitle = document.getElementById('mainSubtitle');
    
    // Use generic titles from content config
    mainTitle.textContent = contentType.name;
    mainSubtitle.textContent = contentType.description;
}

// Render sidebar menu
function renderSidebar() {
    const contentMenu = document.getElementById('contentMenu');
    contentMenu.innerHTML = contentTypes.map(contentType => `
        <div class="menu-item ${contentType.id === currentContentType ? 'active' : ''}" data-content-type="${contentType.id}">
            <div class="menu-item-content">
                <div class="menu-item-name">${contentType.icon} ${contentType.name}</div>
                <div class="menu-item-description">${contentType.description}</div>
            </div>
        </div>
    `).join('');
    
    // Add click handlers
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const contentTypeId = item.getAttribute('data-content-type');
            if (contentTypeId !== currentContentType) {
                // Update active state
                menuItems.forEach(menuItem => menuItem.classList.remove('active'));
                item.classList.add('active');
                
                loadContentData(contentTypeId);
            }
        });
    });
}

// Load embedded data as fallback
async function loadEmbeddedData() {
    // Generic fallback - minimal data structure
    return [
        {
            id: "all",
            title: "📚 All Items — Complete Overview",
            type: "overview",
            year: "All",
            sections: []
        },
        {
            id: "sample",
            title: "📝 Sample Item",
            type: "sample",
            year: "2024",
            sections: [{
                name: "✅ Sample Feature",
                text: "This is a sample feature with some explanatory text.",
                code: "// Sample code\necho 'Hello, World!';"
            }]
        }
    ];
}

// Generate content for "All" tab
function generateAllItemsContent() {
    const allItems = currentItems.filter(v => v.id !== 'all');
    
    if (allItems.length === 0) {
        return '<div class="no-data-message">No content available. Please check your data source.</div>';
    }
    
    return allItems.map(item => `
        <div class="item-section-compact">
            <div class="item-section-header-compact">
                <h3>${item.title}</h3>
                <span class="feature-count">${item.sections ? item.sections.length : 0} items</span>
            </div>
            <div class="features-compact-grid">
                ${item.sections ? item.sections.map((section, featureIndex) => `
                    <div class="feature-item-compact clickable" data-item-id="${item.id}" data-feature-index="${featureIndex}">
                        ${icons.check}
                        <span class="feature-name">${section.name}</span>
                    </div>
                `).join('') : ''}
            </div>
        </div>
    `).join('');
}

// Get appropriate label for sections - completely generic
function getSectionLabel() {
    // Just return a generic label - no need for specific labels
    return 'items';
}

// Render the entire application
function renderApplication() {
    renderTabs();
    renderContent();
    initializeEventListeners();
}

// Render navigation tabs
function renderTabs() {
    const tabsContainer = document.getElementById('versionTabs');
    tabsContainer.innerHTML = `
        <button class="tab-btn ${currentItem === 'all' ? 'active' : ''}" data-item="all" title="All Items — Complete Overview">
            All
        </button>
    ` + currentItems.map(item => `
        <button class="tab-btn ${item.id === currentItem ? 'active' : ''}" data-item="${item.id}" title="${item.title}">
            ${getShortTabLabel(item)}
        </button>
    `).join('');
}

// Get current content type name
function getContentTypeName() {
    const contentType = contentTypes.find(ct => ct.id === currentContentType);
    return contentType ? contentType.name.replace(/[^\w\s]/g, '').trim() : 'Item';
}

// Get short tab label for items
function getShortTabLabel(item) {
    // Extract meaningful part from title
    const title = item.title;
    
    // Remove emoji and common prefixes
    let shortLabel = title.replace(/^[^\w\s]*\s*/, ''); // Remove emoji at start
    
    // Handle specific patterns
    if (shortLabel.includes('—')) {
        shortLabel = shortLabel.split('—')[0].trim();
    }
    
    // Further shorten common patterns
    const shortenMap = {
        'basic-commands': 'Basic',
        'namespace-operations': 'Namespaces',
        'file-operations': 'Files',
        'debugging-troubleshooting': 'Debug',
        'deployment-management': 'Deployments',
        'configuration-management': 'Config',
        'cluster-architecture': 'Architecture',
        'advanced-operations': 'Advanced'
    };
    
    // Check if we can shorten based on common patterns
    for (const [pattern, short] of Object.entries(shortenMap)) {
        if (shortLabel.toLowerCase().includes(pattern)) {
            return short;
        }
    }
    
    // If still too long, truncate intelligently
    if (shortLabel.length > 12) {
        return shortLabel.substring(0, 12) + '...';
    }
    
    return shortLabel;
}

// Render content area
function renderContent() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = currentItems.map(item => {
        return `
            <div class="item-content ${item.id === currentItem ? 'active' : ''}" data-item="${item.id}">
                <div class="item-header">
                    <h2>${item.title}</h2>
                </div>
                <div class="features-grid">
                    ${item.sections ? item.sections.map((section, index) => `
                        <div class="feature-card clickable" data-section-index="${index}">
                            <div class="feature-header">
                                <div class="feature-title">
                                    ${icons.check}
                                    <h3>${section.name}</h3>
                                </div>
                            </div>
                        </div>
                    `).join('') : ''}
                </div>
            </div>
        `;
    }).join('') + `
        <div class="item-content ${currentItem === 'all' ? 'active' : ''}" data-item="all">
            <div class="item-header">
                <h2>All Items — Complete Overview</h2>
            </div>
            <div class="all-items-container">
                ${generateAllItemsContent()}
            </div>
        </div>
    `;
}

// Render section content based on code/text attributes
function renderSectionContent(section) {
    let content = '';
    
    // Render text content if present
    if (section.text) {
        // Check if text contains markdown syntax
        const hasMarkdown = /[#*_`\[\]()]/.test(section.text) || section.text.includes('\n\n');
        
        if (hasMarkdown && typeof marked !== 'undefined') {
            // Render as markdown
            content += `
                <div class="markdown-block">
                    <div class="markdown-content">${marked.parse(section.text)}</div>
                </div>
            `;
        } else {
            // Render as plain text with line breaks
            content += `
                <div class="text-block">
                    <div class="text-content">${escapeHtml(section.text).replace(/\n/g, '<br>')}</div>
                </div>
            `;
        }
    }
    
    // Render code content if present
    if (section.code) {
        const language = detectLanguage(section.code);
        content += `
            <div class="code-block">
                <button class="copy-btn" title="Copy code">Copy</button>
                <pre><code class="language-${language}">${escapeHtml(section.code)}</code></pre>
            </div>
        `;
    }
    
    // If neither text nor code is present, show a message
    if (!section.text && !section.code) {
        content = `
            <div class="text-block">
                <div class="text-content">No content available for this section.</div>
            </div>
        `;
    }
    
    return content;
}

// Detect programming language from code content
function detectLanguage(code) {
    const codeStr = code.trim();
    
    // Java detection
    if (codeStr.includes('public class') || 
        codeStr.includes('import java.') || 
        codeStr.includes('@Override') ||
        codeStr.includes('interface ') ||
        codeStr.includes('implements ')) {
        return 'java';
    }
    
    // JavaScript detection
    if (codeStr.includes('function ') || 
        codeStr.includes('const ') || 
        codeStr.includes('let ') ||
        codeStr.includes('var ') ||
        codeStr.includes('console.log') ||
        codeStr.includes('=>')) {
        return 'javascript';
    }
    
    // Python detection
    if (codeStr.includes('def ') || 
        codeStr.includes('import ') || 
        codeStr.includes('from ') ||
        codeStr.includes('print(') ||
        codeStr.includes('if __name__')) {
        return 'python';
    }
    
    // HTML detection
    if (codeStr.includes('<html') || 
        codeStr.includes('<div') || 
        codeStr.includes('<span') ||
        codeStr.includes('<!DOCTYPE')) {
        return 'html';
    }
    
    // CSS detection
    if (codeStr.includes('{') && codeStr.includes('}') && 
        (codeStr.includes('color:') || codeStr.includes('margin:') || codeStr.includes('padding:'))) {
        return 'css';
    }
    
    // SQL detection
    if (codeStr.includes('SELECT ') || 
        codeStr.includes('INSERT ') || 
        codeStr.includes('UPDATE ') ||
        codeStr.includes('DELETE ') ||
        codeStr.includes('CREATE TABLE')) {
        return 'sql';
    }
    
    // JSON detection
    if (codeStr.includes('{') && codeStr.includes('}') && 
        (codeStr.includes('"') || codeStr.includes(':'))) {
        return 'json';
    }
    
    // XML detection
    if (codeStr.includes('<') && codeStr.includes('>') && 
        !codeStr.includes('<html') && !codeStr.includes('<div')) {
        return 'xml';
    }
    
    // Shell/Bash detection
    if (codeStr.includes('#!/bin/') || 
        codeStr.includes('$') || 
        codeStr.includes('sudo ') ||
        codeStr.includes('npm ') ||
        codeStr.includes('docker ')) {
        return 'bash';
    }
    
    // Docker detection
    if (codeStr.includes('FROM ') || 
        codeStr.includes('RUN ') || 
        codeStr.includes('COPY ') ||
        codeStr.includes('EXPOSE ')) {
        return 'dockerfile';
    }
    
    // YAML detection
    if (codeStr.includes('apiVersion:') || 
        codeStr.includes('kind:') || 
        codeStr.includes('metadata:') ||
        codeStr.includes('spec:')) {
        return 'yaml';
    }
    
    // Default to plain text if no language detected
    return 'text';
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize event listeners
function initializeEventListeners() {
// Tab switching functionality
const tabButtons = document.querySelectorAll('.tab-btn');
    const itemContents = document.querySelectorAll('.item-content');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
            const item = button.getAttribute('data-item');
            currentItem = item;
        
        // Remove active class from all tabs and contents
        tabButtons.forEach(btn => btn.classList.remove('active'));
            itemContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        button.classList.add('active');
            const targetContent = document.querySelector(`.item-content[data-item="${item}"]`);
        if (targetContent) {
            targetContent.classList.add('active');
        }
        
        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

    // Feature card modal functionality
    const featureCards = document.querySelectorAll('.feature-card.clickable');

featureCards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            const sectionIndex = card.getAttribute('data-section-index');
            const currentItemData = currentItems.find(v => v.id === currentItem);
            
            if (currentItemData && currentItemData.sections[sectionIndex]) {
                showFeatureModal(currentItemData.sections[sectionIndex], currentItemData.sections, parseInt(sectionIndex), true);
            }
        });
    });

    // Compact feature item modal functionality (for "All" page)
    const compactFeatureItems = document.querySelectorAll('.feature-item-compact.clickable');

    compactFeatureItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const itemId = item.getAttribute('data-item-id');
            const featureIndex = item.getAttribute('data-feature-index');
            const itemData = currentItems.find(v => v.id === itemId);
            
            if (itemData && itemData.sections && itemData.sections[featureIndex]) {
                showFeatureModal(itemData.sections[featureIndex], itemData.sections, parseInt(featureIndex), true);
            }
        });
    });

    // Copy code functionality (will be handled in modal)
}

// Show feature modal
function showFeatureModal(section, sections = null, currentIndex = 0, crossContent = false, isFullscreen = false) {
    // Create flattened structure of all sections across all content items
    const allSections = [];
    const sectionMap = new Map(); // Map to track section metadata
    
    currentItems.forEach(item => {
        if (item.sections) {
            item.sections.forEach((sec, secIndex) => {
                allSections.push(sec);
                sectionMap.set(sec.name, {
                    itemId: item.id,
                    itemTitle: item.title,
                    sectionIndex: secIndex,
                    itemSections: item.sections
                });
            });
        }
    });
    
    // Determine which sections to use for navigation
    let navigationSections;
    let navigationIndex;
    
    if (crossContent) {
        // Use all sections across all content
        navigationSections = allSections;
        navigationIndex = allSections.findIndex(s => s.name === section.name);
    } else {
        // Use sections from current context (existing behavior)
        if (!sections) {
            const currentItemData = currentItems.find(v => v.id === currentItem);
            if (currentItemData && currentItemData.sections) {
                sections = currentItemData.sections;
                currentIndex = sections.findIndex(s => s.name === section.name);
            }
        }
        navigationSections = sections || allSections;
        navigationIndex = currentIndex;
    }

    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = isFullscreen ? 'modal-overlay fullscreen' : 'modal-overlay';
    modalOverlay.innerHTML = `
        <div class="modal ${isFullscreen ? 'fullscreen' : ''}">
            <div class="modal-header">
                <div class="modal-title-section">
                    <h3>${section.name}</h3>
                    ${crossContent ? `<div class="modal-content-source">${sectionMap.get(section.name)?.itemTitle || ''}</div>` : ''}
                </div>
                <div class="modal-controls">
                    <button class="modal-fullscreen" title="${isFullscreen ? 'Exit Fullscreen' : 'Toggle Fullscreen'}">
                        <svg class="icon-fullscreen" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M3 3a1 1 0 000 2h1v10a1 1 0 102 0V5h10a1 1 0 100-2H3z"/>
                            <path d="M17 17a1 1 0 000-2h-1V5a1 1 0 10-2 0v10H4a1 1 0 100 2h13z"/>
                        </svg>
                    </button>
                    <button class="modal-close" title="Close">&times;</button>
                </div>
            </div>
            <div class="modal-content ${isFullscreen ? 'fullscreen' : ''}">
                ${renderSectionContent(section)}
            </div>
            ${navigationSections && navigationSections.length > 1 ? `
                <div class="modal-navigation">
                    <button class="nav-btn nav-prev" ${navigationIndex <= 0 ? 'disabled' : ''} title="Previous section">
                        <svg class="nav-icon" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/>
                        </svg>
                        Previous
                    </button>
                    <div class="nav-info">
                        <span class="nav-counter">${navigationIndex + 1} of ${navigationSections.length}</span>
                        ${crossContent ? `<span class="nav-mode">Cross-content</span>` : ''}
                    </div>
                    <button class="nav-btn nav-next" ${navigationIndex >= navigationSections.length - 1 ? 'disabled' : ''} title="Next section">
                        Next
                        <svg class="nav-icon" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                        </svg>
                    </button>
                </div>
            ` : ''}
        </div>
    `;

    // Add to body
    document.body.appendChild(modalOverlay);

    // Trigger Prism.js syntax highlighting
    if (typeof Prism !== 'undefined') {
        Prism.highlightAllUnder(modalOverlay);
    }

    // Add event listeners
    const closeBtn = modalOverlay.querySelector('.modal-close');
    const fullscreenBtn = modalOverlay.querySelector('.modal-fullscreen');
    const modal = modalOverlay.querySelector('.modal');
    const modalContent = modalOverlay.querySelector('.modal-content');

    // Navigation functionality
    let handleKeyDown = null;
    
    if (navigationSections && navigationSections.length > 1) {
        const prevBtn = modalOverlay.querySelector('.nav-prev');
        const nextBtn = modalOverlay.querySelector('.nav-next');
        const navCounter = modalOverlay.querySelector('.nav-counter');

        // Keyboard navigation
        handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft' && navigationIndex > 0) {
                const prevSection = navigationSections[navigationIndex - 1];
                cleanupModal();
                showFeatureModal(prevSection, navigationSections, navigationIndex - 1, crossContent, currentFullscreenState);
            } else if (e.key === 'ArrowRight' && navigationIndex < navigationSections.length - 1) {
                const nextSection = navigationSections[navigationIndex + 1];
                cleanupModal();
                showFeatureModal(nextSection, navigationSections, navigationIndex + 1, crossContent, currentFullscreenState);
            }
        };
        document.addEventListener('keydown', handleKeyDown);

        prevBtn.addEventListener('click', () => {
            if (navigationIndex > 0) {
                const prevSection = navigationSections[navigationIndex - 1];
                cleanupModal();
                showFeatureModal(prevSection, navigationSections, navigationIndex - 1, crossContent, currentFullscreenState);
            }
        });

        nextBtn.addEventListener('click', () => {
            if (navigationIndex < navigationSections.length - 1) {
                const nextSection = navigationSections[navigationIndex + 1];
                cleanupModal();
                showFeatureModal(nextSection, navigationSections, navigationIndex + 1, crossContent, currentFullscreenState);
            }
        });
    }

    // Fullscreen functionality
    let currentFullscreenState = isFullscreen;
    
    fullscreenBtn.addEventListener('click', () => {
        currentFullscreenState = !currentFullscreenState;
        
        if (currentFullscreenState) {
            modalOverlay.classList.add('fullscreen');
            modal.classList.add('fullscreen');
            modalContent.classList.add('fullscreen');
            
            // Update icon to exit fullscreen
            fullscreenBtn.innerHTML = `
                <svg class="icon-fullscreen" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 3a1 1 0 000 2h1v10a1 1 0 102 0V5h10a1 1 0 100-2H3z"/>
                    <path d="M17 17a1 1 0 000-2h-1V5a1 1 0 10-2 0v10H4a1 1 0 100 2h13z"/>
                </svg>
            `;
            fullscreenBtn.title = 'Exit Fullscreen';
        } else {
            modalOverlay.classList.remove('fullscreen');
            modal.classList.remove('fullscreen');
            modalContent.classList.remove('fullscreen');
            
            // Update icon to enter fullscreen
            fullscreenBtn.innerHTML = `
                <svg class="icon-fullscreen" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 3a1 1 0 000 2h1v10a1 1 0 102 0V5h10a1 1 0 100-2H3z"/>
                    <path d="M17 17a1 1 0 000-2h-1V5a1 1 0 10-2 0v10H4a1 1 0 100 2h13z"/>
                </svg>
            `;
            fullscreenBtn.title = 'Toggle Fullscreen';
        }
    });

    // Centralized cleanup function
    const cleanupModal = () => {
        // Remove keyboard listener if it exists
        if (handleKeyDown) {
            document.removeEventListener('keydown', handleKeyDown);
        }
        // Remove modal from DOM
        if (modalOverlay && modalOverlay.parentNode) {
            document.body.removeChild(modalOverlay);
        }
        // Restore body scroll
        document.body.style.overflow = '';
    };

    closeBtn.addEventListener('click', cleanupModal);

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            cleanupModal();
        }
    });

    // Handle copy buttons in modal
    const copyButtons = modalOverlay.querySelectorAll('.copy-btn');
copyButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
            e.stopPropagation();
        const codeBlock = button.nextElementSibling;
        const code = codeBlock.querySelector('code').textContent;
        
        try {
            await navigator.clipboard.writeText(code);
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            button.classList.add('copied');
            
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('copied');
            }, 2000);
        } catch (err) {
            console.error('Failed to copy code:', err);
            button.textContent = 'Failed';
            setTimeout(() => {
                button.textContent = 'Copy';
            }, 2000);
        }
    });
});

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Clean up on close
    const cleanup = () => {
        document.body.style.overflow = '';
    };
    
    closeBtn.addEventListener('click', cleanup);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            cleanup();
        }
    });
}


// Initialize syntax highlighting
function initializeSyntaxHighlighting() {
    if (typeof Prism !== 'undefined') {
        Prism.highlightAll();
        console.log('✅ Syntax highlighting initialized');
    } else {
        console.warn('⚠️ Prism.js not loaded - syntax highlighting unavailable');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    await loadContentConfig();
    initializeSyntaxHighlighting();
});