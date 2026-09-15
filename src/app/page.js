"use client";
import { useYjs } from '../hooks/useYjs';
import CollabChat from '../components/CollabChat';
import CollabForm from '../components/CollabForm';

export default function Home() {
  const { doc, provider } = useYjs('my-demo-room');

  if (!doc) {
    return <div className="p-8 text-center">Connecting to server...</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Local Collaborative Workspace</h1>
          <p className="text-gray-500">Powered by Next.js, WebSockets, and Yjs</p>
          <div className="mt-2 text-sm text-green-600 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Connected to ws://localhost:1234
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <CollabForm doc={doc} />
          <CollabChat doc={doc} />
        </div>
      </div>
    </main>
  );
}