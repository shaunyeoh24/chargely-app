import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-10 py-4">
      <div className="relative overflow-hidden bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-teal-50 rounded-full opacity-50 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-indigo-50 rounded-full opacity-50 blur-3xl" />
        
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-6">
            Your EV Analytics, <br />
            <span className="text-teal-600">Simplified.</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed">
            Track every charging session, monitor efficiency trends, and understand your true cost of ownership.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/vehicles" 
              className="px-8 py-4 bg-teal-600 text-white rounded-2xl font-bold hover:bg-teal-700 transition-all shadow-md shadow-teal-100 active:scale-95"
            >
              Get Started
            </Link>
            <Link 
              href="/sessions" 
              className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95"
            >
              View Sessions
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Track Efficiency', desc: 'Monitor Wh/km trends over time.', icon: '⚡' },
          { title: 'Cost Analysis', desc: 'See exactly how much you spend on charging.', icon: '💰' },
          { title: 'Multi-Vehicle', desc: 'Manage your entire fleet in one place.', icon: '🚗' },
        ].map((feature) => (
          <div key={feature.title} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-teal-100 transition-colors">
            <div className="text-3xl mb-4">{feature.icon}</div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
