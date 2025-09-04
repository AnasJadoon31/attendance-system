import Link from 'next/link';

export default function HomePage() {
  const cards = [
    {
      href: '/attendance',
      title: 'Take Attendance',
      description: 'Record student attendance for sessions',
      icon: '✅',
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      href: '/sessions',
      title: 'Attendance History',
      description: 'View and manage attendance records',
      icon: '📊',
      gradient: 'from-blue-500 to-purple-500'
    },
    {
      href: '/rosters',
      title: 'Manage Students',
      description: 'Add students and manage class rosters',
      icon: '👥',
      gradient: 'from-purple-500 to-pink-500'
    },
  ];

  return (
    <div className="container mx-auto px-6 py-16 max-w-7xl">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4">
          Welcome to Attendance System
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
          Modern, efficient attendance management for educational institutions
        </p>
        <div className="h-1 w-24 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mx-auto mt-6"></div>
      </div>

      <div className="grid gap-8 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group relative bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 h-64 flex flex-col justify-between hover:border-slate-600/50 transition-all duration-300 transform hover:scale-105 shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative z-10">
              <div className={`w-16 h-16 bg-gradient-to-r ${card.gradient} rounded-2xl flex items-center justify-center text-2xl mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
                {card.icon}
              </div>

              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors duration-300">
                {card.title}
              </h3>

              <p className="text-slate-300 text-sm leading-relaxed">
                {card.description}
              </p>
            </div>

            <div className="relative z-10 flex items-center text-cyan-400 text-sm font-medium group-hover:text-cyan-300 transition-colors duration-300">
              <span>Get Started</span>
              <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-16 text-center">
        <div className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4">Quick Start Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-300">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold mb-3">1</div>
              <p className="text-sm">Create rosters and import students</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold mb-3">2</div>
              <p className="text-sm">Create attendance sessions</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold mb-3">3</div>
              <p className="text-sm">Take and track attendance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
