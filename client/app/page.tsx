'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
];

export default function HomePage() {
  const router = useRouter();
  const [lang, setLang] = useState('javascript');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function createRoom() {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang }),
      });

      if (!res.ok) {
        throw new Error('Could not create room');
      }

      const data = await res.json();
      router.push(`/room/${data.roomId}`);
    } catch {
      setError('Could not create a room. Check that the backend is running.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">
            Code<span className="text-blue-500">Pad</span>
          </h1>
          <p className="text-gray-500">
            Real-time collaborative code editor.
            Share the link and start coding together instantly.
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <p className="text-gray-400 text-sm font-medium mb-3">
            Choose language
          </p>

          <div className="grid grid-cols-2 gap-2 mb-6">
            {LANGUAGES.map((l) => (
              <button
                key={l.value}
                onClick={() => setLang(l.value)}
                className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
                  lang === l.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          <button
            onClick={createRoom}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl py-3 transition-colors"
          >
            {loading ? 'Creating room...' : 'Create Room ->'}
          </button>

          {error && (
            <p className="text-center text-red-400 text-xs mt-4">
              {error}
            </p>
          )}

          <p className="text-center text-gray-600 text-xs mt-4">
            No login required. Share the URL to collaborate.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: '01', text: 'Create a room' },
            { icon: '02', text: 'Share the link' },
            { icon: '03', text: 'Code together' },
          ].map((item) => (
            <div key={item.icon} className="text-gray-600">
              <p className="text-sm font-mono mb-1">{item.icon}</p>
              <p className="text-xs">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
