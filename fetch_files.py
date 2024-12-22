#!/usr/bin/env python3
import os
import pyperclip

# List of files you want to fetch
files_to_fetch = [
    # Core Karma Files
    "src/lib/services/karmaService.ts",
    "src/hooks/useKarma.ts",
    "src/lib/utils/karmaConstants.js",

    # Voting-Related Files
    "src/lib/services/voteService.ts",
    "src/lib/utils/votingUtils.js",
    "src/components/fact-checks/core/FactCheckVoting.js",
    "src/components/comments/CommentVoting.js",

    # Type Definitions
    "src/lib/types/core-types.ts",
    "src/lib/types/types.ts",

    # UI Components
    "src/components/karma/KarmaDisplay.js",
    "src/components/karma/KarmaAchievements.js",
    "src/components/karma/KarmaHistory.js",
    "src/components/common/Navbar.js",
]

def main():
    all_content = []

    # Root of your project (adjust if necessary)
    project_root = "."

    for relative_path in files_to_fetch:
        full_path = os.path.join(project_root, relative_path)
        
        if not os.path.exists(full_path):
            # You may want to log or raise an error if the file doesn't exist
            print(f"[WARNING] File not found: {full_path}")
            continue
        
        # Read the file content
        with open(full_path, "r", encoding="utf-8") as f:
            file_content = f.read()
        
        # Add a header for clarity
        header = f"\n{'='*80}\nFile: {relative_path}\n{'='*80}\n"
        all_content.append(header + file_content)
    
    # Join everything into one big string
    final_output = "\n".join(all_content)

    # Copy to clipboard
    pyperclip.copy(final_output)
    print("All requested files have been copied to your clipboard.")

if __name__ == "__main__":
    main()
