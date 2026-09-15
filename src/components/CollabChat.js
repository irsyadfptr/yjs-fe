"use client";
import { useEffect, useState } from 'react';

export default function CollabChat({ doc, userName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (!doc) return;
    
    const yMessages = doc.getArray('chat');

    const updateMessages = () => {
      setMessages(yMessages.toArray());
    };

    yMessages.observe(updateMessages);
    updateMessages(); 

    return () => yMessages.unobserve(updateMessages);
  }, [doc]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !doc) return;
    
    const yMessages = doc.getArray('chat');
    
    yMessages.push([{ id: Date.now(), text: input, user: userName }]);
    setInput('');
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm flex flex-col h-[400px]">
      <h2 className="font-semibold text-lg mb-4">Collaborative Chat</h2>
      <div className="flex-1 overflow-y-auto mb-4 space-y-2">
        {messages.map((msg) => (
          <div key={msg.id} className="bg-slate-100 p-2 rounded-md">
            <span className="font-bold text-sm">{msg.user}:</span> {msg.text}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="flex gap-2">
        <input 
          className="border rounded-md px-3 py-2 flex-1"
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Type a message..."
        />
        <button type="submit" className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800">
          Send
        </button>
      </form>
    </div>
  );
}