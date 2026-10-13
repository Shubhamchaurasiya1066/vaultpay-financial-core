import PDFDocument from "pdfkit";
import { NextResponse } from "next/server";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount) || 0);
}

function formatDate(date) {
  if (!date) return "N/A";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(date);
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(parsedDate);
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Invoice ID is required.",
        },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);

    const invoice = {
      id,
      clientId: searchParams.get("clientId"),
      clientName: searchParams.get("clientName"),
      amount: Number(searchParams.get("amount")),
      status: searchParams.get("status") || "pending",
      issueDate: searchParams.get("issueDate"),
      dueDate: searchParams.get("dueDate"),
      description:
        searchParams.get("description") ||
        "VaultPay financial services",
    };

    if (
      !invoice.clientId ||
      !invoice.clientName ||
      !Number.isFinite(invoice.amount) ||
      invoice.amount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid invoice information.",
        },
        { status: 400 }
      );
    }

    const document = new PDFDocument({
      size: "A4",
      margin: 50,
      info: {
        Title: `VaultPay Invoice ${invoice.id}`,
        Author: "VaultPay Financial Core",
        Subject: "Invoice Document",
      },
    });

    const chunks = [];

    document.on("data", (chunk) => {
      chunks.push(chunk);
    });

    const pdfPromise = new Promise((resolve, reject) => {
      document.on("end", () => {
        resolve(Buffer.concat(chunks));
      });

      document.on("error", reject);
    });

    // =====================================================
    // HEADER
    // =====================================================

    document
      .fontSize(26)
      .font("Helvetica-Bold")
      .fillColor("#111827")
      .text("VAULTPAY", 50, 50);

    document
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#64748b")
      .text("FINANCIAL CORE", 50, 82);

    document
      .fontSize(20)
      .font("Helvetica-Bold")
      .fillColor("#111827")
      .text("INVOICE", 400, 55, {
        width: 145,
        align: "right",
      });

    document
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#64748b")
      .text(invoice.id, 400, 82, {
        width: 145,
        align: "right",
      });

    document
      .moveTo(50, 110)
      .lineTo(545, 110)
      .strokeColor("#e2e8f0")
      .stroke();

    // =====================================================
    // BILLING INFORMATION
    // =====================================================

    document
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor("#64748b")
      .text("BILLED TO", 50, 140);

    document
      .fontSize(15)
      .font("Helvetica-Bold")
      .fillColor("#111827")
      .text(invoice.clientName, 50, 160);

    document
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#64748b")
      .text(`Client ID: ${invoice.clientId}`, 50, 184);

    document
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor("#64748b")
      .text("INVOICE DETAILS", 350, 140);

    document
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#111827")
      .text(`Issue Date: ${formatDate(invoice.issueDate)}`, 350, 160);

    document.text(
      `Due Date: ${formatDate(invoice.dueDate)}`,
      350,
      178
    );

    document.text(
      `Status: ${String(invoice.status).toUpperCase()}`,
      350,
      196
    );

    // =====================================================
    // INVOICE TABLE
    // =====================================================

    const tableTop = 245;

    document
      .roundedRect(50, tableTop, 495, 38, 4)
      .fill("#f1f5f9");

    document
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor("#475569")
      .text("DESCRIPTION", 65, tableTop + 13);

    document.text("AMOUNT", 430, tableTop + 13, {
      width: 95,
      align: "right",
    });

    document
      .fontSize(11)
      .font("Helvetica")
      .fillColor("#111827")
      .text(invoice.description, 65, tableTop + 58, {
        width: 330,
      });

    document
      .font("Helvetica-Bold")
      .text(formatCurrency(invoice.amount), 430, tableTop + 58, {
        width: 95,
        align: "right",
      });

    document
      .moveTo(50, tableTop + 95)
      .lineTo(545, tableTop + 95)
      .strokeColor("#e2e8f0")
      .stroke();

    // =====================================================
    // TOTAL
    // =====================================================

    document
      .fontSize(11)
      .font("Helvetica")
      .fillColor("#64748b")
      .text("TOTAL", 350, tableTop + 125);

    document
      .fontSize(20)
      .font("Helvetica-Bold")
      .fillColor("#111827")
      .text(formatCurrency(invoice.amount), 350, tableTop + 145, {
        width: 195,
        align: "right",
      });

    // =====================================================
    // PAYMENT STATUS
    // =====================================================

    const statusY = tableTop + 210;

    document
      .roundedRect(50, statusY, 495, 65, 8)
      .fill("#f8fafc");

    document
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor("#64748b")
      .text("PAYMENT STATUS", 70, statusY + 17);

    document
      .fontSize(13)
      .font("Helvetica-Bold")
      .fillColor("#111827")
      .text(
        String(invoice.status).toUpperCase(),
        70,
        statusY + 35
      );

    // =====================================================
    // FOOTER
    // =====================================================

    document
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#94a3b8")
      .text(
        "Generated by VaultPay Financial Core",
        50,
        760,
        {
          width: 495,
          align: "center",
        }
      );

    document
      .fontSize(8)
      .text(
        "This document is generated electronically and does not require a signature.",
        50,
        777,
        {
          width: 495,
          align: "center",
        }
      );

    document.end();

    const pdfBuffer = await pdfPromise;

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.id}.pdf"`,
        "Content-Length": String(pdfBuffer.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Invoice PDF generation error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate invoice PDF.",
      },
      { status: 500 }
    );
  }
}