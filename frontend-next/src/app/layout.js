import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from '@/components/providers/Providers';

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "Katomaran Task Management",
  description: "Professional task management application with real-time collaboration",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
