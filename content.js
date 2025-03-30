/**
 * GitHub Clone with VS Code Extension
 * Adds an "Open with VS Code" button to GitHub repositories in the tab navigation
 */

(function() {
    'use strict';

    // VS Code icon SVG - colorful version
    const vscodeIconSvg = `
        <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16" width="16" height="16" display="inline-block" overflow="visible" style="vertical-align: text-bottom;">
            <path d="M14.491 3.622 8.04 0.06a0.375 0.375 0 0 0-0.419 0.022l-5.734 4.141a0.374 0.374 0 0 0-0.166 0.309v7.831c0 0.128 0.069 0.247 0.178 0.313l1.278 0.759a1.723 1.723 0 0 0 1.755 0.044c0.534-0.306 0.847-0.863 0.847-1.494V4.308c0-0.172-0.134-0.303-0.3-0.3a0.3 0.3 0 0 0-0.3 0.3v7.679c0 0.431-0.219 0.813-0.581 1.022a1.18 1.18 0 0 1-1.206-0.025l-1.05-0.625V4.8l6.209-4.494 5.866 3.234-5.537 4.331a0.3 0.3 0 0 0-0.028 0.45c0.125 0.125 0.328 0.125 0.45 0L14.478 4.2A0.374 0.374 0 0 0 14.65 3.9a0.375 0.375 0 0 0-0.159-0.278z" fill="#007ACC"/>
            <path d="M8.2 16c-0.194 0-0.375-0.056-0.531-0.159L2.084 12.62a0.784 0.784 0 0 1-0.391-0.675V4.053c0-0.272 0.144-0.525 0.384-0.666l5.675-3.303a0.784 0.784 0 0 1 0.888 0.047l6.587 4.866a0.784 0.784 0 0 1 0.009 1.281L8.775 15.812A0.784 0.784 0 0 1 8.2 16zM8.2 1.09c-0.035 0-0.069 0.009-0.1 0.028L2.425 4.422a0.186 0.186 0 0 0-0.091 0.159v7.891c0 0.066 0.034 0.125 0.094 0.159l5.584 3.222a0.186 0.186 0 0 0 0.284-0.159V4.052c0-0.066-0.034-0.125-0.094-0.159L8.3 1.117a0.186 0.186 0 0 0-0.1-0.028z" fill="#007ACC"/>
        </svg>
    `;

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
                    
                    // Make sure the icon sits next to the text nicely
                    const styleTag = document.createElement('style');
                    styleTag.textContent = `
                        .vscode-tab-button svg {
                            vertical-align: middle;
                            margin-right: 4px;
                        }
                        .vscode-tab-button[aria-selected="true"] {
                            border-bottom-color: #007ACC !important;
                            color: #007ACC !important;
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
