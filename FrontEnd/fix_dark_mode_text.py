import os
import re

directory = r"c:\SIDDHANT\Project\spendsense\FrontEnd\src\components"

def replace_gray_text(match):
    full_match = match.group(0)
    level = int(match.group(1))
    
    # Map light theme gray text to appropriate dark theme white/light gray
    if level == 5:
        dark_class = "dark:text-gray-300"
    elif level == 6:
        dark_class = "dark:text-gray-200"
    elif level == 7:
        dark_class = "dark:text-gray-100"
    elif level >= 8:
        dark_class = "dark:text-white"
    else:
        return full_match # Should not happen based on regex

    return f"{full_match} {dark_class}"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find text-gray-[5-9]00 that is NOT followed by dark:text-
    # Also ensure it's not part of a larger word (e.g. text-gray-500/50)
    # \b matches word boundary
    pattern = r'\btext-gray-([5-9])00\b(?!\s*dark:text)'
    
    new_content = re.sub(pattern, replace_gray_text, content)
    
    # Let's also do a pass for bg-gray-[5-9]00 and bg-white if they lack dark mode backgrounds
    # Wait, the user specifically mentioned "texts are grey because of which they are not clear"
    # So I will just focus on text.
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed dark mode text in: {filepath}")

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith(('.jsx', '.js')):
            process_file(os.path.join(root, file))

print("Dark mode text fix complete!")
