"use client";

export default function HistoryPage() {
  return (
    <div style={{ animation: 'fadeUp 0.6s ease both' }}>
      <div className="mb-8">
        <h1 className="text-3xl mb-1"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif", color: '#ededed', letterSpacing: '-0.02em' }}>
          Send History
        </h1>
        <p className="text-sm"
          style={{ fontFamily: "'DM Sans', sans-serif", color: '#888888' }}>
          Your recent sends to Kindle
        </p>
      </div>

      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
          style={{ background: 'rgba(136,136,136,0.08)', border: '1px solid rgba(136,136,136,0.1)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#555555" strokeWidth="1.5"/>
            <path d="M12 7v5l3 3" stroke="#555555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-sm mb-1" style={{ fontFamily: "'DM Sans', sans-serif", color: '#888888' }}>
          No sends yet
        </p>
        <p className="text-xs" style={{ fontFamily: "'DM Sans', sans-serif", color: '#555555' }}>
          Your send history will appear here
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
