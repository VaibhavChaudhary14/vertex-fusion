import markdown
from bs4 import BeautifulSoup
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor

def generate_pdf(md_path, pdf_path):
    with open(md_path, 'r', encoding='utf-8') as f:
        md_text = f.read()
    
    html = markdown.markdown(md_text, extensions=['tables', 'fenced_code'])
    soup = BeautifulSoup(html, 'html.parser')
    
    doc = SimpleDocTemplate(pdf_path, pagesize=letter,
                            rightMargin=72, leftMargin=72,
                            topMargin=72, bottomMargin=18)
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    styles.add(ParagraphStyle(name='CustomTitle', parent=styles['Heading1'], fontSize=16, spaceAfter=20, textColor=HexColor('#222222')))
    styles.add(ParagraphStyle(name='CustomH2', parent=styles['Heading2'], fontSize=14, spaceBefore=15, spaceAfter=10, textColor=HexColor('#333333')))
    styles.add(ParagraphStyle(name='CustomH3', parent=styles['Heading3'], fontSize=12, spaceBefore=10, spaceAfter=5, textColor=HexColor('#444444')))
    styles.add(ParagraphStyle(name='CustomBody', parent=styles['Normal'], fontSize=10, leading=14, spaceAfter=8))
    styles.add(ParagraphStyle(name='CodeStyle', parent=styles['Normal'], fontName='Courier', fontSize=9, textColor=HexColor('#D32F2F'), backColor=HexColor('#F5F5F5'), spaceBefore=5, spaceAfter=5, leftIndent=10))
    styles.add(ParagraphStyle(name='ListItem', parent=styles['Normal'], fontSize=10, leading=14, leftIndent=20, spaceAfter=4))
    
    story = []
    
    for element in soup.find_all(['h1', 'h2', 'h3', 'p', 'ul', 'ol', 'pre', 'table']):
        if element.name == 'h1':
            story.append(Paragraph(element.get_text(), styles['CustomTitle']))
        elif element.name == 'h2':
            story.append(Paragraph(element.get_text(), styles['CustomH2']))
        elif element.name == 'h3':
            story.append(Paragraph(element.get_text(), styles['CustomH3']))
        elif element.name == 'p':
            # Handle inline code within paragraphs manually if needed, or just let ReportLab parse <b>/<i>
            text = str(element).replace('<p>', '').replace('</p>', '')
            # Replace code tags with font tags for reportlab
            text = text.replace('<code>', '<font name="Courier" color="#D32F2F">').replace('</code>', '</font>')
            story.append(Paragraph(text, styles['CustomBody']))
        elif element.name in ['ul', 'ol']:
            for li in element.find_all('li'):
                text = str(li).replace('<li>', '&bull; ').replace('</li>', '')
                text = text.replace('<code>', '<font name="Courier" color="#D32F2F">').replace('</code>', '</font>')
                story.append(Paragraph(text, styles['ListItem']))
        elif element.name == 'pre':
            code_text = element.get_text()
            # Split code block into lines
            code_lines = code_text.split('\n')
            code_paragraphs = [Paragraph(line.replace(' ', '&nbsp;'), styles['CodeStyle']) for line in code_lines if line.strip()]
            story.append(KeepTogether(code_paragraphs))
        elif element.name == 'table':
            # Very basic table extraction into text for reportlab fallback
            story.append(Paragraph("<b>[Table Data]</b>", styles['CustomBody']))
            for row in element.find_all('tr'):
                cols = row.find_all(['th', 'td'])
                row_text = " | ".join([c.get_text() for c in cols])
                story.append(Paragraph(row_text, styles['CustomBody']))
        
        story.append(Spacer(1, 5))
        
    doc.build(story)
    print(f"Successfully wrote {pdf_path}")

md_path = r"C:\Users\Vaibhav Chaudhary\.gemini\antigravity\brain\fc17b3e0-06e7-42f0-b26f-56735a57402f\comprehensive_system_manual.md"
pdf_path = r"d:\Projects\Vertex-Fusion\Comprehensive_System_Manual.pdf"

if __name__ == "__main__":
    generate_pdf(md_path, pdf_path)
