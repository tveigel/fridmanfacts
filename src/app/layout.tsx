"use client";

import localFont from "next/font/local";
import "../styles/globals.css";
import { AuthProvider } from "../lib/context/AuthContext";
import { NotificationsProvider } from "../lib/context/NotificationsContext";
import { FactCheckSettingsProvider } from "../lib/context/FactCheckSettingsContext";
import { LoginModalProvider } from "../lib/context/LoginModalContext";
import ErrorBoundary from "../components/common/ErrorBoundary";
import Navbar from "../components/common/Navbar";
import WelcomeModalContainer from '../components/auth/WelcomeModalContainer';
import { UsernameProvider } from '../lib/context/UsernameContext';


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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <LoginModalProvider>
            <UsernameProvider>
              <NotificationsProvider>
                <FactCheckSettingsProvider>
                  <ErrorBoundary>
                    <div className="min-h-screen flex flex-col">
                      <Navbar />
                      <main className="flex-1 bg-gray-50 pt-20">
                        {children}
                      </main>
                    </div>
                    <WelcomeModalContainer />
                  </ErrorBoundary>
                </FactCheckSettingsProvider>
              </NotificationsProvider>
            </UsernameProvider>
          </LoginModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}