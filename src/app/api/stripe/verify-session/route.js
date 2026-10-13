import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const sessionId = searchParams.get("session_id");
    const invoiceId = searchParams.get("invoice_id");

    if (!sessionId || !invoiceId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Session ID and invoice ID are required.",
        },
        { status: 400 }
      );
    }

    /*
     * Server-side trusted invoice catalog.
     *
     * In production this should come from
     * a secure database.
     */
    const trustedInvoices = {
      "INV-1048": {
        amount: 18500,
        clientId: "client-001",
      },

      "INV-1047": {
        amount: 9800,
        clientId: "client-002",
      },

      "INV-1046": {
        amount: 24000,
        clientId: "client-003",
      },

      "INV-1045": {
        amount: 13750,
        clientId: "client-004",
      },

      "INV-1044": {
        amount: 7420,
        clientId: "client-005",
      },
    };

    const trustedInvoice =
      trustedInvoices[invoiceId];

    if (!trustedInvoice) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invoice is not authorized for payment verification.",
        },
        { status: 404 }
      );
    }

    /*
     * Retrieve the Checkout Session directly
     * from Stripe using the server secret key.
     */
    const session =
      await stripe.checkout.sessions.retrieve(
        sessionId
      );

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Stripe Checkout Session not found.",
        },
        { status: 404 }
      );
    }

    /*
     * Verify Checkout mode.
     */
    if (session.mode !== "payment") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid Stripe Checkout session mode.",
        },
        { status: 400 }
      );
    }

    /*
     * Verify invoice identity.
     */
    const stripeInvoiceId =
      session.metadata?.invoiceId;

    if (stripeInvoiceId !== invoiceId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invoice verification failed.",
        },
        { status: 403 }
      );
    }

    /*
     * Verify client ownership metadata.
     */
    const stripeClientId =
      session.metadata?.clientId;

    if (!stripeClientId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Client ownership information is missing.",
        },
        { status: 403 }
      );
    }

    if (
      stripeClientId !==
      trustedInvoice.clientId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Client ownership verification failed.",
        },
        { status: 403 }
      );
    }

    /*
     * Verify currency.
     */
    if (
      String(session.currency).toLowerCase() !==
      "usd"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unexpected payment currency.",
        },
        { status: 400 }
      );
    }

    /*
     * Verify the amount charged by Stripe.
     *
     * Stripe stores amounts in cents.
     */
    const expectedAmountCents = Math.round(
      Number(trustedInvoice.amount) * 100
    );

    if (
      session.amount_total !==
      expectedAmountCents
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment amount verification failed.",
        },
        { status: 400 }
      );
    }

    /*
     * Verify final Stripe payment status.
     */
    if (session.payment_status !== "paid") {
      return NextResponse.json({
        success: false,
        paid: false,
        paymentStatus:
          session.payment_status,
        message:
          "Payment has not been completed.",
      });
    }

    /*
     * Everything passed.
     */
    return NextResponse.json({
      success: true,
      paid: true,

      paymentStatus:
        session.payment_status,

      invoiceId:
        stripeInvoiceId,

      clientId:
        stripeClientId,

      amount:
        session.amount_total
          ? session.amount_total / 100
          : 0,

      currency:
        session.currency,

      paymentDate:
        new Date()
          .toISOString()
          .split("T")[0],

      sessionId:
        session.id,
    });
  } catch (error) {
    console.error(
      "Stripe Verification Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Unable to verify Stripe payment.",
      },
      { status: 500 }
    );
  }
}