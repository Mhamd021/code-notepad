'use client';
import { useState, useEffect, useRef, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { EditorView, ViewUpdate } from '@codemirror/view';

const WS  = process.env.NEXT_PUBLIC_WS_URL;
const API = process.env.NEXT_PUBLIC_API_URL;

// نوع الـ Operation — نفس ما في الـ backend
interface Operation {
  type: 'insert' | 'delete';
  position: number;
  char?: string;
  clientId: string;
  version: number;
}

// اختر extension الـ language
function getLanguageExtension(lang: string) {
  switch (lang) {
    case 'python':     return python();
    case 'java':       return java();
    default:           return javascript({ typescript: lang === 'typescript' });
  }
}

// clientId فريد لكل tab
const CLIENT_ID = Math.random().toString(36).slice(2);

const LANGUAGES = [
  { value: 'javascript', label: 'JS' },
  { value: 'typescript', label: 'TS' },
  { value: 'python',     label: 'PY' },
  { value: 'java',       label: 'Java' },
];

export default function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  const router = useRouter();

  const [content, setContent]   = useState('');
  const [language, setLanguage] = useState('javascript');
  const [users, setUsers]       = useState(1);
  const [connected, setConnected] = useState(false);
  const [copied, setCopied]     = useState(false);
  const [version, setVersion]   = useState(0);

  const socketRef  = useRef<Socket | null>(null);
  const versionRef = useRef(0); // نسخة ref لتجنب stale closure
  const isRemote   = useRef(false); // هل التغيير قادم من السيرفر؟

  useEffect(() => {
    const socket = io(WS!);
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join-room', { roomId, clientId: CLIENT_ID });
    });

    socket.on('disconnect', () => setConnected(false));

    // استقبال الحالة عند الانضمام
    socket.on('room-joined', (data: {
      content: string;
      version: number;
      language: string;
    }) => {
      isRemote.current = true;
      setContent(data.content);
      setLanguage(data.language);
      setVersion(data.version);
      versionRef.current = data.version;
      setTimeout(() => { isRemote.current = false; }, 50);
    });

    // استقبال operation من السيرفر
    socket.on('operation', (data: {
      operation: Operation;
      version: number;
      clientId: string;
    }) => {
      // تجاهل عملياتنا نحن — السيرفر يرسلها للجميع بمن فيهم المرسل
      if (data.clientId === CLIENT_ID) {
        versionRef.current = data.version;
        setVersion(data.version);
        return;
      }

      // طبّق الـ operation على المحتوى
      isRemote.current = true;
      setContent(prev => {
        const op = data.operation;
        if (op.type === 'insert') {
          return prev.slice(0, op.position) + op.char + prev.slice(op.position);
        }
        if (op.type === 'delete') {
          if (op.position < 0 || op.position >= prev.length) return prev;
          return prev.slice(0, op.position) + prev.slice(op.position + 1);
        }
        return prev;
      });
      versionRef.current = data.version;
      setVersion(data.version);
      setTimeout(() => { isRemote.current = false; }, 50);
    });

    socket.on('users-count', (data: { count: number }) => {
  setUsers(data.count);
});

    socket.on('language-changed', (data: { language: string }) => {
      setLanguage(data.language);
    });

    return () => { socket.disconnect(); };
  }, [roomId]);

  // لما يكتب المستخدم — نحوّل التغيير لـ operations
  const handleChange = useCallback((newValue: string, viewUpdate: ViewUpdate) => {
    if (isRemote.current) {
      setContent(newValue);
      return;
    }

    const socket = socketRef.current;
    if (!socket) return;

    // نستخرج التغييرات من CodeMirror
    viewUpdate.changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
      const deletedCount = toA - fromA;
      const insertedText = inserted.toString();

      // أولاً — أرسل delete operations
      for (let i = 0; i < deletedCount; i++) {
        const op: Operation = {
          type: 'delete',
          position: fromA,
          clientId: CLIENT_ID,
          version: versionRef.current,
        };
        socket.emit('operation', { roomId, operation: op });
      }

      // ثانياً — أرسل insert operations
      for (let i = 0; i < insertedText.length; i++) {
        const op: Operation = {
          type: 'insert',
          position: fromB + i,
          char: insertedText[i],
          clientId: CLIENT_ID,
          version: versionRef.current,
        };
        socket.emit('operation', { roomId, operation: op });
      }
    });

    setContent(newValue);
  }, [roomId]);

  function changeLanguage(lang: string) {
    setLanguage(lang);
    socketRef.current?.emit('change-language', { roomId, language: lang });
  }

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="h-screen bg-gray-950 flex flex-col">

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')}
            className="text-gray-500 hover:text-white text-sm transition-colors">
            ← CodePad
          </button>
          <div className={`flex items-center gap-1.5 text-xs ${
            connected ? 'text-green-400' : 'text-red-400'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${
              connected ? 'bg-green-400' : 'bg-red-400'
            }`}/>
            {connected ? 'Connected' : 'Reconnecting...'}
          </div>
          <span className="text-gray-600 text-xs">
            {users} {users === 1 ? 'user' : 'users'} online
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Language selector */}
          <div className="flex gap-1">
            {LANGUAGES.map(l => (
              <button key={l.value}
                onClick={() => changeLanguage(l.value)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  language === l.value
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-500 hover:text-white'
                }`}>
                {l.label}
              </button>
            ))}
          </div>

          {/* Copy link */}
          <button onClick={copyLink}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs px-3 py-1.5 rounded-lg transition-colors">
            {copied ? '✓ Copied!' : '🔗 Share'}
          </button>
        </div>
      </header>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <CodeMirror
          value={content}
          height="100%"
          theme={dracula}
          extensions={[
            getLanguageExtension(language),
            EditorView.lineWrapping,
          ]}
          onChange={handleChange}
          style={{ height: '100%', fontSize: '14px' }}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            autocompletion: true,
            bracketMatching: true,
          }}
        />
      </div>

      {/* Footer */}
      <div className="px-4 py-1.5 bg-gray-900 border-t border-gray-800 flex items-center justify-between">
        <span className="text-gray-600 text-xs font-mono">
          room: {roomId.slice(0, 8)}...
        </span>
        <span className="text-gray-600 text-xs">
          v{version} · OT sync
        </span>
      </div>

    </div>
  );
}