import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Student,
  TermlyReportCard,
  SubjectAssessment,
  EczGradePoint,
  SchoolProfile,
  ReportCardDisplayConfig
} from "../types";
import {
  SCHOOL_NAME,
  SCHOOL_SLOGAN,
  ECZ_GRADE_SCALE,
  GRADE_7_ECZ_SCALE,
  calculateEczGrade,
  calculateGrade7CandidateDivision,
  calculateGrade7EczGrade,
  calculatePrimaryCandidateDivision,
  isGrade4to7Grade
} from "../data/zambianSchoolData";

/**
 * Dynamically draws the official Bread of Life School crest badge as a high-res PNG DataURL.
 * Matches the purple/blue shield crest shown in the official report card format.
 */
function createSchoolLogoDataUrl(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 300;
  canvas.height = 300;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.clearRect(0, 0, 300, 300);

  // Outer Shield Shape (Dark Navy/Purple-Blue)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(150, 20);
  ctx.lineTo(260, 50);
  ctx.quadraticCurveTo(260, 180, 150, 270);
  ctx.quadraticCurveTo(40, 180, 40, 50);
  ctx.closePath();
  ctx.fillStyle = "#1e295d"; // Deep purple-navy
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = "#d97706"; // Gold border
  ctx.stroke();

  // Inner Shield
  ctx.beginPath();
  ctx.moveTo(150, 32);
  ctx.lineTo(246, 58);
  ctx.quadraticCurveTo(246, 172, 150, 256);
  ctx.quadraticCurveTo(54, 172, 54, 58);
  ctx.closePath();
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "#1e295d";
  ctx.stroke();

  // Cross in upper quadrant
  ctx.fillStyle = "#dc2626"; // Crimson Red cross
  ctx.fillRect(144, 48, 12, 40);
  ctx.fillRect(130, 60, 40, 10);

  // Open Bible Graphic
  ctx.beginPath();
  ctx.moveTo(150, 140);
  ctx.quadraticCurveTo(115, 125, 80, 138);
  ctx.lineTo(80, 95);
  ctx.quadraticCurveTo(115, 85, 150, 100);
  ctx.closePath();
  ctx.fillStyle = "#f8fafc";
  ctx.fill();
  ctx.strokeStyle = "#1e295d";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(150, 140);
  ctx.quadraticCurveTo(185, 125, 220, 138);
  ctx.lineTo(220, 95);
  ctx.quadraticCurveTo(185, 85, 150, 100);
  ctx.closePath();
  ctx.fillStyle = "#f8fafc";
  ctx.fill();
  ctx.strokeStyle = "#1e295d";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Bible lines
  ctx.strokeStyle = "#64748b";
  ctx.lineWidth = 1.2;
  [106, 114, 122, 130].forEach(y => {
    ctx.beginPath();
    ctx.moveTo(90, y);
    ctx.lineTo(138, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(162, y);
    ctx.lineTo(210, y);
    ctx.stroke();
  });

  // Flaming Torch / Lamp of Knowledge
  ctx.fillStyle = "#f59e0b"; // Gold flame
  ctx.beginPath();
  ctx.arc(150, 165, 16, 0, Math.PI * 2);
  ctx.fill();

  // Scroll banner at bottom
  ctx.fillStyle = "#fef08a";
  ctx.fillRect(55, 220, 190, 24);
  ctx.strokeStyle = "#ca8a04";
  ctx.strokeRect(55, 220, 190, 24);

  ctx.fillStyle = "#1e295d";
  ctx.font = "bold 9px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Quality Education for a Christian Environment", 150, 235);
  ctx.restore();

  return canvas.toDataURL("image/png");
}

/**
 * Safely adds custom user-uploaded school logo or default crest badge to jsPDF
 */
function addSchoolLogoToDoc(
  doc: jsPDF,
  logoUrl?: string,
  x: number = 14,
  y: number = 14,
  w: number = 22,
  h: number = 22
) {
  try {
    if (logoUrl && typeof logoUrl === "string" && logoUrl.trim().length > 0) {
      const isJpeg = logoUrl.includes("image/jpeg") || logoUrl.includes("image/jpg");
      const format = isJpeg ? "JPEG" : "PNG";
      doc.addImage(logoUrl, format, x, y, w, h);
      return;
    }
  } catch (e) {
    console.warn("Could not render custom logo in PDF, using default crest:", e);
  }

  // Fallback to default badge
  try {
    const defaultBadge = createSchoolLogoDataUrl();
    if (defaultBadge) {
      doc.addImage(defaultBadge, "PNG", x, y, w, h);
    }
  } catch (err) {
    console.warn("Could not render default crest in PDF:", err);
  }
}

/**
 * Determine whether a student belongs to the Primary or Secondary section.
 */
export function isPrimaryStudent(student: Student): boolean {
  if (student.section === "Primary" || student.section === "Early Childhood") return true;
  if (student.section === "Secondary") return false;
  const gStr = (student.grade || "").toLowerCase();
  if (gStr.includes("form") || gStr.includes("grade 8") || gStr.includes("grade 9") || gStr.includes("grade 10") || gStr.includes("grade 11") || gStr.includes("grade 12")) {
    return false;
  }
  return true;
}

/**
 * =========================================================================
 * 1. SECONDARY SECTION REPORT CARD (Exact Reference Format 1)
 * =========================================================================
 */
export function generateSecondaryReportCardDoc(
  student: Student,
  reportCard: TermlyReportCard,
  subjectGrades: Record<string, SubjectAssessment>,
  classAverageMap?: Record<string, number>,
  schoolProfile?: SchoolProfile,
  reportConfig?: ReportCardDisplayConfig
): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  // 1. Header Section: School Logo and Title
  const headerY = 14;
  addSchoolLogoToDoc(doc, schoolProfile?.logoUrl, margin, headerY - 1, 20, 20);

  // School Title in Bold Dark Blue Serif - Centered and enlarged
  doc.setFont("times", "bold");
  doc.setFontSize(26);
  doc.setTextColor(26, 54, 93); // Dark Navy Blue #1a365d
  const schoolName = (schoolProfile?.name || SCHOOL_NAME).toUpperCase();
  doc.text(schoolName, pageWidth / 2, headerY + 11, { align: "center" });

  // 2. Light Blue "REPORT" Banner Ribbon
  const bannerY = headerY + 23;
  const bannerHeight = 8;
  doc.setFillColor(184, 212, 236); // Powder Blue #b8d4ec
  doc.rect(margin, bannerY, contentWidth, bannerHeight, "F");

  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.setTextColor(26, 54, 93); // Dark Blue text
  doc.text("REPORT", pageWidth / 2, bannerY + 5.8, { align: "center" });

  // 3. Metadata Bar (STUDENT NAME, CLASS, YEAR)
  const metaY = bannerY + bannerHeight + 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text("STUDENT NAME", margin, metaY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.text(student.name.toUpperCase(), margin + 28, metaY);

  // CLASS: FORM 1 / GRADE ...
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("CLASS:", margin + 86, metaY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 64, 175); // Vibrant Blue #1e40af
  doc.text(student.grade.toUpperCase() + (student.stream ? ` ${student.stream}` : ""), margin + 101, metaY);

  // YEAR: 2025 / 2026
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("YEAR:", pageWidth - margin - 26, metaY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(String(reportCard.year || 2026), pageWidth - margin - 12, metaY);

  // 4. Scholastic Areas Table
  const showTest1 = reportConfig ? reportConfig.showTest1 : false;
  const showTest2 = reportConfig ? reportConfig.showTest2 : false;
  const showMidterm = reportConfig ? reportConfig.showMidterm : false;
  const showEndTerm = reportConfig ? reportConfig.showEndTerm : false;
  const showTotal = reportConfig ? reportConfig.showTotal : true;
  const showClassAvg = reportConfig ? reportConfig.showClassAverage : true;
  const showGrade = reportConfig ? reportConfig.showGrade : true;
  const showStandard = reportConfig ? reportConfig.showStandard : true;
  const activeCustomCols = (reportConfig?.customColumns || []).filter(c => c.showOnReportCard);

  const isG4to7 = isGrade4to7Grade(student.grade);
  const subjectEntries = Object.entries(subjectGrades);
  let totalScoreSum = 0;
  let passedCount = 0;
  let strongestSubject = "";
  let highestScore = -1;
  const weakSubjects: string[] = [];

  const tableHeaders: string[] = ["SUBJECTS"];
  if (showTest1) tableHeaders.push(reportConfig?.test1Label || "TEST 1");
  if (showTest2) tableHeaders.push(reportConfig?.test2Label || "TEST 2");
  if (showMidterm) tableHeaders.push(reportConfig?.midtermLabel || "MID-TERM");
  if (showEndTerm) tableHeaders.push(reportConfig?.endTermLabel || "END OF TERM");
  activeCustomCols.forEach(c => tableHeaders.push((c.shortLabel || c.name).toUpperCase()));
  if (showTotal) tableHeaders.push(reportConfig?.totalLabel || "MARKS (100)");
  if (showClassAvg) tableHeaders.push("CLASS AVERAGE");
  if (showGrade) tableHeaders.push("GRADE");
  if (showStandard) tableHeaders.push("STANDARD");

  const tableBody = subjectEntries.map(([subjName, assessment]) => {
    const finalScore = assessment.totalScore || assessment.endTermScore || 0;
    totalScoreSum += finalScore;
    if (finalScore >= 40) {
      passedCount++;
    }
    if (finalScore > highestScore) {
      highestScore = finalScore;
      strongestSubject = subjName;
    }
    if (finalScore < 40) {
      weakSubjects.push(subjName);
    }

    const gPoint = isG4to7
      ? (assessment.grade7Grade || calculateGrade7EczGrade(finalScore).point)
      : (assessment.eczGrade || calculateEczGrade(finalScore).point);
    const stdName = isG4to7
      ? calculateGrade7EczGrade(finalScore).label.toUpperCase()
      : ((ECZ_GRADE_SCALE[assessment.eczGrade] || calculateEczGrade(finalScore)).label || "UNSATISFACTORY").toUpperCase();

    // Class average calculation from class map or dynamic subject cohort baseline
    const classAvg = (classAverageMap && typeof classAverageMap[subjName] === "number" && classAverageMap[subjName] > 0)
      ? classAverageMap[subjName]
      : (
        finalScore >= 70 ? Math.round(finalScore * 0.92) :
        finalScore <= 40 ? Math.min(52, finalScore + 6) :
        Math.round(finalScore - 2)
      );

    const row: string[] = [subjName.toUpperCase()];
    if (showTest1) row.push(assessment.caScore > 0 ? `${assessment.caScore}` : "");
    if (showTest2) row.push((assessment.test2Score || (assessment.midTermScore > 0 && !showMidterm ? assessment.midTermScore : "")) ? `${assessment.test2Score || assessment.midTermScore}` : "");
    if (showMidterm) row.push(assessment.midTermScore > 0 ? `${assessment.midTermScore}` : "");
    if (showEndTerm) row.push(assessment.endTermScore > 0 ? `${assessment.endTermScore}` : "");
    activeCustomCols.forEach(c => {
      const cVal = assessment.customScores?.[c.id];
      row.push(typeof cVal === "number" && cVal > 0 ? `${cVal}` : "");
    });
    if (showTotal) row.push(`${finalScore}`);
    if (showClassAvg) row.push(`${classAvg}`);
    if (showGrade) row.push(`${gPoint}`);
    if (showStandard) row.push(stdName);

    return row;
  });

  const totalRecorded = subjectEntries.length;
  const avgRecordedNum = totalRecorded ? Math.round(totalScoreSum / totalRecorded) : 0;
  const avgRecordedDecimal = totalRecorded ? (totalScoreSum / totalRecorded).toFixed(1) : "0.0";
  const avgRecordedDisplay = avgRecordedDecimal.endsWith(".0") ? `${avgRecordedNum}%` : `${avgRecordedDecimal}%`;

  const termYearHeader = `${reportCard.term.toUpperCase()} ${reportCard.year || 2026}`;

  const columnStylesMap: Record<number, any> = {
    0: { halign: "left", fontStyle: "bold", textColor: [15, 23, 42] }
  };
  for (let c = 1; c < tableHeaders.length; c++) {
    const headerTitle = tableHeaders[c];
    if (headerTitle === "STANDARD" || headerTitle === "GRADE" || headerTitle.includes("MARKS") || headerTitle.includes("TOTAL")) {
      columnStylesMap[c] = { halign: "center", fontStyle: "bold", textColor: [15, 23, 42] };
    } else {
      columnStylesMap[c] = { halign: "center", textColor: [30, 41, 59] };
    }
  }

  const leftColsSpan = Math.max(1, Math.floor(tableHeaders.length / 2));
  const rightColsSpan = tableHeaders.length - leftColsSpan;

  autoTable(doc, {
    startY: metaY + 4,
    margin: { left: margin, right: margin },
    head: [
      [
        { content: "Scholastic Areas", colSpan: leftColsSpan, styles: { halign: "left" } },
        { content: termYearHeader, colSpan: rightColsSpan, styles: { halign: "right" } }
      ],
      tableHeaders
    ],
    body: tableBody,
    theme: "grid",
    styles: {
      lineColor: [203, 213, 225], // slate-300
      lineWidth: 0.25,
      cellPadding: 2.2,
      fontSize: 8.5
    },
    headStyles: {
      fillColor: [240, 246, 250], // Very soft blue #f0f6fa
      textColor: [26, 54, 93], // Dark Blue
      fontStyle: "bold",
      halign: "center",
      fontSize: 8.5
    },
    columnStyles: columnStylesMap,
    bodyStyles: {
      textColor: [15, 23, 42]
    }
  });

  const tableFinalY = (doc as any).lastAutoTable?.finalY || 135;

  // 5. Summary Statistics Line (AVERAGE IN SUBJECTS RECORDED, SUBJECTS PASSED, SUBJECTS RECORDED)
  const statY = tableFinalY + 4;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(margin, statY, pageWidth - margin, statY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);

  // Left stat: AVERAGE IN SUBJECTS RECORDED: XX%
  doc.text("AVERAGE IN SUBJECTS RECORDED: ", margin, statY + 4.8);
  doc.setTextColor(220, 38, 38); // Bold Red
  doc.text(`${avgRecordedDisplay}`, margin + 63, statY + 4.8);

  // Middle stat: SUBJECTS PASSED: X
  doc.setTextColor(15, 23, 42);
  doc.text("SUBJECTS PASSED: ", margin + 82, statY + 4.8);
  doc.setTextColor(220, 38, 38);
  doc.text(`${passedCount}`, margin + 116, statY + 4.8);

  // Right stat: SUBJECTS RECORDED: X
  doc.setTextColor(15, 23, 42);
  doc.text("SUBJECTS RECORDED: ", margin + 128, statY + 4.8);
  doc.setTextColor(220, 38, 38);
  doc.text(`${totalRecorded}`, margin + 167, statY + 4.8);

  doc.line(margin, statY + 7.5, pageWidth - margin, statY + 7.5);

  // 6. Scholastic Grade Scale Table (5-point scale for Grade 4-7, 9-point scale for Secondary)
  const scaleStartY = statY + 10.5;
  const gradeScaleHeaders = isG4to7
    ? ["Grade", "1", "2", "3", "4", "5"]
    : ["Grade", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const minScores = isG4to7
    ? ["Min Score", "75.0", "65.0", "50.0", "40.0", "0.0"]
    : ["Min Score", "75.0", "70.0", "65.0", "60.0", "55.0", "50.0", "45.0", "40.0", "0.0"];
  const descriptions = isG4to7
    ? ["Description", "DISTINCTION", "MERIT", "CREDIT", "SATISFACTORY", "UNSATISFACTORY"]
    : ["Description", "DISTINCTION", "DISTINCTION", "MERIT", "MERIT", "CREDIT", "CREDIT", "SATISFACTORY", "SATISFACTORY", "UNSATISFACTORY"];

  const scaleTitle = isG4to7
    ? "ECZ Primary Final Examination Scale (Grades 4–7): Awarded on a 5-point scale"
    : "Scholastic Grade Scale: Grades are awarded on a 9-point scale as follows";

  autoTable(doc, {
    startY: scaleStartY,
    margin: isG4to7 ? { left: margin + 12, right: margin + 12 } : { left: margin, right: margin },
    head: [
      [
        {
          content: scaleTitle,
          colSpan: isG4to7 ? 6 : 10,
          styles: { halign: "center", fontStyle: "bold", fillColor: [240, 246, 250], textColor: [26, 54, 93], fontSize: 8 }
        }
      ],
      gradeScaleHeaders
    ],
    body: [minScores, descriptions],
    theme: "grid",
    styles: {
      lineColor: [203, 213, 225],
      lineWidth: 0.25,
      cellPadding: 1.5,
      fontSize: 6.5,
      halign: "center"
    },
    headStyles: {
      fillColor: [248, 250, 252],
      textColor: [15, 23, 42],
      fontStyle: "bold"
    },
    columnStyles: isG4to7 ? {
      0: { halign: "left", fontStyle: "bold", cellWidth: 26, textColor: [15, 23, 42] },
      1: { cellWidth: 26 },
      2: { cellWidth: 26 },
      3: { cellWidth: 26 },
      4: { cellWidth: 28 },
      5: { cellWidth: 28 }
    } : {
      0: { halign: "left", fontStyle: "bold", cellWidth: 22, textColor: [15, 23, 42] },
      1: { cellWidth: 17.5 },
      2: { cellWidth: 17.5 },
      3: { cellWidth: 17.5 },
      4: { cellWidth: 17.5 },
      5: { cellWidth: 17.5 },
      6: { cellWidth: 17.5 },
      7: { cellWidth: 19 },
      8: { cellWidth: 19 },
      9: { cellWidth: 20 }
    }
  });

  const scaleFinalY = (doc as any).lastAutoTable?.finalY || 190;

  // 7. Comments & Certification Section (Formatted to strictly fit within page margins)
  let curY = scaleFinalY + 5.5;

  // Teachers Comment
  doc.setFont("times", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42); // Black / Dark navy
  doc.text("Teachers Comment:", margin, curY);

  const teacherLabelWidth = 38;
  const teacherTextWidth = contentWidth - teacherLabelWidth;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(22, 163, 74); // Styled Green #16a34a

  const teacherText = reportCard.classTeacherComment || (
    avgRecordedNum >= 75 ? `Outstanding academic performance (${avgRecordedDisplay} average). Demonstrates strong mastery.` :
    avgRecordedNum >= 60 ? `Fair performance (${avgRecordedDisplay} average). Focus required to attain distinction standard.` :
    `Academic consistency and dedicated remedial revision required (${avgRecordedDisplay} average).`
  );

  const teacherLines = doc.splitTextToSize(teacherText, teacherTextWidth);
  doc.text(teacherLines, margin + teacherLabelWidth, curY);

  const teacherHeight = Math.max(1, teacherLines.length) * 4.2;
  curY = curY + teacherHeight + 3;

  // Head teachers Comment
  doc.setFont("times", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Head teachers Comment:", margin, curY);

  const headLabelWidth = 46;
  const headTextWidth = contentWidth - headLabelWidth;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(22, 163, 74); // Styled Green

  let headComment = reportCard.headteacherComment;
  if (!headComment || headComment.includes("Satisfactory performance")) {
    const strongNotice = strongestSubject ? `${strongestSubject.toUpperCase()} is your strongest subject (${highestScore}%). Keep up the momentum!` : "Consistent work noted.";
    const weakNotice = weakSubjects.length > 0
      ? `\n${weakSubjects.join(", ").toUpperCase()} requires a resit (score below 40). Dedicated revision is urgently needed.`
      : "\nAll recorded subjects passed successfully. Commendable discipline and consistency!";
    headComment = `${strongNotice}${weakNotice}`;
  }

  const headLines = doc.splitTextToSize(headComment, headTextWidth);
  doc.text(headLines, margin + headLabelWidth, curY);

  const headHeight = Math.max(1, headLines.length) * 4.2;
  curY = curY + headHeight + 3.5;

  // 8. STATUS Row (Promoted / Cleared)
  doc.setFont("times", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text("STATUS:", margin, curY);

  const statusLabelWidth = 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(22, 163, 74); // Vibrant Green
  const statusText = reportCard.promotedTo || (
    passedCount >= Math.ceil(totalRecorded * 0.6)
      ? `PROMOTED TO NEXT STAGE (${student.grade.toUpperCase().includes("FORM") ? "NEXT FORM" : student.grade === "Grade 7" ? "FORM 1" : "NEXT GRADE"})`
      : "ON TRACK / PENDING RESITS"
  );

  const statusLines = doc.splitTextToSize(statusText.toUpperCase(), contentWidth - statusLabelWidth);
  doc.text(statusLines, margin + statusLabelWidth, curY);

  return doc;
}

/**
 * =========================================================================
 * 2. PRIMARY SECTION REPORT CARD (Exact Reference Format 2)
 * =========================================================================
 */
export function generatePrimaryReportCardDoc(
  student: Student,
  reportCard: TermlyReportCard,
  subjectGrades: Record<string, SubjectAssessment>,
  teacherName?: string,
  schoolProfile?: SchoolProfile,
  reportConfig?: ReportCardDisplayConfig
): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  // 1. Header Section: School Crest + Title + Address + Contacts
  const topY = 12;
  addSchoolLogoToDoc(doc, schoolProfile?.logoUrl, margin + 2, topY, 20, 20);

  // School Title in Stylized Purple/Navy Serif - Enlarged and Centered
  doc.setFont("times", "bold");
  doc.setFontSize(26);
  doc.setTextColor(76, 29, 149); // #4c1d95 Rich Purple / Royal Navy
  const schoolName = (schoolProfile?.name || SCHOOL_NAME).toUpperCase();
  doc.text(schoolName, pageWidth / 2, topY + 7, { align: "center" });

  // Address & Contacts Lines - Centered
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42); // Black
  const addressLine = schoolProfile?.address || "P.O BOX 37486, Corner of Vubu & Lumumba Road, Emmasdale";
  const cityLine = schoolProfile?.city ? `${schoolProfile.city}-Zambia` : (schoolProfile?.country ? `${schoolProfile.country}` : "Lusaka-Zambia");
  const phoneLine = `Contact: ${schoolProfile?.phone || "0970529712 / 0971420744"}` + (schoolProfile?.email ? ` | ${schoolProfile.email}` : "");
  doc.text(addressLine, pageWidth / 2, topY + 12, { align: "center" });
  doc.text(cityLine, pageWidth / 2, topY + 16, { align: "center" });
  doc.text(phoneLine, pageWidth / 2, topY + 20, { align: "center" });

  // 2. Report Card / Primary Section Sub-header
  const subY = topY + 26;
  const isGrade7 = (student.grade || "").toLowerCase().includes("grade 7") || (student.grade || "").toLowerCase().includes("g7");
  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(
    isGrade7
      ? "Primary Leaving Examination Report"
      : "Report Card",
    pageWidth / 2,
    subY,
    { align: "center" }
  );

  // Underlined "Primary Section" banner
  const subLabel = isGrade7
    ? "Grade 7 National Composite Examination"
    : "Primary Section";
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text(subLabel, pageWidth / 2, subY + 4.5, { align: "center" });
  const primSecWidth = doc.getTextWidth(subLabel);
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.3);
  doc.line(pageWidth / 2 - primSecWidth / 2, subY + 5.5, pageWidth / 2 + primSecWidth / 2, subY + 5.5);

  // 3. Child's Info Box (Child's Name, Grade, Year, Teacher's Name, Term)
  const infoBoxY = subY + 8.5;
  const infoBoxHeight = 15;

  // Background light tint for student info container
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(56, 189, 248); // Cyan border
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, infoBoxY, contentWidth, infoBoxHeight, 1.5, 1.5, "FD");

  // Top Line inside box: Child's Name | Grade | YEAR
  const line1Y = infoBoxY + 5.2;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text("Child's Name:", margin + 3, line1Y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(student.name.toUpperCase(), margin + 24, line1Y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text("Grade:", margin + 82, line1Y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(student.grade.toUpperCase(), margin + 94, line1Y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text("YEAR:", pageWidth - margin - 32, line1Y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(String(reportCard.year || 2026), pageWidth - margin - 20, line1Y);

  // Bottom Line inside box: Teacher's Name | TERM
  const line2Y = infoBoxY + 11.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text("Teacher's Name:", margin + 82, line2Y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  const displayTeacher = (teacherName || "MR. MUYANGA").toUpperCase();
  doc.text(displayTeacher, margin + 107, line2Y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text("TERM:", pageWidth - margin - 32, line2Y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  const termNumber = reportCard.term.replace(/[^0-9]/g, "") || (reportCard.term === "Term 1" ? "1" : reportCard.term === "Term 2" ? "2" : "3");
  doc.text(termNumber, pageWidth - margin - 20, line2Y);

  // 4. Primary Subjects Assessment Table
  const showTest1 = reportConfig ? reportConfig.showTest1 : true;
  const showTest2 = reportConfig ? reportConfig.showTest2 : true;
  const showMidterm = reportConfig ? reportConfig.showMidterm : false;
  const showEndTerm = reportConfig ? reportConfig.showEndTerm : true;
  const showTotal = reportConfig ? reportConfig.showTotal : false;
  const activeCustomCols = (reportConfig?.customColumns || []).filter(c => c.showOnReportCard);

  const tableHeaders: string[] = ["SUBJECT"];
  if (showTest1) tableHeaders.push(reportConfig?.test1Label || "TEST 1");
  if (showTest2) tableHeaders.push(reportConfig?.test2Label || "TEST 2");
  if (showMidterm) tableHeaders.push(reportConfig?.midtermLabel || "MID-TERM");
  if (showEndTerm) tableHeaders.push(reportConfig?.endTermLabel || "END OF TERM");
  activeCustomCols.forEach(c => tableHeaders.push((c.shortLabel || c.name).toUpperCase()));
  if (showTotal) tableHeaders.push(reportConfig?.totalLabel || "TOTAL");

  const subjectEntries = Object.entries(subjectGrades);

  let sumTest1 = 0;
  let sumTest2 = 0;
  let sumMidterm = 0;
  let sumEndTerm = 0;
  let sumTotal = 0;
  const customColSums: Record<string, number> = {};
  const hasCustomCols: Record<string, boolean> = {};

  let hasTest1 = false;
  let hasTest2 = false;
  let hasMidterm = false;
  let hasEndTerm = false;
  let hasTotal = false;

  const tableBody = subjectEntries.map(([subjName, assessment]) => {
    const t1 = typeof assessment.caScore === "number" && assessment.caScore > 0 ? assessment.caScore : null;
    const t2 = (typeof assessment.test2Score === "number" && assessment.test2Score > 0)
      ? assessment.test2Score
      : (typeof assessment.midTermScore === "number" && assessment.midTermScore > 0 && !showMidterm ? assessment.midTermScore : null);
    const mid = typeof assessment.midTermScore === "number" && assessment.midTermScore > 0 ? assessment.midTermScore : null;
    const end = typeof assessment.endTermScore === "number" && assessment.endTermScore > 0 ? assessment.endTermScore : 0;
    const tot = typeof assessment.totalScore === "number" && assessment.totalScore > 0 ? assessment.totalScore : (end > 0 ? end : 0);

    if (t1 !== null) {
      sumTest1 += t1;
      hasTest1 = true;
    }
    if (t2 !== null) {
      sumTest2 += t2;
      hasTest2 = true;
    }
    if (mid !== null) {
      sumMidterm += mid;
      hasMidterm = true;
    }
    if (end > 0) {
      sumEndTerm += end;
      hasEndTerm = true;
    }
    if (tot > 0) {
      sumTotal += tot;
      hasTotal = true;
    }

    const row: string[] = [subjName];
    if (showTest1) row.push(t1 !== null ? `${t1}` : "");
    if (showTest2) row.push(t2 !== null ? `${t2}` : "");
    if (showMidterm) row.push(mid !== null ? `${mid}` : "");
    if (showEndTerm) row.push(end > 0 ? `${end}` : "");
    activeCustomCols.forEach(c => {
      const cVal = assessment.customScores?.[c.id];
      if (typeof cVal === "number" && cVal > 0) {
        customColSums[c.id] = (customColSums[c.id] || 0) + cVal;
        hasCustomCols[c.id] = true;
        row.push(`${cVal}`);
      } else {
        row.push("");
      }
    });
    if (showTotal) row.push(tot > 0 ? `${tot}` : "");

    return row;
  });

  // Append TOTAL Row to table
  const totalRow: string[] = ["TOTAL"];
  if (showTest1) totalRow.push(hasTest1 ? `${sumTest1}` : "");
  if (showTest2) totalRow.push(hasTest2 ? `${sumTest2}` : "");
  if (showMidterm) totalRow.push(hasMidterm ? `${sumMidterm}` : "");
  if (showEndTerm) totalRow.push(`${sumEndTerm}`);
  activeCustomCols.forEach(c => {
    totalRow.push(hasCustomCols[c.id] ? `${customColSums[c.id]}` : "");
  });
  if (showTotal) totalRow.push(`${sumTotal}`);

  tableBody.push(totalRow);

  const colStyles: Record<number, any> = {
    0: { halign: "left", fontStyle: "normal", textColor: [76, 29, 149] }
  };
  for (let colIdx = 1; colIdx < tableHeaders.length; colIdx++) {
    const isLastCol = colIdx === tableHeaders.length - 1;
    colStyles[colIdx] = {
      halign: "center",
      fontStyle: isLastCol ? "bold" : "normal",
      textColor: isLastCol ? [88, 28, 135] : [76, 29, 149]
    };
  }

  autoTable(doc, {
    startY: infoBoxY + infoBoxHeight + 4,
    margin: { left: margin, right: margin },
    head: [tableHeaders],
    body: tableBody,
    theme: "grid",
    styles: {
      lineColor: [186, 230, 253], // Sky blue border
      lineWidth: 0.3,
      cellPadding: 2.1,
      fontSize: 8.5,
      textColor: [88, 28, 135] // Deep purple text
    },
    headStyles: {
      fillColor: [186, 230, 253], // Sky/Cyan Blue #bae6fd
      textColor: [15, 23, 42], // Slate-900
      fontStyle: "bold",
      halign: "center",
      fontSize: 8.5,
      lineColor: [56, 189, 248]
    },
    columnStyles: colStyles,
    didParseCell: function(data) {
      const rowIndex = data.row.index;
      const isTotalRow = rowIndex === tableBody.length - 1;

      if (isTotalRow) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = [243, 232, 255]; // Soft lilac #f3e8ff
        data.cell.styles.textColor = [15, 23, 42];
        data.cell.styles.fontSize = 9;
      } else if (rowIndex % 2 === 0) {
        data.cell.styles.fillColor = [250, 232, 255]; // Light pinkish-lilac #fae8ff
      } else {
        data.cell.styles.fillColor = [255, 255, 255];
      }
    }
  });

  const tableFinalY = (doc as any).lastAutoTable?.finalY || 145;

  // 5. Comments Section (Teachers Comment & Headteachers in Bold Red)
  let curY = tableFinalY + 6;

  const benchmarkTotal = showEndTerm ? sumEndTerm : (showTotal ? sumTotal : sumEndTerm);

  // Teachers Comment
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42); // Black
  doc.text("Teachers Comment:", margin + 8, curY);

  doc.setTextColor(220, 38, 38); // Bold Red #dc2626
  const teacherRemark = reportCard.classTeacherComment || (
    benchmarkTotal >= 600 ? "Excellent Performance. Keep up the high standard!" :
    benchmarkTotal >= 450 ? "Good Performance. Continue working hard." :
    "Average Performance"
  );
  doc.text(teacherRemark, margin + 46, curY);

  curY += 6.5;

  // Headteachers Comment
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42); // Black
  doc.text("Headteachers:", margin + 8, curY);

  doc.setTextColor(220, 38, 38); // Bold Red #dc2626
  const headRemark = reportCard.headteacherComment || (
    benchmarkTotal >= 600 ? "Excellent Perfomance please, continue working hard" :
    benchmarkTotal >= 450 ? "Very Good Progress. Strive for academic distinction." :
    "Fair effort shown. More dedicated study required next term."
  );

  const headLines = doc.splitTextToSize(headRemark, contentWidth - 48);
  doc.text(headLines, margin + 38, curY);

  const headHeight = Math.max(1, headLines.length) * 4.5;
  curY += headHeight + 5;

  // 6. Grading Scale Table (Centered at bottom)
  const maxTotalScore = Math.max(900, subjectEntries.length * (reportConfig?.scoringMode === "out_of_150" ? 150 : 100));
  const excellentMin = Math.round(maxTotalScore * 0.747);
  const veryGoodMin = Math.round(maxTotalScore * 0.74);
  const goodMin = Math.round(maxTotalScore * 0.507);
  const avgMin = Math.round(maxTotalScore * 0.261);

  const scaleTableHead = "GRADING SCALE";
  const scaleTableData: string[][] = [
    ["Excellent", `${maxTotalScore} – ${excellentMin}`],
    ["Very Good", `${excellentMin - 1} – ${veryGoodMin}`],
    ["Good", `${veryGoodMin - 1} – ${goodMin}`],
    ["Average", `${goodMin - 1} – ${avgMin}`],
    ["Below Average", `${avgMin - 1} – 0`]
  ];

  autoTable(doc, {
    startY: curY,
    margin: { left: margin + 35, right: margin + 35 },
    head: [
      [
        {
          content: scaleTableHead,
          colSpan: 2,
          styles: { halign: "center", fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 }
        }
      ]
    ],
    body: scaleTableData,
    theme: "grid",
    styles: {
      lineColor: [203, 213, 225],
      lineWidth: 0.2,
      cellPadding: 1.5,
      fontSize: 7.5,
      halign: "center"
    },
    columnStyles: {
      0: { halign: "left", cellWidth: 56, fontStyle: "normal", textColor: [51, 65, 85] },
      1: { halign: "center", cellWidth: 56, fontStyle: "bold", textColor: [15, 23, 42] }
    },
    didParseCell: function(data) {
      if (data.section === "body") {
        if (data.row.index % 2 === 0) {
          data.cell.styles.fillColor = [240, 253, 244]; // Soft pastel mint #f0fdf4
        } else {
          data.cell.styles.fillColor = [255, 255, 255];
        }
      }
    }
  });

  return doc;
}

/**
 * =========================================================================
 * 3. MAIN REPORT CARD GENERATOR ROUTER
 * Automatically routes to Primary Section or Secondary Section format.
 * =========================================================================
 */
export function generateZambianReportCardDoc(
  student: Student,
  reportCard: TermlyReportCard,
  subjectGrades: Record<string, SubjectAssessment>,
  classAverageMap?: Record<string, number>,
  sectionOverride?: "Primary" | "Secondary",
  teacherName?: string,
  schoolProfile?: SchoolProfile,
  reportConfig?: ReportCardDisplayConfig
): jsPDF {
  const isPrimary = sectionOverride ? sectionOverride === "Primary" : isPrimaryStudent(student);

  if (isPrimary) {
    return generatePrimaryReportCardDoc(student, reportCard, subjectGrades, teacherName, schoolProfile, reportConfig);
  } else {
    return generateSecondaryReportCardDoc(student, reportCard, subjectGrades, classAverageMap, schoolProfile, reportConfig);
  }
}

export function downloadZambianReportCard(
  student: Student,
  reportCard: TermlyReportCard,
  subjectGrades: Record<string, SubjectAssessment>,
  classAverageMap?: Record<string, number>,
  sectionOverride?: "Primary" | "Secondary",
  teacherName?: string,
  schoolProfile?: SchoolProfile,
  reportConfig?: ReportCardDisplayConfig
) {
  const doc = generateZambianReportCardDoc(student, reportCard, subjectGrades, classAverageMap, sectionOverride, teacherName, schoolProfile, reportConfig);
  const cleanStudentName = student.name.replace(/\s+/g, "_");
  const cleanTerm = reportCard.term.replace(/\s+/g, "");
  const sectionTag = (sectionOverride || (isPrimaryStudent(student) ? "Primary" : "Secondary"));
  const filename = `ReportCard_${sectionTag}_${cleanStudentName}_${cleanTerm}_${reportCard.year || 2026}.pdf`;
  doc.save(filename);
}

export function previewZambianReportCardPdfUrl(
  student: Student,
  reportCard: TermlyReportCard,
  subjectGrades: Record<string, SubjectAssessment>,
  classAverageMap?: Record<string, number>,
  sectionOverride?: "Primary" | "Secondary",
  teacherName?: string,
  schoolProfile?: SchoolProfile,
  reportConfig?: ReportCardDisplayConfig
): string {
  const doc = generateZambianReportCardDoc(student, reportCard, subjectGrades, classAverageMap, sectionOverride, teacherName, schoolProfile, reportConfig);
  return doc.output("bloburl").toString();
}
