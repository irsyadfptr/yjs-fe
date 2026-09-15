"use client";
import { useState } from 'react';
import { useYjs } from '../hooks/useYjs';
import CollabChat from '../components/CollabChat';
import CollabForm from '../components/CollabForm';
import LiveAvatars from '../components/LiveAvatars';
import LiveCursors from '../components/LiveCursors';

export default function Home() {
  const [nameInput, setNameInput] = useState('');
  const [userName, setUserName] = useState('');

  // The hook will stay idle until userName is set
  const { doc, provider } = useYjs('my-demo-room', userName);

  const handleJoin = (e) => {
    e.preventDefault();
    if (nameInput.trim()) {
      setUserName(nameInput.trim());
    }
  };

  // 1. Show Name Entry Modal if user hasn't joined yet
  if (!userName) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <form onSubmit={handleJoin} className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full">
          <h2 className="text-2xl font-bold mb-2">Join Workspace</h2>
          <p className="text-gray-500 mb-6 text-sm">Enter your name to collaborate with others.</p>
          
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="e.g. Jane Doe"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            autoFocus
            required
          />
          <button type="submit" className="w-full bg-black text-white rounded-md py-2 font-medium hover:bg-gray-800 transition-colors">
            Enter Room
          </button>
        </form>
      </div>
    );
  }

  // 2. Show Loading State while Yjs connects
  if (!doc || !provider) {
    return <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">Connecting to workspace...</div>;
  }

  // 3. Show the actual Collaborative Workspace
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <LiveCursors provider={provider} />

      <div className="max-w-5xl mx-auto space-y-8">
        <header className="mb-8 flex justify-between items-end border-b pb-6 border-gray-200">
          <div>
            <h1 className="text-3xl font-bold">Local Collaborative Workspace</h1>
            <div className="mt-2 text-sm text-green-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Connected as <span className="font-semibold text-black">{userName}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <span className="text-sm text-gray-500 font-medium">Who&apos;s here</span>
            <LiveAvatars provider={provider} />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <CollabForm doc={doc} />
          <CollabChat doc={doc} userName={userName} />
        </div>
      </div>
    </main>
  );
}