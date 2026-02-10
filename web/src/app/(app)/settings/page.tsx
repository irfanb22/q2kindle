"use client";

export default function SettingsPage() {
  return (
    <div style={{ animation: 'fadeUp 0.6s ease both' }}>
      <div className="mb-8">
        <h1 className="text-3xl mb-1"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif", color: '#ededed', letterSpacing: '-0.02em' }}>
          Settings
        </h1>
        <p className="text-sm"
          style={{ fontFamily: "'DM Sans', sans-serif", color: '#888888' }}>
          Configure your Kindle email and sending preferences
        </p>
      </div>

      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
          style={{ background: 'rgba(136,136,136,0.08)', border: '1px solid rgba(136,136,136,0.1)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke="#555555" strokeWidth="1.5"/>
            <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" stroke="#555555" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="text-sm mb-1" style={{ fontFamily: "'DM Sans', sans-serif", color: '#888888' }}>
          Settings coming soon
        </p>
        <p className="text-xs" style={{ fontFamily: "'DM Sans', sans-serif", color: '#555555' }}>
          This will be built in Phase 5
        </p>
      </div>

      <style jsx>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
