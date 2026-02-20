import markdown
import pdfkit
import os
import sys

# Path setup
in_md = r"C:\Users\Vaibhav Chaudhary\.gemini\antigravity\brain\fc17b3e0-06e7-42f0-b26f-56735a57402f\comprehensive_system_manual.md"
out_pdf = r"d:\Projects\Vertex-Fusion\comprehensive_system_manual.pdf"

if not os.path.exists(in_md):
    print("Cannot find MD file!")
    sys.exit(1)

# Read MD
with open(in_md, 'r', encoding='utf-8') as f:
    text = f.read()

# Convert to HTML
html_body = markdown.markdown(text, extensions=['tables', 'fenced_code'])

# Wrap in basic HTML structure with styling
html = f"""
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
    body {{ font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }}
    h1, h2, h3 {{ color: #333; }}
    code {{ background-color: #f4f4f4; padding: 2px 4px; border-radius: 4px; font-family: Consolas, monospace; }}
    pre {{ background-color: #f4f4f4; padding: 15px; border-radius: 8px; overflow-x: auto; }}
    table {{ border-collapse: collapse; width: 100%; margin-bottom: 20px; }}
    th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
    th {{ background-color: #f2f2f2; font-weight: bold; }}
    .mermaid {{ display: none; }} /* wkhtmltopdf doesn't render JS mermaid natively without a proxy */
</style>
</head>
<body>
{html_body}
</body>
</html>
"""

try:
    path_wkhtmltopdf = r'C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe'
    config = pdfkit.configuration(wkhtmltopdf=path_wkhtmltopdf)
    pdfkit.from_string(html, out_pdf, configuration=config)
    print(f"Successfully generated PDF at {out_pdf}")
except Exception as e:
    # If wkhtmltopdf is missing, we use pandoc via subprocess as a fallback
    print(f"wkhtmltopdf failed: {str(e)}")
    print("Trying alternative method (node-based)...")
    
