import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Logic Looper",
  description: "Daily logic puzzles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: { 
          colorPrimary: '#414BEA', // Match your Royal Blue
          colorText: '#222222',
        },
        elements: {
          // Force the avatar to be visible and styled
          avatarBox: "h-10 w-10 border-2 border-primary hover:scale-105 transition-all"
        }
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* Updated Header to use your new variables (bg-background / border-border) */}
            <header className="flex justify-between items-center p-4 border-b border-border bg-background">
              {/* Added Title to Header so it looks better */}
              <div className="font-bold text-xl tracking-tight">
                Logic<span className="text-primary">Looper</span>
              </div>

              <div>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:brightness-110 transition">
                      Sign In
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <UserButton 
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        userButtonAvatarBox: "w-9 h-9 border-2 border-primary/20 hover:border-primary transition-colors"
                      }
                    }}
                  />
                </SignedIn>
              </div>
            </header>

            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}