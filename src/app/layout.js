import "./globals.css";
import { Toaster } from "sonner";

export const metadata = {
  title: "VaultPay — Financial Core",
  description:
    "Secure financial billing and payment management platform for Nexus Corporate Services.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          theme="dark"
          richColors
        />
      </body>
    </html>
  );
}