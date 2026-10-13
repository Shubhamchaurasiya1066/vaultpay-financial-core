import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();

    const { invoiceId } = body;

    if (!invoiceId) {
      return NextResponse.json(
        {
          success: false,
          message: "Invoice ID is required.",
        },
        { status: 400 }
      );
    }

    /*
     * Server-side trusted invoice catalog.
     *
     * The browser cannot change these values.
     *
     * In a production application this data should
     * come from a secure database.
     */
    const trustedInvoices = {
      "INV-1048": {
        amount: 18500,
        clientId: "client-001",
        clientName: "Atlas Consulting",
        description:
          "September corporate consulting services",
      },

      "INV-1047": {
        amount: 9800,
        clientId: "client-002",
        clientName: "Northstar Labs",
        description:
          "Financial technology consulting",
      },

      "INV-1046": {
        amount: 24000,
        clientId: "client-003",
        clientName: "Vertex Group",
        description:
          "Enterprise infrastructure services",
      },

      "INV-1045": {
        amount: 13750,
        clientId: "client-004",
        clientName: "Summit Holdings",
        description:
          "Monthly financial operations",
      },

      "INV-1044": {
        amount: 7420,
        clientId: "client-005",
        clientName: "BluePeak Systems",
        description:
          "Technology advisory services",
      },
    };

    /*
     * Server-side payment state.
     *
     * These invoices must not create another
     * Checkout Session.
     */
    const paidInvoices = new Set([
      "INV-1047",
    ]);

    const trustedInvoice =
      trustedInvoices[invoiceId];

    /*
     * Invoice existence check
     */
    if (!trustedInvoice) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invoice is not authorized for online payment.",
        },
        { status: 404 }
      );
    }

    /*
     * Duplicate payment protection
     */
    if (paidInvoices.has(invoiceId)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This invoice has already been paid.",
        },
        { status: 409 }
      );
    }

    /*
     * Ownership information is taken from
     * the trusted server-side invoice record,
     * never from the browser.
     */
    const trustedClientId =
      trustedInvoice.clientId;

    if (!trustedClientId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invoice ownership could not be verified.",
        },
        { status: 403 }
      );
    }

    /*
     * Financial amount validation
     */
    const numericAmount = Number(
      trustedInvoice.amount
    );

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid invoice amount.",
        },
        { status: 400 }
      );
    }

    /*
     * Create Stripe Checkout Session
     */
    const session =
      await stripe.checkout.sessions.create({
        mode: "payment",

        line_items: [
          {
            price_data: {
              currency: "usd",

              product_data: {
                name: `VaultPay Invoice ${invoiceId}`,

                description:
                  trustedInvoice.description,
              },

              unit_amount: Math.round(
                numericAmount * 100
              ),
            },

            quantity: 1,
          },
        ],

        metadata: {
          invoiceId: String(invoiceId),
          clientId: String(trustedClientId),
        },

        success_url:
          `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}` +
          `/client/invoices/${invoiceId}?payment=success&session_id={CHECKOUT_SESSION_ID}`,

        cancel_url:
          `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}` +
          `/client/invoices/${invoiceId}?payment=cancelled`,
      });

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error(
      "Stripe Checkout Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Unable to create Stripe checkout session.",
      },
      { status: 500 }
    );
  }
}