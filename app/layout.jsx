import './globals.css';

export const metadata = {
  title: 'Attendance System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <main className="max-w-5xl mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}
