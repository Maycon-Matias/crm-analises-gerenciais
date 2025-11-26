import type React from "react";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/hooks/use-auth";
import { ClientesProvider } from "@/hooks/use-clientes";
import { AnalyticsProvider } from "@/hooks/use-analytics";
import { ConfigProvider } from "@/hooks/use-config";
import { SistemaProvider } from "@/hooks/use-sistema";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SistemaProvider>
              <ConfigProvider>
                <ClientesProvider>
                  <AnalyticsProvider>
                    <Suspense fallback={null}>
                      {children}
                      <Toaster />
                    </Suspense>
                  </AnalyticsProvider>
                </ClientesProvider>
              </ConfigProvider>
            </SistemaProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

export const metadata = {
  generator: "v0.dev",
};
