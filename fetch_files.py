import os
import pyperclip

# List of files to copy
files_to_copy = [
    "src/lib/types/types.ts",
    "src/lib/services/factCheckService.ts",
    "src/lib/services/karmaService.ts",
    "src/hooks/useModeration.ts",
    "src/lib/types/validation.ts",
    "src/lib/utils/constants.js"
]


# Base directory of your project
base_dir = "C:/Users/timveigel/Documents/fridmanfacts/crowdcheck/"

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
