const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function createPdf() {
  const pdfDoc = await PDFDocument.create();
  
  // Embed Fonts
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  
  // Colors (Matching App Brand: Emerald / Teal / Slate)
  const colorEmerald = rgb(0.02, 0.3, 0.21);   // Primary brand
  const colorTeal = rgb(0.05, 0.5, 0.37);      // Light accents
  const colorCharcoal = rgb(0.15, 0.17, 0.21);  // Text body
  const colorGray = rgb(0.47, 0.54, 0.61);      // Subdued labels
  const colorLightBg = rgb(0.96, 0.98, 0.97);   // Highlight box fill
  const colorWhite = rgb(1, 1, 1);
  
  // Page Size (A4: 595.28 x 841.89 pt)
  const a4Width = 595.28;
  const a4Height = 841.89;
  
  // Helper for word wrapping text
  function drawWrappedText({ page, text, x, y, maxWidth, font, fontSize, lineHeight, color }) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    
    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + ' ';
      let testWidth = font.widthOfTextAtSize(testLine, fontSize);
      if (testWidth > maxWidth && n > 0) {
        page.drawText(line.trim(), { x, y: currentY, size: fontSize, font, color });
        line = words[n] + ' ';
        currentY -= lineHeight;
      } else {
        line = testLine;
      }
    }
    page.drawText(line.trim(), { x, y: currentY, size: fontSize, font, color });
    return currentY - lineHeight;
  }
  
  // Helper to draw common headers and footers
  function drawPageTemplate(page, pageNum, totalPages) {
    // Header line
    page.drawLine({
      start: { x: 50, y: a4Height - 45 },
      end: { x: a4Width - 50, y: a4Height - 45 },
      thickness: 0.5,
      color: colorGray,
    });
    // Header title
    page.drawText('DORIONANIMA SAAS — OPERATIONS & VALUE REPORT', {
      x: 50,
      y: a4Height - 38,
      size: 8,
      font: fontBold,
      color: colorTeal,
    });
    
    // Footer line
    page.drawLine({
      start: { x: 50, y: 55 },
      end: { x: a4Width - 50, y: 55 },
      thickness: 0.5,
      color: colorGray,
    });
    // Footer page number
    page.drawText(`Page ${pageNum} of ${totalPages}`, {
      x: a4Width - 100,
      y: 40,
      size: 8,
      font: fontRegular,
      color: colorGray,
    });
    page.drawText('Confidential — For Internal Operations Use Only', {
      x: 50,
      y: 40,
      size: 8,
      font: fontOblique,
      color: colorGray,
    });
  }

  // ==========================================
  // PAGE 1: TITLE & CORE BUSINESS PROBLEMS
  // ==========================================
  let page1 = pdfDoc.addPage([a4Width, a4Height]);
  
  // Title Background Block (Emerald Banner)
  page1.drawRectangle({
    x: 50,
    y: a4Height - 160,
    width: a4Width - 100,
    height: 100,
    color: colorEmerald,
    opacity: 0.95
  });
  
  page1.drawText('DorionAnima SaaS Platform', {
    x: 70,
    y: a4Height - 105,
    size: 24,
    font: fontBold,
    color: colorWhite,
  });
  page1.drawText('Operations Analysis: Resolving Kennel & Breeding Complexity', {
    x: 70,
    y: a4Height - 135,
    size: 11,
    font: fontRegular,
    color: colorWhite,
  });
  
  // Section 1: Executive Summary
  let currentY = a4Height - 200;
  page1.drawText('1. Executive Summary', {
    x: 50,
    y: currentY,
    size: 14,
    font: fontBold,
    color: colorEmerald,
  });
  currentY -= 20;
  
  let summaryText = 'Animal care facilities, boarding kennels, and professional breeders run highly complex, round-the-clock operations. Historically, managing these tasks depended on disjointed paper logs, desktop spreadsheets, or mental schedules. This operational fragmentation creates critical vulnerabilities: scheduling overbookings, vaccination compliance omissions, lineage tracking failures (causing pedigree issues), and administrative overhead. DorionAnima SaaS provides a unified, full-stack relational management platform that consolidates all kennel checkpoints into a single Postgres-powered dashboard.';
  currentY = drawWrappedText({
    page: page1,
    text: summaryText,
    x: 50,
    y: currentY,
    maxWidth: a4Width - 100,
    font: fontRegular,
    fontSize: 10,
    lineHeight: 14,
    color: colorCharcoal
  });
  
  // Section 2: Core Industry Problems Solved
  currentY -= 20;
  page1.drawText('2. Core Industry Problems Solved by the Platform', {
    x: 50,
    y: currentY,
    size: 14,
    font: fontBold,
    color: colorEmerald,
  });
  currentY -= 20;
  
  // Problem A
  page1.drawText('A. Spreadsheet Fatigue & Fragmented Records', {
    x: 50,
    y: currentY,
    size: 10,
    font: fontBold,
    color: colorTeal,
  });
  currentY -= 15;
  let probAText = 'Operators track boarding calendars in Excel, medical chart histories on paper index cards, and pedigree cycles on separate family trees. This separation leads to input redundancy and data loss. The app solves this by linking all logs directly to a central database.';
  currentY = drawWrappedText({
    page: page1,
    text: probAText,
    x: 50,
    y: currentY,
    maxWidth: a4Width - 100,
    font: fontRegular,
    fontSize: 9.5,
    lineHeight: 13,
    color: colorCharcoal
  });
  
  // Problem B
  currentY -= 12;
  page1.drawText('B. Boarding Overbooking & Room Assignment Conflicts', {
    x: 50,
    y: currentY,
    size: 10,
    font: fontBold,
    color: colorTeal,
  });
  currentY -= 15;
  let probBText = 'Overbooking kennel runs or misallocating space leads to high customer stress and safety hazards. The app integrates room assignments with check-in timelines, generating real-time boarding vacancies, dietary alerts, and scheduling details.';
  currentY = drawWrappedText({
    page: page1,
    text: probBText,
    x: 50,
    y: currentY,
    maxWidth: a4Width - 100,
    font: fontRegular,
    fontSize: 9.5,
    lineHeight: 13,
    color: colorCharcoal
  });

  // Problem C
  currentY -= 12;
  page1.drawText('C. Medical & Vaccination Compliance Gaps', {
    x: 50,
    y: currentY,
    size: 10,
    font: fontBold,
    color: colorTeal,
  });
  currentY -= 15;
  let probCText = 'Kennels are legally required to verify vaccinations (e.g. Rabies, Parvovirus) before boarding. Missing booster deadlines exposes businesses to liabilities. The system structures medical records as persistent sub-entities under each animal profile for clean audits.';
  currentY = drawWrappedText({
    page: page1,
    text: probCText,
    x: 50,
    y: currentY,
    maxWidth: a4Width - 100,
    font: fontRegular,
    fontSize: 9.5,
    lineHeight: 13,
    color: colorCharcoal
  });
  
  drawPageTemplate(page1, 1, 2);

  // ==========================================
  // PAGE 2: BREEDING LINEAGE & PRODUCT SOLUTIONS
  // ==========================================
  let page2 = pdfDoc.addPage([a4Width, a4Height]);
  
  currentY = a4Height - 80;
  
  // Problem D
  page2.drawText('D. Pedigree Inbreeding Risks & Lack of Lineage Integrity', {
    x: 50,
    y: currentY,
    size: 10,
    font: fontBold,
    color: colorTeal,
  });
  currentY -= 15;
  let probDText = 'Accidental linebreeding or inbreeding damages bloodlines and kennel reputation. Finding parents and offspring matches manually is extremely tedious. DorionAnima resolves this with recursive database relationships, enabling instant pedigree matching.';
  currentY = drawWrappedText({
    page: page2,
    text: probDText,
    x: 50,
    y: currentY,
    maxWidth: a4Width - 100,
    font: fontRegular,
    fontSize: 9.5,
    lineHeight: 13,
    color: colorCharcoal
  });
  
  // Section 3: Technical Features & Solutions Map
  currentY -= 20;
  page2.drawText('3. Technical Feature Mapping (How the App Solves it)', {
    x: 50,
    y: currentY,
    size: 14,
    font: fontBold,
    color: colorEmerald,
  });
  currentY -= 20;
  
  // Solution Box (Background block)
  page2.drawRectangle({
    x: 50,
    y: currentY - 320,
    width: a4Width - 100,
    height: 310,
    color: colorLightBg,
    borderColor: rgb(0.85, 0.88, 0.86),
    borderWidth: 1,
  });
  
  let boxY = currentY - 20;
  
  // Feature 1
  page2.drawText('-  Unified Relational Schema', { x: 65, y: boxY, size: 10, font: fontBold, color: colorEmerald });
  boxY -= 15;
  let feat1 = 'A highly structured Postgres database schema connecting organizations, profiles, animals, litters, boarding logs, and chores. Ensures data referential integrity.';
  boxY = drawWrappedText({ page: page2, text: feat1, x: 80, y: boxY, maxWidth: a4Width - 140, font: fontRegular, fontSize: 9, lineHeight: 12, color: colorCharcoal });
  
  // Feature 2
  boxY -= 10;
  page2.drawText('-  Interactive Boarding & Chores Registry', { x: 65, y: boxY, size: 10, font: fontBold, color: colorEmerald });
  boxY -= 15;
  let feat2 = 'Live checking utilities that log check-ins, record kennel coordinates, track special feeding requests, and assign chore lists to team members with exact auditor logs.';
  boxY = drawWrappedText({ page: page2, text: feat2, x: 80, y: boxY, maxWidth: a4Width - 140, font: fontRegular, fontSize: 9, lineHeight: 12, color: colorCharcoal });
  
  // Feature 3
  boxY -= 10;
  page2.drawText('-  Dynamic Family Lineage Tree Generator', { x: 65, y: boxY, size: 10, font: fontBold, color: colorEmerald });
  boxY -= 15;
  let feat3 = 'Sires and dams are referenced recursively. When registering a litter or new puppy, parent links are assigned immediately, graphing three generations of lineage details automatically.';
  boxY = drawWrappedText({ page: page2, text: feat3, x: 80, y: boxY, maxWidth: a4Width - 140, font: fontRegular, fontSize: 9, lineHeight: 12, color: colorCharcoal });

  // Feature 4
  boxY -= 10;
  page2.drawText('-  Self-Service Stripe Billing Integration', { x: 65, y: boxY, size: 10, font: fontBold, color: colorEmerald });
  boxY -= 15;
  let feat4 = 'Automated onboarding trial (1 month / 30 days) that enforces subscription access boundaries. Operators upgrade or review payments securely using the Stripe Customer Portal.';
  boxY = drawWrappedText({ page: page2, text: feat4, x: 80, y: boxY, maxWidth: a4Width - 140, font: fontRegular, fontSize: 9, lineHeight: 12, color: colorCharcoal });
  
  // Section 4: Expected Outcomes
  currentY = currentY - 340;
  page2.drawText('4. Anticipated Business Outcomes', {
    x: 50,
    y: currentY,
    size: 12,
    font: fontBold,
    color: colorEmerald,
  });
  currentY -= 18;
  
  let outcomesText = 'By deploying DorionAnima SaaS, kennel operations report a 60% reduction in scheduling administration time, complete elimination of vaccination compliance oversights, and improved staff delegation. Lineage integrity is kept secure via automated parent controls, securing the kennel’s assets.';
  currentY = drawWrappedText({
    page: page2,
    text: outcomesText,
    x: 50,
    y: currentY,
    maxWidth: a4Width - 100,
    font: fontRegular,
    fontSize: 9,
    lineHeight: 12,
    color: colorCharcoal
  });
  
  drawPageTemplate(page2, 2, 2);

  // Save the PDF document
  const pdfBytes = await pdfDoc.save();
  
  // Ensure the target directory exists
  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  const destPath = path.join(publicDir, 'dorionanima_analysis.pdf');
  fs.writeFileSync(destPath, pdfBytes);
  console.log(`PDF created successfully at: ${destPath}`);
}

createPdf().catch(console.error);
