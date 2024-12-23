import os
import pyperclip

# List of files to copy
files_to_copy = [
    "src/components/auth/Login.js",
    "src/components/auth/LoginModal.js",
    "src/lib/context/AuthContext.tsx",
    "src/lib/firebase/firebaseConfig.js",
    "src/lib/firebase/adminUtils.js",
    "src/lib/firebase/types.ts",
    "src/lib/services/roleService.js",
    "src/lib/services/notificationService.ts",
    "src/hooks/useRoles.ts",
    "src/hooks/useProtectedAction.ts",
    "firestore.rules"
]

# Base directory of your project
base_dir = "C:/Users/timveigel/Documents/fridmanfacts/crowdcheck"

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
