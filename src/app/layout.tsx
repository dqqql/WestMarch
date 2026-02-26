import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";
import { ResourcesProvider } from "@/contexts/ResourcesContext";
import { DocumentsProvider } from "@/contexts/DocumentsContext";
import { SettingsProvider } from "@/contexts/SettingsContext";

export const metadata: Metadata = {
  title: "不冻港的西征世界 - D&D Campaign Portal",
  description: "A lightweight Dockerized D&D campaign portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <AppProvider>
              <ResourcesProvider>
                <DocumentsProvider>
                  <SettingsProvider>
                    {children}
                  </SettingsProvider>
                </DocumentsProvider>
              </ResourcesProvider>
            </AppProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
