import './globals.css';

export const metadata = { title: 'Wedding invite · Studio99 example' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
