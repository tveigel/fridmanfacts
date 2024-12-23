#!/usr/bin/env python3
# scripts/generate_test_prompt.py

import os
import re
import sys
import yaml
from pathlib import Path
import pyperclip

# Optional: If you want to copy output to clipboard automatically, uncomment these lines:
# try:
#     import pyperclip
#     COPY_TO_CLIPBOARD = True
# except ImportError:
#     COPY_TO_CLIPBOARD = False

##############################################################################
# 1) Load config from directory_map.yml
##############################################################################

CONFIG_PATH = Path(__file__).parent.parent / "directory_map.yml"
if not CONFIG_PATH.exists():
    print(f"ERROR: Could not find config file at {CONFIG_PATH}")
    sys.exit(1)

with open(CONFIG_PATH, "r", encoding="utf-8") as cfg_file:
    config = yaml.safe_load(cfg_file)

SOURCE_ROOT = config.get("sourceRoot", "src")
TEST_ROOT = config.get("testRoot", "test")
INCLUDE_EXTENSIONS = config.get("includeExtensions", [".js", ".ts", ".jsx", ".tsx"])

##############################################################################
# 2) Regex to find import statements
##############################################################################

# This pattern tries to capture file-based imports, e.g.:
# import X from '../someFile'
# import { Y } from '@/components/XYZ'
# require('somePath');
# It's naïve and may need refinement for more complex patterns.
IMPORT_PATTERN = re.compile(
    r"(?:import\s+(?:[\w*\s{},]+)\s+from\s+['\"]([^'\"]+)['\"]|require\(['\"]([^'\"]+)['\"]\))"
)

def is_local_file_import(path_str: str) -> bool:
    """
    Check if the import path is a relative or project-based local file path,
    e.g. './', '../', or '@/'
    as opposed to a library import like 'react', 'lodash', etc.
    """
    if path_str.startswith("./") or path_str.startswith("../"):
        return True
    if path_str.startswith("@/"):
        return True
    return False


##############################################################################
# 3) Utility: Resolve import path to an actual file
##############################################################################

def resolve_import_path(base_file: Path, import_str: str) -> Path:
    """
    Attempt to resolve the import string (e.g. '../utils/whatever') to a real
    file path on disk. We handle extension fallback like .js or .ts if not specified.
    We also handle '@/...' which maps to SOURCE_ROOT in Next.js style.
    """
    # If import_str starts with '@/', treat everything after that as relative to SOURCE_ROOT
    if import_str.startswith("@/"):
        relative_path = import_str.replace("@/", "")
        resolved_path = Path(SOURCE_ROOT, relative_path)
    else:
        # Otherwise, treat it as relative to the current file's directory
        resolved_path = (base_file.parent / import_str).resolve()

    # If the path already has a recognized extension, just return as-is
    if resolved_path.suffix in INCLUDE_EXTENSIONS and resolved_path.exists():
        return resolved_path

    # If no extension was provided, or the file doesn't exist yet, try appending typical extensions
    if resolved_path.is_dir():
        # if it's a directory, maybe there's an index file
        for ext in INCLUDE_EXTENSIONS:
            index_candidate = resolved_path / f"index{ext}"
            if index_candidate.exists():
                return index_candidate
    else:
        # If it's a file but no extension, or missing extension
        base_no_ext = str(resolved_path)
        for ext in INCLUDE_EXTENSIONS:
            candidate = Path(base_no_ext + ext)
            if candidate.exists():
                return candidate

    return resolved_path  # fallback, might not exist


##############################################################################
# 4) Recursively gather all relevant files
##############################################################################

def gather_related_files(start_file: Path, visited=None):
    """
    Recursively gather all files that are imported (directly or indirectly)
    by 'start_file'.
    """
    if visited is None:
        visited = set()

    # Normalize path
    start_file = start_file.resolve()

    # If start_file not valid or not in our source
    if not start_file.exists() or not any(str(start_file).endswith(ext) for ext in INCLUDE_EXTENSIONS):
        return []

    if start_file in visited:
        return []

    visited.add(start_file)

    # Read the file lines
    try:
        content = start_file.read_text(encoding="utf-8")
    except Exception as e:
        print(f"Error reading {start_file}: {e}")
        return []

    # Find imports
    matches = IMPORT_PATTERN.findall(content)
    # matches is a list of tuples [(import1, require1), (import2, require2), ...]
    # Only one of those in each tuple will be non-empty
    imported_paths = [m[0] if m[0] else m[1] for m in matches]

    all_files = [start_file]
    for imp in imported_paths:
        # Skip external libraries
        if not is_local_file_import(imp):
            continue

        resolved = resolve_import_path(start_file, imp)
        related = gather_related_files(resolved, visited)
        all_files.extend(related)

    return all_files


##############################################################################
# 5) Build final prompt: load prompt template, embed code
##############################################################################

def build_prompt(file_list):
    """
    1. Read prompt_template.md
    2. For each file in file_list, append a heading plus the file content
    """
    # Where is prompt_template.md? 
    # We assume it’s in the project root next to directory_map.yml
    # or you can place it anywhere you like:
    PROMPT_TEMPLATE_PATH = Path(__file__).parent.parent / "prompt_template.md"

    if not PROMPT_TEMPLATE_PATH.exists():
        print(f"ERROR: Could not find {PROMPT_TEMPLATE_PATH}")
        sys.exit(1)

    with open(PROMPT_TEMPLATE_PATH, "r", encoding="utf-8") as tmpl:
        prompt_template = tmpl.read()

    # Sort by filename to keep it tidy
    sorted_files = sorted(file_list, key=lambda p: str(p))

    # Build the final prompt
    final_prompt = [prompt_template]
    final_prompt.append("\n\n")  # spacing
    for file_path in sorted_files:
        rel_path_str = str(file_path.relative_to(Path.cwd()))
        # Read content
        try:
            code_content = file_path.read_text(encoding="utf-8")
        except:
            code_content = "ERROR: Could not read file content."

        # Append code block
        final_prompt.append(f"### File: {rel_path_str}\n")
        final_prompt.append("```javascript\n")  # or just triple backticks if you want generic
        final_prompt.append(code_content)
        final_prompt.append("\n```\n\n")

    return "".join(final_prompt)


##############################################################################
# 6) Main entry point
##############################################################################

def main():
    if len(sys.argv) < 2:
        print("Usage: python generate_test_prompt.py <relative_path_to_source_file>")
        sys.exit(1)

    target_relative = sys.argv[1]

    # Make sure we interpret the path relative to project root
    target_file = Path.cwd() / target_relative

    if not target_file.exists():
        print(f"ERROR: The target file '{target_file}' does not exist.")
        sys.exit(1)

    # Gather related files
    all_files = gather_related_files(target_file)

    # Build the prompt
    prompt_text = build_prompt(all_files)

    # Print to console
    print("=== GENERATED TEST PROMPT ===")
    print(prompt_text)

    # Optionally copy to clipboard

    pyperclip.copy(prompt_text)
    print("[INFO] Prompt copied to clipboard!")

if __name__ == "__main__":
    main()
