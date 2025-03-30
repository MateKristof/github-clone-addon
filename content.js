/**
 * GitHub Clone with VS Code Extension
 * Adds an "Open with VS Code" button to GitHub repositories
 */

(function() {
    'use strict';

    // VS Code icon SVG (simplified version of VS Code icon)
    const vscodeIconSvg = `
        <svg width="16" height="16" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M70.9 5.1L30.1 35.5 12.2 23.2 0 29.7v40.6l12.1 6.5 17.9-12.1 41 30.1 28.9-12.1V17.2L70.9 5.1zm-17.9 50l-23.3 17.9V27.1l23.3 17.9v10.1z" 
                  fill="currentColor"/>
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
    }

    // Check for the dropdown and add our button if found
    function checkAndAddButton() {
        // Look for the dropdown content when it's open
        const dropdownContent = document.querySelector('get-repo details[open] .dropdown-menu');
        
        if (dropdownContent) {
            // Check if our button already exists to avoid duplicates
            if (!dropdownContent.querySelector('.vscode-clone-button')) {
                addVSCodeButton(dropdownContent);
            }
        }
    }

    // Create and add the VS Code button to the dropdown
    function addVSCodeButton(dropdownContent) {
        // Get repository URL
        const repoUrl = getRepositoryUrl();
        if (!repoUrl) return;
        
        // Create VS Code clone URL
        const vsCodeUrl = `vscode://vscode.git/clone?url=${encodeURIComponent(repoUrl)}`;
        
        // Find where to insert our button (after the "Download ZIP" option)
        const downloadZipItem = Array.from(dropdownContent.querySelectorAll('a')).find(a => 
            a.textContent.trim().includes('Download ZIP'));
        
        if (downloadZipItem) {
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

    // Helper function to get the repository URL
    function getRepositoryUrl() {
        // Try to get URL from the clone button data
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
