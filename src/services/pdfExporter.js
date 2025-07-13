import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import markdownParser from './markdownParser';

class PDFExporter {
  constructor() {
    this.pageMargin = 20;
    this.lineHeight = 1.5;
  }

  async exportFile(content, filename) {
    try {
      const html = markdownParser.parse(content);
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      tempDiv.style.cssText = `
        width: 794px;
        padding: 40px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 12px;
        line-height: 1.6;
        color: #333;
        background: white;
        position: absolute;
        top: -9999px;
        left: -9999px;
      `;
      
      tempDiv.querySelectorAll('pre').forEach(pre => {
        pre.style.cssText += `
          background: #f6f8fa;
          padding: 16px;
          border-radius: 6px;
          margin: 16px 0;
          font-size: 11px;
          overflow-wrap: break-word;
        `;
      });

      tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
        heading.style.cssText += `
          margin-top: 24px;
          margin-bottom: 12px;
          font-weight: bold;
        `;
      });

      tempDiv.querySelectorAll('h1').forEach(h1 => {
        h1.style.fontSize = '20px';
      });

      tempDiv.querySelectorAll('h2').forEach(h2 => {
        h2.style.fontSize = '18px';
      });

      tempDiv.querySelectorAll('h3').forEach(h3 => {
        h3.style.fontSize = '16px';
      });

      tempDiv.querySelectorAll('p').forEach(p => {
        p.style.marginBottom = '12px';
      });

      document.body.appendChild(tempDiv);

      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      document.body.removeChild(tempDiv);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210 - (this.pageMargin * 2);
      const pageHeight = 297 - (this.pageMargin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = this.pageMargin;

      pdf.addImage(imgData, 'PNG', this.pageMargin, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + this.pageMargin;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', this.pageMargin, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const pdfFilename = filename.replace(/\.md$/, '.pdf');
      pdf.save(pdfFilename);
      
      return true;
    } catch (error) {
      console.error('PDF export error:', error);
      throw new Error(`Failed to export PDF: ${error.message}`);
    }
  }

  async exportDirectory(files, dirname) {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      let isFirstPage = true;

      const tableOfContents = this.generateTableOfContents(files);
      
      pdf.setFontSize(20);
      pdf.text('Table of Contents', this.pageMargin, 30);
      
      let yPosition = 50;
      pdf.setFontSize(12);
      
      tableOfContents.forEach((item, index) => {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 30;
        }
        
        const indent = item.level * 5;
        pdf.text(`${item.title}`, this.pageMargin + indent, yPosition);
        pdf.text(`${index + 2}`, 180, yPosition);
        yPosition += 8;
      });

      for (const file of files) {
        if (!isFirstPage) {
          pdf.addPage();
        } else {
          pdf.addPage();
        }
        isFirstPage = false;

        const content = await this.readFileContent(file);
        await this.addContentToPDF(pdf, content, file.name);
      }

      const pdfFilename = `${dirname}-export.pdf`;
      pdf.save(pdfFilename);
      
      return true;
    } catch (error) {
      console.error('Directory PDF export error:', error);
      throw new Error(`Failed to export directory PDF: ${error.message}`);
    }
  }

  generateTableOfContents(files) {
    return files.map(file => ({
      title: file.name.replace(/\.md$/, ''),
      level: 1
    }));
  }

  async readFileContent(file) {
    if (file.handle && file.handle.getFile) {
      const fileObj = await file.handle.getFile();
      return await fileObj.text();
    }
    return '';
  }

  async addContentToPDF(pdf, content, filename) {
    pdf.setFontSize(16);
    pdf.text(filename.replace(/\.md$/, ''), this.pageMargin, 30);
    
    const html = markdownParser.parse(content);
    const lines = this.convertHtmlToLines(html);
    
    let yPosition = 50;
    pdf.setFontSize(11);
    
    lines.forEach(line => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 30;
      }
      
      const wrappedLines = pdf.splitTextToSize(line, 170);
      wrappedLines.forEach(wrappedLine => {
        pdf.text(wrappedLine, this.pageMargin, yPosition);
        yPosition += 6;
      });
      yPosition += 2;
    });
  }

  convertHtmlToLines(html) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    const lines = [];
    const walker = document.createTreeWalker(
      tempDiv,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    while (node = walker.nextNode()) {
      const text = node.textContent.trim();
      if (text) {
        lines.push(text);
      }
    }

    return lines;
  }
}

export default new PDFExporter();