import os
import pyperclip

# List of files to copy
files_to_copy = [
    # Components
    "components/auth/LoginModal.js",        # Likely handles user authentication modals.
    "components/common/Modal.js",           # A generic modal component to be used for the popup.
    "components/profile/ProfileHeader.js",  # May display the username after it's set.
    "components/profile/UserProfile.js",    # Likely manages user profile-related information.

    # Context
    "lib/context/AuthContext.tsx",          # Likely handles user authentication state.
    "lib/context/LoginModalContext.tsx",    # Context managing login modal, possibly reusable for this modal.

    # Utilities
    "lib/utils/userUtils.js",               # Utilities related to user management and username generation.
    "lib/utils/constants.js",               # Might define reusable constants like default username format or lengths.

    # Services
    "lib/services/userService.js",          # (If it exists, for API calls related to user registration or updates.)

    # Pages
    "app/layout.js",                        # Might require layout modifications to include the modal.
    "app/page.js",                          # Entry point for your app, where the modal might get triggered on first login.
]

# Base directory of your project
base_dir = "C:/Users/timveigel/Documents/fridmanfacts/crowdcheck/src"

# Initialize clipboard content
clipboard_content = ""

for relative_path in files_to_copy:
    file_path = os.path.join(base_dir, relative_path)
    
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as file:
            file_content = file.read()
            
            # Add file name and content to clipboard content
            clipboard_content += f"\n--- {relative_path} ---\n"
            clipboard_content += file_content
            clipboard_content += "\n--- EOF ---\n"
    else:
        clipboard_content += f"\n--- {relative_path} ---\nFile not found.\n--- EOF ---\n"

# Copy all content to clipboard
pyperclip.copy(clipboard_content)

print("All specified files have been copied to the clipboard.")
