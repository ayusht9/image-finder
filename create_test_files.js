import fs from 'fs';
import { execSync } from 'child_process';

// Create a simple SVG and convert it to PNG using some base64
const imageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAAXNSR0IArs4c6QAAACVJREFUKFNjZCASMDKgCxioZwF1jOoa1TWC1XAAH+HwH4wMCGgA4RME+XhB5W0AAAAASUVORK5CYII=";
fs.writeFileSync('test.png', Buffer.from(imageBase64, 'base64'));

// Create a basic PDF file (minimal valid PDF)
const pdfBytes = Buffer.from(
  "%PDF-1.1\n%¥±ë\n1 0 obj\n<< /Type /Catalog\n/Outlines 2 0 R\n/Pages 3 0 R\n>>\nendobj\n2 0 obj\n<< /Type /Outlines\n/Count 0\n>>\nendobj\n3 0 obj\n<< /Type /Pages\n/Kids [4 0 R]\n/Count 1\n>>\nendobj\n4 0 obj\n<< /Type /Page\n/Parent 3 0 R\n/MediaBox [0 0 612 792]\n/Contents 5 0 R\n/Resources << /ProcSet 6 0 R\n/Font << /F1 7 0 R >>\n>>\n>>\nendobj\n5 0 obj\n<< /Length 73 >>\nstream\nBT\n/F1 24 Tf\n100 100 Td\n(Hello World) Tj\nET\nendstream\nendobj\n6 0 obj\n[/PDF /Text]\nendobj\n7 0 obj\n<< /Type /Font\n/Subtype /Type1\n/Name /F1\n/BaseFont /Helvetica\n/Encoding /MacRomanEncoding\n>>\nendobj\nxref\n0 8\n0000000000 65535 f \n0000000018 00000 n \n0000000077 00000 n \n0000000123 00000 n \n0000000180 00000 n \n0000000325 00000 n \n0000000448 00000 n \n0000000477 00000 n \ntrailer\n<< /Size 8\n/Root 1 0 R\n>>\nstartxref\n588\n%%EOF",
  "utf8"
);
fs.writeFileSync('test.pdf', pdfBytes);

console.log('Created test.png and test.pdf');
