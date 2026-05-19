'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL;

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python',     label: 'Python' },
  { value: 'java',       label: 'Java' },
];

export default function HomePage() {
  const router   = useRouter();
  const [lang, setLang]       = useState('javascript');
  const [loading, setLoading] = useState(false);

  async function createRoom() {
    setLoading(true);
    const res = await fetch(`${API}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: lang }),
    });
    const data = await res.json();
    router.push(`/room/${data.roomId}`);
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">
            Code<span className="text-blue-500">Pad</span>
          </h1>
          <p className="text-gray-500">
            Real-time collaborative code editor.
            Share the link — start coding together instantly.
          </p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <p className="text-gray-400 text-sm font-medium mb-3">
            Choose language
          </p>

          {/* Language selector */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {LANGUAGES.map(l => (
              <button key={l.value}
                onClick={() => setLang(l.value)}
                className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
                  lang === l.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}>
                {l.label}
              </button>
            ))}
          </div>

          <button onClick={createRoom} disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl py-3 transition-colors">
            {loading ? 'Creating room...' : 'Create Room →'}
          </button>

          <p className="text-center text-gray-600 text-xs mt-4">
            No login required — share the URL to collaborate
          </p>
        </div>

        {/* How it works */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: '🚀', text: 'Create a room' },
            { icon: '🔗', text: 'Share the link' },
            { icon: '⚡', text: 'Code together' },
          ].map((item, i) => (
            <div key={i} className="text-gray-600">
              <p className="text-2xl mb-1">{item.icon}</p>
              <p className="text-xs">{item.text}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}