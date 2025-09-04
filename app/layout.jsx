import './globals.css';

export const metadata = {
  title: 'Attendance System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <nav className="bg-slate-800/30 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Attendance System
              </h1>
              <div className="flex items-center space-x-6">
                <a href="/rosters" className="text-slate-300 hover:text-cyan-400 transition-colors duration-300">
                  Rosters
                </a>
                <a href="/sessions" className="text-slate-300 hover:text-cyan-400 transition-colors duration-300">
                  Sessions
                </a>
                <a href="/attendance" className="text-slate-300 hover:text-cyan-400 transition-colors duration-300">
                  Attendance
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
