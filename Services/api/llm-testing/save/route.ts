import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

const EXCEL_PATH = path.join(process.cwd(), "LLM-testing", "test_results.xlsx");

const HEADERS = [
  "S.No",
  "Timestamp",
  "Location",
  "Age Group",
  "Gender",
  "Education",
  "Work Interest",
  "Experience Level",
  "Income Goal (₹)",
  "Device Type",
  "Language",
  "Digital Confidence",
  "Path 1",
  "Path 2",
  "Path 3",
  "Selected Path",
  "Module 1 Title",
  "Module 1 Subtopics",
  "Module 2 Title",
  "Module 2 Subtopics",
  "Full JSON Response",
];

const COL_WIDTHS = [8, 22, 20, 15, 15, 18, 30, 30, 15, 20, 18, 15, 25, 25, 25, 25, 25, 50, 25, 50, 40];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { profile, paths, selectedPathIndex, roadmap, generatedAt } = body;

    // Ensure directory exists
    const dir = path.dirname(EXCEL_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const workbook = new ExcelJS.Workbook();
    let sheet: ExcelJS.Worksheet;
    let nextSerial = 1;

    // If file exists, read it first
    if (fs.existsSync(EXCEL_PATH)) {
      try {
        await workbook.xlsx.readFile(EXCEL_PATH);
        // Get the first worksheet (by index, more reliable than by name)
        sheet = workbook.worksheets[0];
        if (sheet) {
          // Count existing data rows (subtract 1 for header)
          nextSerial = sheet.rowCount; // row 1 = header, so rowCount = next serial
        } else {
          // File exists but no sheets — create fresh
          sheet = workbook.addWorksheet("LLM Test Results");
          setupHeaders(sheet);
        }
      } catch (readErr) {
        console.error("Error reading existing Excel file, creating new:", readErr);
        // If file is corrupted, start fresh
        const freshWorkbook = new ExcelJS.Workbook();
        sheet = freshWorkbook.addWorksheet("LLM Test Results");
        setupHeaders(sheet);
        // Replace workbook reference
        await freshWorkbook.xlsx.writeFile(EXCEL_PATH);
        await workbook.xlsx.readFile(EXCEL_PATH);
        sheet = workbook.worksheets[0];
      }
    } else {
      // No file — create new
      sheet = workbook.addWorksheet("LLM Test Results");
      setupHeaders(sheet);
    }

    // Extract module data
    const modules = roadmap?.modules || [];
    const mod1 = modules[0];
    const mod2 = modules[1];

    const mod1Subtopics = mod1?.subtopics
      ?.map((s: { title: string; practical_task: string; key_learning_notes?: string }) => `${s.title}: ${s.key_learning_notes ? `[Notes: ${s.key_learning_notes}] ` : ''}${s.practical_task}`)
      .join(";\n\n") || "N/A";

    const mod2Subtopics = mod2?.subtopics
      ?.map((s: { title: string; practical_task: string; key_learning_notes?: string }) => `${s.title}: ${s.key_learning_notes ? `[Notes: ${s.key_learning_notes}] ` : ''}${s.practical_task}`)
      .join(";\n\n") || "N/A";

    // Build the row data
    const rowData = [
      nextSerial,
      new Date(generatedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      profile.location || "",
      profile.ageGroup || "",
      profile.gender || "",
      profile.educationLevel || "",
      profile.workInterest || "",
      profile.experienceLevel || "",
      profile.targetIncomeExact || "",
      profile.deviceType || "",
      profile.languagePreference || "",
      profile.confidenceLevel || "",
      paths[0]?.title || "N/A",
      paths[1]?.title || "N/A",
      paths[2]?.title || "N/A",
      paths[selectedPathIndex]?.title || "N/A",
      mod1?.module_title || "N/A",
      mod1Subtopics,
      mod2?.module_title || "N/A",
      mod2Subtopics,
      JSON.stringify({ paths, roadmap }, null, 2),
    ];

    // Add the row
    const row = sheet.addRow(rowData);

    // Alternate row coloring for readability
    if (nextSerial % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF2F6FC" },
        };
      });
    }

    // Write file
    await workbook.xlsx.writeFile(EXCEL_PATH);

    console.log(`[LLM-Testing] Saved row #${nextSerial} to ${EXCEL_PATH} (total rows: ${sheet.rowCount})`);

    return NextResponse.json({
      success: true,
      serial: nextSerial,
      totalRows: sheet.rowCount,
      savedTo: EXCEL_PATH,
    });

  } catch (error) {
    console.error("Save error:", error);
    return NextResponse.json({ error: "Failed to save: " + (error as Error).message }, { status: 500 });
  }
}

function setupHeaders(sheet: ExcelJS.Worksheet) {
  // Set column widths BEFORE adding data
  for (let i = 0; i < HEADERS.length; i++) {
    const col = sheet.getColumn(i + 1);
    col.width = COL_WIDTHS[i] || 20;
  }

  // Add header row
  const headerRow = sheet.addRow(HEADERS);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E3A5F" },
  };
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1E3A5F" },
    };
  });
}
