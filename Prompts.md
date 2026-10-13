# Development Notes — VaultPay Financial Core

This file records the main development tasks and decisions behind VaultPay. I kept the work focused on the sprint requirements and tested each major part before moving to the next one.

## 1. Project Setup and UI

**Task:** Set up the Next.js application and create a consistent fintech dashboard.

**Development notes:**
- Organize the application into reusable components and route groups.
- Create a dark fintech-inspired visual style with clear typography and spacing.
- Build reusable cards, buttons, badges, navigation, and layout components.
- Make the dashboard usable on different screen sizes.

## 2. Admin Dashboard

**Task:** Build the administrator's main workspace.

**Development notes:**
- Show invoice and revenue summaries.
- Add charts for revenue and invoice status.
- Provide navigation to invoices, clients, and revenue-related pages.
- Keep the most useful billing information visible without overcrowding the page.

## 3. Invoice Management

**Task:** Implement invoice listing, creation, and detail pages.

**Development notes:**
- Maintain invoice IDs, client information, amounts, and statuses.
- Add a form for creating invoices.
- Display invoice details in a readable format.
- Handle missing invoice IDs and invalid form values gracefully.

## 4. Client Portal and Access Control

**Task:** Separate the client experience from the administrator experience.

**Development notes:**
- Create a dedicated client dashboard and invoice list.
- Restrict admin and client routes based on the current role.
- Check that a client sees only the invoices associated with that client.
- Test direct URL access instead of relying only on navigation links.

**Testing reminder:** Browser-side route guards improve the demo experience but do not replace server-side authorization.

## 5. Stripe Checkout

**Task:** Connect eligible invoices to Stripe Checkout.

**Development notes:**
- Create the checkout session through a server-side API route.
- Validate the invoice before starting payment.
- Keep secret Stripe credentials on the server.
- Show a loading state while the checkout request is running.
- Prevent repeated clicks while a checkout request is in progress.
- Handle success, cancellation, and API errors.

**Testing reminder:** Test successful checkout, cancelled checkout, missing invoice IDs, and invoices that are already paid. Verify the payment status independently of the browser redirect.

## 6. Stripe Webhook

**Task:** Add a webhook endpoint for Stripe Checkout events.

**Development notes:**
- Verify incoming webhook signatures.
- Handle relevant checkout events.
- Log and investigate failed webhook processing.
- Use the correct webhook signing secret for the current environment.

**Follow-up consideration:** For a production implementation, payment status should be persisted by the backend after verifying the Stripe event and matching it to the relevant invoice.

## 7. PDF Invoice Download

**Task:** Allow clients to download a PDF from an invoice detail page.

**Development notes:**
- Generate the PDF through a server-side route.
- Return a downloadable PDF response.
- Use the invoice ID to identify the requested document.
- Test the download from the client portal.

**Testing reminder:** In production, the server should load the invoice from trusted storage and verify that the requester is allowed to access it before generating the PDF.

## 8. Build and Deployment

**Task:** Prepare the application for deployment.

**Development notes:**
- Run the production build and fix any compilation errors.
- Keep local secrets out of version control.
- Configure the required environment variables in Vercel.
- Configure the Stripe webhook for the deployed URL.
- Test the deployed site rather than relying only on local results.

## 9. Issues Encountered

During development, I worked through issues involving invoice validation, Stripe Checkout session creation, environment configuration, and deployment testing.

One important lesson was that an invoice displayed in the browser is not automatically a trusted invoice on the server. The checkout API needs its own validation before creating a payment session.

## 10. Possible Improvements

- Replace local storage as the source of invoice records with a persistent database.
- Introduce verified server-side authentication and authorization.
- Persist webhook-confirmed payment status.
- Add automated tests for role restrictions and payment edge cases.
- Improve error reporting and operational logging.

## Final Note

The focus of this sprint was to connect the main billing features into one usable workflow. These notes capture the implementation areas, testing considerations, and improvements identified during development.
