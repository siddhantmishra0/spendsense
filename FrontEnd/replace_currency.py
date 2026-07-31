import os
import re

directory = r"c:\SIDDHANT\Project\spendsense\FrontEnd\src"

def replace_currency_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace $ with ₹ ONLY if $ is not followed by { (to protect ${...} template literals)
    # Also, ensure we aren't messing up any other valid uses, but in this frontend it's safe.
    new_content = re.sub(r'\$(?!\{)', '₹', content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated: {filepath}")

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith(('.jsx', '.js')):
            replace_currency_in_file(os.path.join(root, file))

print("Currency replacement complete!")
