import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY
);

export async function POST(request) {
  try {
    /*
     * Stripe sends the raw request body.
     *
     * IMPORTANT:
     * We must NOT use request.json()
     * because Stripe signature verification
     * requires the original raw body.
     */
    const rawBody = await request.text();

    const signature =
      request.headers.get(
        "stripe-signature"
      );

    if (!signature) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing Stripe signature.",
        },
        { status: 400 }
      );
    }

    const webhookSecret =
      process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error(
        "STRIPE_WEBHOOK_SECRET is not configured."
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Stripe webhook secret is not configured.",
        },
        { status: 500 }
      );
    }

    let event;

    /*
     * Verify that the webhook request
     * actually came from Stripe.
     */
    try {
      event =
        stripe.webhooks.constructEvent(
          rawBody,
          signature,
          webhookSecret
        );
    } catch (error) {
      console.error(
        "Stripe webhook signature verification failed:",
        error.message
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid Stripe webhook signature.",
        },
        { status: 400 }
      );
    }

    console.log(
      `Stripe webhook received: ${event.type}`
    );

    /*
     * Handle successful Checkout payment.
     */
    if (
      event.type ===
      "checkout.session.completed"
    ) {
      const session =
        event.data.object;

      const invoiceId =
        session.metadata?.invoiceId;

      const clientId =
        session.metadata?.clientId;

      if (!invoiceId) {
        console.warn(
          "Webhook session does not contain an invoice ID."
        );

        return NextResponse.json({
          received: true,
          processed: false,
          message:
            "Invoice ID missing from Stripe metadata.",
        });
      }

      if (!clientId) {
        console.warn(
          "Webhook session does not contain a client ID."
        );

        return NextResponse.json({
          received: true,
          processed: false,
          message:
            "Client ID missing from Stripe metadata.",
        });
      }

      /*
       * Only treat the event as a successful
       * payment when Stripe confirms the payment.
       */
      if (
        session.payment_status !==
        "paid"
      ) {
        console.log(
          `Invoice ${invoiceId} checkout completed but payment status is ${session.payment_status}.`
        );

        return NextResponse.json({
          received: true,
          processed: false,
          message:
            "Payment is not confirmed as paid.",
        });
      }

      /*
       * At this point:
       *
       * - Stripe signature is valid
       * - Invoice ID exists
       * - Client ID exists
       * - Payment status is paid
       *
       * The actual invoice update will be moved
       * to server-side persistent storage when
       * VaultPay moves away from localStorage.
       */
      console.log(
        "Verified Stripe payment:",
        {
          sessionId: session.id,
          invoiceId,
          clientId,
          amount:
            session.amount_total
              ? session.amount_total / 100
              : 0,
          currency:
            session.currency,
          paymentStatus:
            session.payment_status,
        }
      );
    }

    /*
     * Handle expired Checkout Sessions.
     */
    if (
      event.type ===
      "checkout.session.expired"
    ) {
      const session =
        event.data.object;

      console.log(
        `Stripe Checkout Session expired: ${session.id}`
      );
    }

    /*
     * Stripe expects a successful HTTP response
     * after the event has been received.
     */
    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error(
      "Stripe Webhook Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Unable to process Stripe webhook.",
      },
      { status: 500 }
    );
  }
}