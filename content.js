/**
 * GitHub Clone with VS Code Extension
 * Adds an "Open with VS Code" button to GitHub repositories in the tab navigation
 */

(function() {
    'use strict';

    // VS Code icon from Codeberg
    const vscodeIconSvg = `<svg viewBox="-1 -1 34 34" aria-hidden="true" width="16" height="16" style="vertical-align: middle; margin-right: 4px;">
        <path d="M30.9 3.4 24.3.3a2 2 0 0 0-2.3.4L9.4 12.2 3.9 8c-.5-.4-1.2-.4-1.7 0L.4 9.8c-.5.5-.5 1.4 0 2L5.2 16 .4 20.3c-.5.6-.5 1.5 0 2L2.2 24c.5.5 1.2.5 1.7 0l5.5-4L22 31.2a2 2 0 0 0 2.3.4l6.6-3.2a2 2 0 0 0 1.1-1.8V5.2a2 2 0 0 0-1.1-1.8M24 23.3 14.4 16 24 8.7z" fill="#007ACC"></path>
    </svg>`;

    // Continuously check for the tab navigation to appear
    function waitForCodeDropdown() {
        const observer = new MutationObserver((mutations, observer) => {
            checkAndAddTabButton();
        });
        
        // Observe DOM changes to catch when the elements appear
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Also check immediately in case it's already there
        checkAndAddTabButton();
        
        // Periodically check for the elements as a fallback
        setInterval(() => {
            checkAndAddTabButton();
        }, 1000);
        
        // Add click listener to the Code button
        document.addEventListener('click', (event) => {
            // Wait a short time to let the dropdown render
            setTimeout(() => {
                checkAndAddTabButton();
            }, 100);
        });
    }

    // The dropdown button functionality has been removed as requested

    // Helper function to get the repository URL
    function getRepositoryUrl() {
        // Try to get URL from the clone button data - multiple selector attempts for different GitHub UI versions
        
        // First try the new GitHub UI selectors
        const clipboardElement = document.querySelector('input[data-autoselect="true"][value], input#clone-with-gh-cli[value]');
        if (clipboardElement && clipboardElement.value) {
            const clipValue = clipboardElement.value;
            // If it's a gh CLI command, extract the repo URL
            if (clipValue.startsWith('gh repo clone ')) {
                const repoPath = clipValue.replace('gh repo clone ', '');
                return `https://github.com/${repoPath}.git`;
            }
            return clipValue;
        }
        
        // Try old UI selectors
        const urlElement = document.querySelector('clipboard-copy[value], input[name="cli-clone-url"]');
        if (urlElement && urlElement.value) {
            return urlElement.value;
        }
        
        // Fallback: construct from location
        const match = window.location.pathname.match(/\/([^\/]+)\/([^\/]+)/);
        if (match) {
            const [, owner, repo] = match;
            return `https://github.com/${owner}/${repo}.git`;
        }
        
        return null;
    }

    // Add button to the tab navigation (HTTPS/SSH/GitHub CLI row)
    function checkAndAddTabButton() {
        // Look for the tab navigation - try multiple selectors for different GitHub UI versions
        const possibleTabNavs = [
            document.querySelector('div[role="tablist"]'),
            document.querySelector('.TabNav__TabNavTabList-sc-pwdi4r-1'),
            document.querySelector('nav.TabNav'),
            document.querySelector('nav[aria-label="Remote URL selector"]')
        ].filter(Boolean);
        
        // Process each possible tab navigation area
        for (const tabNav of possibleTabNavs) {
            if (tabNav && !document.querySelector('.vscode-tab-button')) {
                console.log('GitHub Clone with VS Code: Found tab navigation', tabNav);
                
                // Get repository URL
                const repoUrl = getRepositoryUrl();
                if (!repoUrl) {
                    console.log('GitHub Clone with VS Code: Could not find repository URL for tab button');
                    continue;
                }
                
                // Create VS Code clone URL
                const vsCodeUrl = `vscode://vscode.git/clone?url=${encodeURIComponent(repoUrl)}`;
                
                // Find the GitHub CLI button or SSH button to get its styling and position
                const tabButtons = Array.from(tabNav.querySelectorAll('button, a, li'));
                const referenceButton = tabButtons.find(el => 
                    el.textContent.trim().includes('GitHub CLI') ||
                    el.textContent.trim().includes('SSH'));
                
                if (referenceButton) {
                    console.log('GitHub Clone with VS Code: Found reference button', referenceButton);
                    
                    // Determine if we're working with the new GitHub UI
                    const isNewUI = referenceButton.className.includes('prc-') || 
                                   tabNav.className.includes('prc-');
                    
                    // Create a button of the same type as the reference button
                    const vsCodeTabButton = document.createElement(referenceButton.tagName);
                    
                    if (referenceButton.tagName.toLowerCase() === 'button') {
                        vsCodeTabButton.type = 'button';
                        vsCodeTabButton.role = 'tab';
                        vsCodeTabButton.setAttribute('aria-selected', 'false');
                        vsCodeTabButton.setAttribute('tabindex', '-1');
                    } else if (referenceButton.tagName.toLowerCase() === 'a') {
                        vsCodeTabButton.href = '#';
                        vsCodeTabButton.setAttribute('role', 'tab');
                        vsCodeTabButton.setAttribute('aria-selected', 'false');
                    } else if (referenceButton.tagName.toLowerCase() === 'li') {
                        // For list item, we'll need to create an anchor inside
                        const anchor = document.createElement('a');
                        anchor.href = '#';
                        anchor.className = Array.from(referenceButton.querySelector('a')?.classList || []).join(' ');
                        vsCodeTabButton.appendChild(anchor);
                    }
                    
                    // Apply common classes but add our own identifier
                    vsCodeTabButton.className = referenceButton.className + ' vscode-tab-button';
                    
                    // Apply VS Code styling - make it stand out with the VS Code blue
                    vsCodeTabButton.style.color = '#007ACC';
                    
                    // Get the right structure based on the UI version
                    if (isNewUI) {
                        // Structure for new GitHub UI
                        if (referenceButton.tagName.toLowerCase() === 'li') {
                            // If it's a list item, modify the anchor inside
                            vsCodeTabButton.querySelector('a').innerHTML = `
                                <span data-component="text" data-content="VS Code">
                                    ${vscodeIconSvg} VS Code
                                </span>
                            `;
                        } else {
                            // For button or direct anchor
                            vsCodeTabButton.innerHTML = `
                                <span data-component="buttonContent" data-align="center" class="prc-Button-ButtonContent-HKbr-">
                                    ${vscodeIconSvg}
                                    <span data-component="text" class="prc-Button-Label-pTQ3x">VS Code</span>
                                </span>
                            `;
                        }
                    } else {
                        // Simpler fallback structure for older GitHub UI
                        if (referenceButton.tagName.toLowerCase() === 'li') {
                            vsCodeTabButton.querySelector('a').innerHTML = `${vscodeIconSvg} VS Code`;
                        } else {
                            vsCodeTabButton.innerHTML = `${vscodeIconSvg} VS Code`;
                        }
                    }
                    
                    // Add styling including wireframe border
                    const styleTag = document.createElement('style');
                    styleTag.textContent = `
                        .vscode-tab-button {
                            border: 1px solid #007ACC !important;
                            border-radius: 10px !important;
                            margin: 0 2px !important;
                            padding: 4px 8px !important;
                        }
                        .vscode-tab-button[aria-selected="true"] {
                            border-bottom-color: #007ACC !important;
                            color: #007ACC !important;
                            background-color: rgba(0, 122, 204, 0.1) !important;
                        }
                    `;
                    document.head.appendChild(styleTag);
                    
                    // Insert after the reference button
                    referenceButton.parentNode.insertBefore(vsCodeTabButton, referenceButton.nextSibling);
                    
                    // Add click handler to open VS Code
                    const clickHandler = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Set this button as selected visually
                        tabButtons.forEach(btn => {
                            btn.setAttribute('aria-selected', 'false');
                            if (btn.classList.contains('selected')) {
                                btn.classList.remove('selected');
                            }
                        });
                        
                        vsCodeTabButton.setAttribute('aria-selected', 'true');
                        if (!vsCodeTabButton.classList.contains('selected')) {
                            vsCodeTabButton.classList.add('selected');
                        }
                        
                        // Open VS Code after a small delay to allow visual feedback
                        setTimeout(() => {
                            window.location.href = vsCodeUrl;
                        }, 100);
                    };
                    
                    if (referenceButton.tagName.toLowerCase() === 'li') {
                        vsCodeTabButton.querySelector('a').addEventListener('click', clickHandler);
                    } else {
                        vsCodeTabButton.addEventListener('click', clickHandler);
                    }
                    
                    console.log('GitHub Clone with VS Code: Added tab button', vsCodeTabButton);
                }
            }
        }
    }

    // Start observing for tab navigation
    waitForCodeDropdown();
    
    // Also add listener for navigation changes (for GitHub's SPA behavior)
    window.addEventListener('popstate', () => {
        setTimeout(() => {
            checkAndAddTabButton();
        }, 500);
    });
    
    // For navigation within GitHub that doesn't trigger popstate
    const pushState = history.pushState;
    history.pushState = function() {
        pushState.apply(history, arguments);
        setTimeout(() => {
            checkAndAddTabButton();
        }, 500);
    };
})();
