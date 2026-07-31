import os
import re

directory = r"c:\SIDDHANT\Project\spendsense\FrontEnd\src\components"

def replace_gray_bg(match):
    full_match = match.group(0)
    level = int(match.group(1)) if match.group(1) else 100
    
    # Map light theme bg to appropriate dark theme bg
    if level == 50:
        dark_class = "dark:bg-gray-900"
    elif level == 100:
        dark_class = "dark:bg-gray-800"
    elif level == 200:
        dark_class = "dark:bg-gray-700"
    else:
        return full_match # Should not happen based on regex

    return f"{full_match} {dark_class}"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find bg-gray-50, bg-gray-100, bg-gray-200 that is NOT followed by dark:bg-
    # \b matches word boundary
    pattern = r'\bbg-gray-(50|100|200)\b(?!\s*dark:bg)'
    
    new_content = re.sub(pattern, replace_gray_bg, content)
    
    # Also handle bg-white
    # bg-white should probably map to dark:bg-gray-900 if it doesn't have a dark bg already
    # Let's search for \bbg-white\b(?!\s*dark:bg)
    pattern_white = r'\bbg-white\b(?!\s*dark:bg)'
    # Be careful, sometimes text-white or similar can be matched if not careful, but \bbg-white\b is exact.
    # Actually bg-white can be left alone if it's explicitly for text. No, bg is background.
    # We will map bg-white to dark:bg-gray-800
    new_content = re.sub(pattern_white, r'bg-white dark:bg-gray-800', new_content)
    
    # Also handle hover:bg-gray-100
    pattern_hover = r'\bhover:bg-gray-100\b(?!\s*dark:hover:bg)'
    new_content = re.sub(pattern_hover, r'hover:bg-gray-100 dark:hover:bg-gray-700', new_content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed dark mode bg in: {filepath}")

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith(('.jsx', '.js')):
            process_file(os.path.join(root, file))

print("Dark mode bg fix complete!")
