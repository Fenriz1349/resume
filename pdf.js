// Generates a real, text-based one-page PDF of the resume and downloads it directly -
// no browser print dialog involved (so no OS/browser print header with page title,
// URL and timestamp, and identical behavior on Windows and Mac).
//
// It reads content straight from the current DOM (already translated by script.js),
// so the PDF always matches whatever language is displayed and there is nothing to
// keep in sync manually. Text is drawn with jsPDF's text API (real, selectable text),
// not rendered as an image - a library like html2pdf.js would be simpler to write but
// rasterizes the whole page into a picture, which recruitment software (ATS) that scans
// CVs as text cannot read. That trade-off isn't acceptable for a resume.
//
// The decorative bits (skill cards, date badges, accent borders, section markers) are
// redrawn by hand with jsPDF's shape API to match style.css, since jsPDF only draws
// text/shapes - it cannot reuse the page's CSS.

function generateResumePdf() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const pageWidth = 210;
  const marginX = 12;
  const contentWidth = pageWidth - marginX * 2;
  const primaryColor = [27, 73, 101]; // --color-primary
  const mutedColor = [91, 98, 112]; // --color-muted
  const textColor = [31, 36, 48]; // --color-text
  const ruleColor = [221, 225, 231]; // --color-rule
  const accentColor = [63, 124, 166]; // --color-accent
  const accentLightColor = [231, 240, 246]; // --color-accent-light

  let cursorY = 14;

  function setTextColor(rgb) {
    doc.setTextColor(rgb[0], rgb[1], rgb[2]);
  }

  function setDrawColor(rgb) {
    doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
  }

  function setFillColor(rgb) {
    doc.setFillColor(rgb[0], rgb[1], rgb[2]);
  }

  // Wraps `text` to `maxWidth` under the given font, without drawing anything -
  // used to measure how tall a block will be before drawing a card/border behind it.
  function measureLines(text, maxWidth, fontSize, bold) {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(fontSize);
    return doc.splitTextToSize(text, maxWidth);
  }

  // Writes word-wrapped text starting at (x, y) and returns the y position right
  // after the last line, so the caller can keep stacking content below it.
  function writeParagraph(text, x, y, maxWidth, options) {
    const {
      fontSize = 8,
      lineHeight = 3.4,
      bold = false,
      italic = false,
      color = textColor
    } = options || {};

    doc.setFont("helvetica", bold ? "bold" : italic ? "italic" : "normal");
    doc.setFontSize(fontSize);
    setTextColor(color);

    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + lines.length * lineHeight;
  }

  // Section title with a small colored square marker, matching .section h2::before.
  function writeSectionHeading(text, x, y, width) {
    const markerSize = 1.6;
    setFillColor(accentColor);
    doc.rect(x, y - markerSize - 0.2, markerSize, markerSize, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    setTextColor(primaryColor);
    doc.text(text.toUpperCase(), x + markerSize + 1.8, y);

    setDrawColor(ruleColor);
    doc.setLineWidth(0.2);
    doc.line(x, y + 1.6, x + width, y + 1.6);

    return y + 6;
  }

  // Rounded pill badge behind a date range, matching .dates.
  function writeDateBadge(text, rightEdgeX, y) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.3);
    const textWidth = doc.getTextWidth(text);
    const paddingX = 1.8;
    const badgeWidth = textWidth + paddingX * 2;
    const badgeHeight = 3.8;
    const badgeX = rightEdgeX - badgeWidth;
    const badgeY = y - badgeHeight + 1;

    setFillColor(accentLightColor);
    doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 1, 1, "F");
    setTextColor(primaryColor);
    doc.text(text, badgeX + paddingX, badgeY + badgeHeight - 1.2);
  }

  // --- Header: name, title, contact line, location ---
  const name = document.querySelector(".header-main h1").textContent;
  const title = document.querySelector(".title").textContent;
  const contactItems = Array.from(document.querySelectorAll(".contact li")).map(
    (item) => item.textContent.trim()
  );
  const location = document.querySelector(".location").textContent;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  setTextColor(primaryColor);
  doc.text(name, marginX, cursorY);
  cursorY += 6.5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  setTextColor(accentColor);
  doc.text(title.toUpperCase(), marginX, cursorY);
  cursorY += 5.5;

  cursorY = writeParagraph(contactItems.join("   •   "), marginX, cursorY, contentWidth, {
    fontSize: 8,
    color: mutedColor
  });
  cursorY = writeParagraph(location, marginX, cursorY, contentWidth, {
    fontSize: 8,
    color: mutedColor
  });
  cursorY += 2;

  // Gradient accent bar under the header (approximated with 3 solid segments,
  // jsPDF has no native linear-gradient fill).
  const gradientSteps = [primaryColor, accentColor, accentLightColor];
  const segmentWidth = contentWidth / gradientSteps.length;
  gradientSteps.forEach((color, index) => {
    setFillColor(color);
    doc.rect(marginX + segmentWidth * index, cursorY, segmentWidth + 0.5, 1.2, "F");
  });
  cursorY += 6;

  // --- Pitch: one paragraph per sentence, same as on screen ---
  document.querySelectorAll(".pitch p").forEach((paragraph) => {
    cursorY = writeParagraph(paragraph.textContent, marginX, cursorY, contentWidth, {
      fontSize: 8.3,
      lineHeight: 3.6
    });
    cursorY += 0.8;
  });
  cursorY += 3;

  // --- Two columns: sidebar (skills/languages/interests) + main content ---
  const columnsTop = cursorY;
  const sidebarWidth = 55;
  const gap = 8;
  const sidebarX = marginX;
  const mainX = marginX + sidebarWidth + gap;
  const mainWidth = contentWidth - sidebarWidth - gap;
  const entryIndent = 3.2; // matches .entry's padding-left, text sits to the right of the border
  const labelLineHeight = 3.1;
  const valueLineHeight = 3;

  let sidebarY = columnsTop;
  document.querySelectorAll(".sidebar > .section").forEach((section) => {
    const heading = section.querySelector("h2").textContent;
    sidebarY = writeSectionHeading(heading, sidebarX, sidebarY, sidebarWidth);

    const skillGroups = section.querySelectorAll(".skill-group");
    const plainListItems = section.querySelectorAll(".plain-list li");
    const freeParagraph = section.querySelector(":scope > p");

    // Skill categories drawn as small bordered cards, matching .skill-group.
    skillGroups.forEach((group) => {
      const label = group.querySelector("h3").textContent;
      const value = group.querySelector("p").textContent;
      const paddingX = 2.2;
      const paddingY = 1.8;
      const innerWidth = sidebarWidth - paddingX * 2;

      const labelLines = measureLines(label, innerWidth, 7.8, true);
      const valueLines = measureLines(value, innerWidth, 7.3, false);
      const cardHeight =
        paddingY * 2 + labelLines.length * labelLineHeight + valueLines.length * valueLineHeight + 0.5;

      setDrawColor(ruleColor);
      doc.setLineWidth(0.15);
      doc.roundedRect(sidebarX, sidebarY - 2.8, sidebarWidth, cardHeight, 1, 1, "S");

      let cardY = sidebarY + paddingY - 1.2;
      cardY = writeParagraph(label, sidebarX + paddingX, cardY, innerWidth, {
        fontSize: 7.8,
        bold: true,
        color: primaryColor,
        lineHeight: labelLineHeight
      });
      writeParagraph(value, sidebarX + paddingX, cardY, innerWidth, {
        fontSize: 7.3,
        color: mutedColor,
        lineHeight: valueLineHeight
      });

      sidebarY += cardHeight + 2.2;
    });

    plainListItems.forEach((item) => {
      sidebarY = writeParagraph("• " + item.textContent, sidebarX, sidebarY, sidebarWidth, {
        fontSize: 7.5,
        color: mutedColor
      });
    });

    if (freeParagraph) {
      sidebarY = writeParagraph(freeParagraph.textContent, sidebarX, sidebarY, sidebarWidth, {
        fontSize: 7.5,
        color: mutedColor
      });
    }

    sidebarY += 4;
  });

  let mainY = columnsTop;
  document.querySelectorAll(".main > .section").forEach((section) => {
    const heading = section.querySelector("h2").textContent;
    mainY = writeSectionHeading(heading, mainX, mainY, mainWidth);

    section.querySelectorAll(":scope > article").forEach((entry) => {
      const entryTitle = entry.querySelector(".entry-head h3").textContent;
      const dates = entry.querySelector(".entry-head .dates");
      const sub = entry.querySelector(".entry-sub");
      const link = entry.querySelector(".entry-link a");
      const bullets = entry.querySelectorAll("ul li");
      const textX = mainX + entryIndent;
      const textWidth = mainWidth - entryIndent;
      const entryTopY = mainY - 3;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      setTextColor(textColor);
      doc.text(entryTitle, textX, mainY);

      if (dates) {
        writeDateBadge(dates.textContent, mainX + mainWidth, mainY);
      }
      mainY += 4;

      if (sub) {
        mainY = writeParagraph(sub.textContent, textX, mainY, textWidth, {
          fontSize: 7.8,
          italic: true,
          color: mutedColor
        });
      }

      bullets.forEach((bullet) => {
        mainY = writeParagraph("• " + bullet.textContent, textX + 1, mainY, textWidth - 1, {
          fontSize: 7.6
        });
      });

      if (link) {
        mainY = writeParagraph(link.textContent, textX, mainY, textWidth, {
          fontSize: 7.3,
          color: primaryColor
        });
      }

      // Left accent border for the whole entry, matching .entry's border-left.
      setDrawColor(accentLightColor);
      doc.setLineWidth(1);
      doc.line(mainX, entryTopY, mainX, mainY - 2);

      mainY += 3;
    });

    // "Swift Packages publiés" line under the projects list - not wrapped in an <article>.
    const packages = section.querySelector(".packages");
    if (packages) {
      mainY = writeParagraph(packages.textContent, mainX, mainY, mainWidth, {
        fontSize: 7.6,
        color: mutedColor
      });
      mainY += 2;
    }

    // Prior (non-tech) jobs list, also not wrapped in <article>.
    const priorJobs = section.querySelectorAll(".prior-jobs li");
    if (priorJobs.length) {
      priorJobs.forEach((job) => {
        mainY = writeParagraph(job.textContent.replace(/\s+/g, " ").trim(), mainX, mainY, mainWidth, {
          fontSize: 7.8
        });
      });
      const transferable = section.querySelector(".entry-sub");
      if (transferable) {
        mainY = writeParagraph(transferable.textContent, mainX, mainY, mainWidth, {
          fontSize: 7.6,
          italic: true,
          color: mutedColor
        });
      }
    }

    mainY += 3;
  });

  const language = document.documentElement.lang || "fr";
  doc.save(`julien-cotte-cv-${language}.pdf`);
}
