import os
import sys
import subprocess
import pyperclip

# Check if the user wants to include test files
include_tests = "--include-tests" in sys.argv

overview = """Fact-Check Platform Overview
Purpose
A web platform that allows users to collaboratively fact-check podcast/video transcripts. Users can highlight and annotate specific parts of transcripts, provide sources, and vote on fact checks. The platform aims to create a community-driven verification system for long-form content.

Tech Stack

Frontend Framework: Next.js 14 with React
Styling: Tailwind CSS with custom components
Authentication: Firebase Auth (Google Sign-in)
Database: Firebase Firestore
UI Components: Custom components based on shadcn/ui
Icons: Lucide React
Fonts: Geist Sans/Mono (self-hosted)

Core Features

Transcript Display: Episodes are displayed with synchronized transcripts and timestamps
Fact Checking System:

Users can enter "Fact Check Mode" to highlight text
Selected text can be annotated with sources and context
Fact checks have statuses (UNVALIDATED, VALIDATED_TRUE, VALIDATED_FALSE, VALIDATED_CONTROVERSIAL)
Community voting system on fact checks


Real-time Updates: Changes and votes are reflected immediately with optimistic UI updates

Data Structure

Episodes Collection:

Metadata (title, guest, date)
Transcript (timestamped entries)
Timestamps/chapters


FactChecks Collection:

Referenced text and timestamp
Source URLs and context
Validation status
Vote counts
Subcollection for individual votes



Key Components

Transcript.js: Main component handling text display and selection
FactCheck.js: Individual fact check display with voting
FactCheckSubmission.js: Form for submitting new fact checks
SelectionPopup.js: UI for initiating fact checks
AuthContext.js: Firebase authentication wrapper

Current Implementation Details

Two-column layout: Transcript (left) and Fact Checks (right)
Overlapping fact checks are handled via dropdown menus
Error boundary implementation for graceful error handling
Responsive design with mobile considerations
Rate limiting and auth checks on submissions

Environment Setup Required

Firebase project with Auth and Firestore enabled
Environment variables for Firebase configuration
Node.js 18+ recommended
Required next.js configuration for app router

Known Considerations

Fact checks are episode-specific
Users must be logged in to submit/vote
Rate limiting should be implemented on the Firebase side
Consider implementing moderation features for fact check validation.

I'm using Next.js with app router, and my project has a standard src-level organization.

I provided you with the most relevant files of the current implementation. Here is my file structure from the src dir:
"""

# Get directory structure using `tree` command
result = subprocess.run("cmd.exe /c tree /F src", stdout=subprocess.PIPE, text=True, shell=True)
directory_structure = result.stdout

file_contents = "\n\n*All file implementations in the directory*\n\n"

def is_text_file(filename):
    excluded_extensions = (".woff", ".ico", ".png", ".jpg", ".jpeg", ".gif")
    return not filename.lower().endswith(excluded_extensions)

for root, dirs, files in os.walk("src"):
    # If not including tests, remove any __tests__ directories from traversal
    if not include_tests:
        dirs[:] = [d for d in dirs if d != "__tests__"]

        # and skip __mocks__ directories
        dirs[:] = [d for d in dirs if d != "__mocks__"]

    for file in files:
        filepath = os.path.join(root, file)
        if is_text_file(file):
            try:
                with open(filepath, "r", encoding="utf-8", errors="replace") as f:
                    content = f.read()
                file_contents += f"\n---\nFile: {filepath}\n---\n{content}\n"
            except Exception as e:
                file_contents += f"\n---\nFile: {filepath}\n---\n[Error reading file: {e}]\n"
        else:
            file_contents += f"\n---\nFile: {filepath}\n---\n[Skipped binary or non-text file]\n"

full_prompt = overview + "\n" + directory_structure + file_contents
pyperclip.copy(full_prompt)
print("Full prompt has been copied to the clipboard.")
