import Stripe from "stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const secretKey = process.env.STRIPE_SECRET_KEY;
const stripe = secretKey ? new Stripe(secretKey) : null;

const trustedInvoices = {
  
"INV-1049": {
  amount: 651488,
  clientId: "client-006",
  clientName: "Verified Client 006",
  description: "Invoice INV-1049",
  status: "pending",
},

  "INV-1048": {
    amount: 18500,
    clientId: "client-001",
    description: "September corporate consulting services",
    status: "paid",
  },
  "INV-1047": {
    amount: 9800,
    clientId: "client-002",
    description: "Financial technology consulting",
    status: "pending",
  },
  "INV-1046": {
    amount: 24000,
    clientId: "client-003",
    description: "Enterprise infrastructure services",
    status: "processing",
  },
  "INV-1045": {
    amount: 13750,
    clientId: "client-004",
    description: "Monthly financial operations",
    status: "paid",
  },
  "INV-1044": {
    amount: 7420,
    clientId: "client-005",
    description: "Technology advisory services",
    status: "overdue",
  },
};

export async function POST(request) {
  try {
    if (!stripe) {
      console.error("STRIPE_SECRET_KEY is not configured");
      return NextResponse.json(
        { success: false, message: "Payment service is not configured." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const invoiceId = String(body?.invoiceId || "").trim();
    const requestedClientId = String(body?.clientId || "").trim();

    if (!invoiceId) {
      return NextResponse.json(
        { success: false, message: "Invoice ID is required." },
        { status: 400 }
      );
    }

    const invoice = trustedInvoices[invoiceId];

    if (!invoice) {
      return NextResponse.json(
        {
          success: false,
          message: `Invoice ${invoiceId} is not registered for online payment. Create/register it in the trusted server-side invoice catalog first.`,
        },
        { status: 404 }
      );
    }

    if (invoice.status === "paid") {
      return NextResponse.json(
        { success: false, message: "This invoice has already been paid." },
        { status: 409 }
      );
    }

    if (requestedClientId && requestedClientId !== invoice.clientId) {
      return NextResponse.json(
        { success: false, message: "Invoice ownership does not match." },
        { status: 403 }
      );
    }

    if (!Number.isFinite(invoice.amount) || invoice.amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid invoice amount." },
        { status: 400 }
      );
    }

    const appUrl = (
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000"
    ).replace(/\/+$/, "");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `VaultPay Invoice ${invoiceId}`,
              description: invoice.description,
            },
            unit_amount: Math.round(invoice.amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        invoiceId,
        clientId: invoice.clientId,
      },
      success_url:
        `${appUrl}/client/invoices/${encodeURIComponent(invoiceId)}` +
        `?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:
        `${appUrl}/client/invoices/${encodeURIComponent(invoiceId)}` +
        "?payment=cancelled",
    });

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create Stripe Checkout Session.",
      },
      { status: 500 }
    );
  }
}