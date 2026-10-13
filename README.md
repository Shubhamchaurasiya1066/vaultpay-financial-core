# VaultPay Financial Core

VaultPay is a fintech dashboard built to simplify invoice management and online payments. The project focuses on two main user roles: administrators who manage billing operations and clients who can view their invoices, download PDF copies, and make payments through Stripe Checkout.

This project was developed as part of the Prodesk IT Major Internship Program, Sprint 20 — Client Delivery Phase III, under Track A.

## Features

### Admin Dashboard
- Overview of invoice and revenue activity.
- Revenue and invoice status charts.
- Create and manage invoices.
- View client information and billing records.

### Client Portal
- Dedicated dashboard for clients.
- View invoices and their current payment status.
- Open individual invoice details.
- Download invoices as PDF files.
- Pay eligible invoices through Stripe Checkout.

### Authentication and Access Control
- Separate admin and client areas.
- Role-based route protection.
- Unauthorized role access is restricted through the application's route guards.

### Stripe Checkout
- Checkout sessions are created through a server-side API route.
- Invoice information is validated before creating a payment session.
- Payment success and cancellation return to the relevant invoice page.
- Stripe webhook handling is included for checkout events.

### Invoice PDF
- PDF invoices are generated through a backend API route.
- Clients can download a PDF from the invoice detail page.

## Tech Stack

- Next.js
- React
- Tailwind CSS
- Redux Toolkit, where used by the application
- Recharts
- Lucide React
- Framer Motion
- Stripe Checkout
- PDFKit
- JavaScript

## Getting Started

### Prerequisites

- Node.js
- npm
- A Stripe account for test payments

### Installation

Clone the repository:

```bash
git clone https://github.com/Shubhamchaurasiya1066/vaultpay-financial-core.git
cd vaultpay-financial-core
npm install
```

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
STRIPE_WEBHOOK_SECRET=your_webhook_signing_secret
```

Replace the example values with your own Stripe test credentials. Never commit real API keys or webhook secrets to GitHub.

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
```

## Demo Accounts

The following demo credentials are configured in the current application:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@vaultpay.com` | `admin123` |
| Client | `client@vaultpay.com` | `client123` |

These are development/demo credentials only. Do not use them for a real financial service.

## Stripe Testing

Use Stripe test mode and a supported test card, such as:

- Card number: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any three digits

A successful test checkout should return to the invoice page. Verify the invoice status and webhook behavior separately; a redirect alone does not prove that payment was securely recorded.

## Deployment

The application is deployed on Vercel:

https://vaultpay-financial-core-sepia.vercel.app/

For deployment, configure the required environment variables in Vercel and redeploy the application. Configure the Stripe webhook endpoint to point to the deployed `/api/stripe/webhook` route and use the signing secret generated for that endpoint.

## Current Implementation Notes

The application uses browser local storage for demo authentication and invoice data. The checkout API also uses a server-side trusted invoice catalog to validate supported invoices.

This setup is intended for the internship demonstration. A production financial application would require persistent server-side invoice storage and verified server-side user authentication, with ownership and payment status enforced by the backend.

## Project Goals

The goal of this sprint was to bring together invoice management, role-based navigation, Stripe Checkout, and downloadable PDF invoices in a single fintech-style application.

The project helped me work through frontend architecture, API integration, payment-flow handling, access control, and deployment troubleshooting.

## Author

**Shubham Chaurasiya**

GitHub: https://github.com/Shubhamchaurasiya1066
