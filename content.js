/**
 * GitHub Clone with VS Code Extension
 * Adds an "Open with VS Code" button to GitHub repositories
 */

(function() {
    'use strict';

    // VS Code icon SVG (simplified version of VS Code icon)
    const vscodeIconSvg = `
        <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" display="inline-block" overflow="visible" style="vertical-align: text-bottom;">
            <path d="M3.75 1.5a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5H3.75zm6.75.062V4.25c0 .138.112.25.25.25h2.688l-.011-.013-2.914-2.914-.013-.011z"></path><path d="M2.75 1A1.75 1.75 0 0 0 1 2.75v10.5c0 .966.784 1.75 1.75 1.75h10.5A1.75 1.75 0 0 0 15 13.25V6.75A1.75 1.75 0 0 0 14 5.264V3.5L10.5 0H4.75C3.784 0 3 .784 3 1.75V4h1.5V1.75a.25.25 0 0 1 .25-.25H9v2.75c0 .966.784 1.75 1.75 1.75h2.75v7.25a.25.25 0 0 1-.25.25h-9.5a.25.25 0 0 1-.25-.25V2.75a.25.25 0 0 1 .25-.25H2.75zM7.979 13a.5.5 0 0 1-.5-.5V12h-1a.5.5 0 0 1 0-1h1v-.5a.5.5 0 0 1 1 0v.5h1a.5.5 0 0 1 0 1h-1v.5a.5.5 0 0 1-.5.5z"></path>
        </svg>
    `;

    // Continuously check for the Code dropdown button to appear
    function waitForCodeDropdown() {
        const observer = new MutationObserver((mutations, observer) => {
            checkAndAddButton();
        });
        
        // Observe DOM changes to catch when the dropdown appears
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Also check immediately in case it's already there
        checkAndAddButton();
        
        // Periodically check for the dropdown menu as a fallback
        setInterval(checkAndAddButton, 1000);
        
        // Add click listener to the Code button
        document.addEventListener('click', (event) => {
            // Wait a short time to let the dropdown render
            setTimeout(checkAndAddButton, 100);
        });
    }

    // Check for the dropdown and add our button if found
    function checkAndAddButton() {
        // Look for the dropdown content when it's open - GitHub's new UI uses a different structure
        
        // Try several possible selectors to handle different GitHub UI versions
        const possibleDropdowns = [
            // New GitHub UI (React-based, exact match from screenshot)
            document.querySelector('div.react-overview-code-button-action-list ul.prc-ActionList-ActionList-X4RiC'),
            // Alternative selectors from the new UI
            document.querySelector('.prc-ActionList-ActionList-X4RiC.border-top'),
            document.querySelector('ul[role="list"].prc-ActionList-ActionList-X4RiC'),
            document.querySelector('div.react-overview-code-button-action-list ul'),
            // More robust approach instead of :has/:contains selectors which aren't widely supported
            ...(function() {
                const allLinks = document.querySelectorAll('a');
                for (const link of allLinks) {
                    if (link.textContent.trim().includes('Download ZIP')) {
                        return [link.closest('li')?.parentNode].filter(Boolean);
                    }
                }
                return [];
            })(),
            // Older GitHub UI
            document.querySelector('ul.dropdown-menu'),
            document.querySelector('.SelectMenu-list')
        ].filter(Boolean); // Remove null values
        
        for (const dropdownContent of possibleDropdowns) {
            // Check if our button already exists to avoid duplicates
            if (dropdownContent && !dropdownContent.querySelector('.vscode-clone-button')) {
                addVSCodeButton(dropdownContent);
                console.log('GitHub Clone with VS Code: Added button to', dropdownContent);
            }
        }
        
        // Try direct approach if the above selectors don't work
        const allLists = document.querySelectorAll('ul');
        for (const list of allLists) {
            // Check if this list contains "Download ZIP"
            const hasDownloadZip = Array.from(list.querySelectorAll('a, span')).some(el => 
                el.textContent.trim().includes('Download ZIP'));
                
            if (hasDownloadZip && !list.querySelector('.vscode-clone-button')) {
                addVSCodeButton(list);
                console.log('GitHub Clone with VS Code: Added button via fallback approach', list);
            }
        }
    }

    // Create and add the VS Code button to the dropdown
    function addVSCodeButton(dropdownContent) {
        // Get repository URL
        const repoUrl = getRepositoryUrl();
        if (!repoUrl) {
            console.log('GitHub Clone with VS Code: Could not find repository URL');
            return;
        }
        
        console.log('GitHub Clone with VS Code: Found repo URL', repoUrl);
        
        // Create VS Code clone URL
        const vsCodeUrl = `vscode://vscode.git/clone?url=${encodeURIComponent(repoUrl)}`;
        
        // Find where to insert our button (after the "Download ZIP" option)
        // Try multiple selectors to account for different GitHub UI versions
        const downloadZipItem = Array.from(dropdownContent.querySelectorAll('a, li, button')).find(el => 
            el.textContent.trim().includes('Download ZIP'));
        
        if (downloadZipItem) {
            console.log('GitHub Clone with VS Code: Found Download ZIP item', downloadZipItem);
            
            // Determine if we're working with the new GitHub UI (ActionList) or the old UI
            const isNewUI = dropdownContent.classList.contains('prc-ActionList-ActionList-X4RiC') || 
                          downloadZipItem.classList.contains('prc-ActionList-ActionListItem-uq6I7') ||
                          downloadZipItem.querySelector('.prc-ActionList-ItemLabel-TmBhn');
            
            if (isNewUI) {
                // For new GitHub UI
                // Create a new list item similar to the Download ZIP item
                const listItem = document.createElement('li');
                listItem.className = 'prc-ActionList-ActionListItem-uq6I7 vscode-clone-button';
                
                // Create the anchor element
                const vsCodeButton = document.createElement('a');
                vsCodeButton.href = vsCodeUrl;
                vsCodeButton.className = 'prc-ActionList-ActionListContent-sg9-x prc-Link-Link-85e08';
                vsCodeButton.setAttribute('tabindex', '0');
                
                // Generate a unique ID
                const uniqueId = ':r' + Math.floor(Math.random() * 1000) + ':';
                vsCodeButton.setAttribute('aria-labelledby', `${uniqueId}--label`);
                vsCodeButton.id = uniqueId;
                
                // Create the content structure similar to other buttons
                vsCodeButton.innerHTML = `
                    <span class="prc-ActionList-Spacer-dydlX"></span>
                    <span class="prc-ActionList-LeadingVisual-dxXxW prc-ActionList-VisualWrap-rfjV-">
                        ${vscodeIconSvg}
                    </span>
                    <span class="prc-ActionList-ActionListSubContent-lP9xj">
                        <span id="${uniqueId}--label" class="prc-ActionList-ItemLabel-TmBhn">Open with VS Code</span>
                    </span>
                `;
                
                listItem.appendChild(vsCodeButton);
                
                // Insert after the Download ZIP option
                downloadZipItem.parentNode.insertBefore(listItem, downloadZipItem.nextSibling);
            } else {
                // For old GitHub UI
                // Create new button element
                const vsCodeButton = document.createElement('a');
                vsCodeButton.href = vsCodeUrl;
                vsCodeButton.className = downloadZipItem.className + ' vscode-clone-button';
                vsCodeButton.setAttribute('role', 'menuitem');
                vsCodeButton.innerHTML = `${vscodeIconSvg} Open with VS Code`;
                
                // Style it to match GitHub's design
                vsCodeButton.style.display = 'flex';
                vsCodeButton.style.alignItems = 'center';
                vsCodeButton.style.gap = '8px';
                
                // Insert after the Download ZIP option
                downloadZipItem.parentNode.insertBefore(vsCodeButton, downloadZipItem.nextSibling);
            }
        }
    }

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

    // Start observing for the dropdown
    waitForCodeDropdown();
    
    // Also add listener for navigation changes (for GitHub's SPA behavior)
    window.addEventListener('popstate', () => {
        setTimeout(checkAndAddButton, 500);
    });
    
    // For navigation within GitHub that doesn't trigger popstate
    const pushState = history.pushState;
    history.pushState = function() {
        pushState.apply(history, arguments);
        setTimeout(checkAndAddButton, 500);
    };
})();
