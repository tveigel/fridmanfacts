// src/app/layout.js
import localFont from "next/font/local";
import "../styles/globals.css";
import { AuthProvider } from "../lib/context/AuthContext";
import { NotificationsProvider } from "../lib/context/NotificationsContext";
import { FactCheckSettingsProvider } from "../lib/context/FactCheckSettingsContext";
import { LoginModalProvider } from "../lib/context/LoginModalContext";
import ErrorBoundary from "../components/common/ErrorBoundary";
import Navbar from "../components/common/Navbar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Fact-Check Platform",
  description: "A platform for fact-checking podcast episodes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <LoginModalProvider>
            <NotificationsProvider>
              <FactCheckSettingsProvider>
                <ErrorBoundary>
                  <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-1 bg-gray-50 pt-20">
                      {children}
                    </main>
                  </div>
                </ErrorBoundary>
              </FactCheckSettingsProvider>
            </NotificationsProvider>
          </LoginModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}