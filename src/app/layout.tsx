import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'ប្រព័ន្ធគ្រប់គ្រងសហគ្រាសផលិតទឹកបរិសុទ្ធ | Pure Water Factory ERP & POS',
  description: 'ប្រព័ន្ធគ្រប់គ្រងការលក់ POS បំណុល សំបកធុង និងហិរញ្ញវត្ថុសម្រាប់សហគ្រាសផលិតទឹកបរិសុទ្ធខ្នាតតូច',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="km">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-brand-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
