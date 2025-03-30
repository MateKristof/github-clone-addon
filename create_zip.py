#!/usr/bin/env python3
"""
Chrome Extension ZIP Creator
Creates a ZIP archive with required files for the GitHub Clone with VS Code extension.
"""

import os
import zipfile
import sys
import platform

def create_extension_zip():
    """Create a ZIP file containing all required extension files"""
    # ZIP file name
    zip_name = "github-clone-addon.zip"
    
    # Delete if already exists
    if os.path.exists(zip_name):
        os.remove(zip_name)
        print(f"Deleted existing {zip_name}")
    
    # Files and folders to include
    files_to_zip = ["content.js", "manifest.json", "README.md"]
    folders_to_zip = ["assets", "icons"]
    
    # Create new ZIP file
    with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Add individual files
        for file in files_to_zip:
            if os.path.exists(file):
                zipf.write(file)
                print(f"Added {file}")
            else:
                print(f"WARNING: {file} not found")
        
        # Add folders recursively
        for folder in folders_to_zip:
            if os.path.exists(folder) and os.path.isdir(folder):
                for root, dirs, files in os.walk(folder):
                    for file in files:
                        file_path = os.path.join(root, file)
                        # Preserve folder structure in ZIP
                        zipf.write(file_path)
                        print(f"Added {file_path}")
            else:
                print(f"WARNING: {folder} directory not found")
    
    # Verification
    if os.path.exists(zip_name):
        print(f"\nZIP creation complete: {zip_name}")
        print(f"Size: {os.path.getsize(zip_name) / 1024:.2f} KB")
        print(f"System: {platform.system()} {platform.release()}")

if __name__ == "__main__":
    create_extension_zip()
