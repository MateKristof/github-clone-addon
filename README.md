# GitHub Clone with VS Code

Open GitHub repositories directly in Visual Studio Code with a single click. This extension adds a sleek, blue VS Code button to GitHub's repository interface.

![](https://github.com/MateKristof/github-clone-addon/blob/main/assets/screenshot.png?raw=true)

## Features

- **Elegant integration**: Adds a blue VS Code button to GitHub's tab navigation (alongside HTTPS/SSH/GitHub CLI)
- **One-click workflow**: Clone and open repositories in VS Code without manual copying of URLs
- **Visual design**: Official VS Code icon with a distinctive blue wireframe border
- **Seamless experience**: Works with GitHub's modern UI across different repository pages

## Installation

### From Chrome Web Store (Recommended)

1. Visit the [GitHub Clone with VS Code](https://chrome.google.com/webstore/detail/github-clone-with-vs-code) page in the Chrome Web Store
2. Click "Add to Chrome"
3. Confirm the installation when prompted

### Manual Installation (Developer Mode)

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top right)
4. Click "Load unpacked" and select the extension directory
5. The extension is now installed and active

## Usage

1. Navigate to any GitHub repository
2. Look for the VS Code button in the tab navigation area (next to HTTPS/SSH/GitHub CLI)
3. Click the VS Code button to clone and open the repository in VS Code

## How it Works

This extension uses the `vscode://` URL protocol to communicate with Visual Studio Code. When you click the VS Code button, it instructs VS Code to clone the current repository and open it in a new window.

## Requirements

- Google Chrome browser (or any Chromium-based browser like Edge, Brave, etc.)
- Visual Studio Code installed on your system
- VS Code must be configured to handle the `vscode://` protocol (this is typically set up by default during installation)

## Privacy & Permissions

This extension:
- Only runs on GitHub repository pages
- Does not collect any personal data
- Does not modify repository contents
- Only adds UI elements to enhance your workflow

## License

MIT
