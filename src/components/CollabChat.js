"use client";
import { useEffect, useState } from "react";

export default function CollabChat({ doc, userName, color }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!doc) return;

    const yMessages = doc.getArray("chat");

    const updateMessages = () => {
      console.time("⏱️ [Y.Array] React Render");

      const rawArray = yMessages.toArray();
      // console.log("🔍 [Y.Array State] Extracted List:", yMessages, "=>", rawArray);

      setMessages(rawArray);

      console.timeEnd("⏱️ [Y.Array] React Render");
    };

    // Listen for changes
    const observer = (event) => {
      // console.log("⚡ [Y.Array Event] Delta received from CRDT engine!");
      updateMessages();
    };

    yMessages.observe(observer);
    updateMessages();

    return () => yMessages.unobserve(observer);
  }, [doc]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !doc) return;

    // console.log("📤 [Yjs Action] Pushing new message to Y.Array...");
    const yMessages = doc.getArray("chat");

    yMessages.push([
      {
        id: Date.now(),
        text: input,
        user: userName,
        color,
      },
    ]);

    setInput("");
  };

  const clearChat = () => {
    if (!doc) return;
    const yMessages = doc.getArray("chat");
    yMessages.delete(0, yMessages.length);
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm flex flex-col h-[500px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">Collaborative Chat</h2>
        <button
          onClick={clearChat}
          className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full hover:bg-red-200 transition-colors"
        >
          Clear Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
        {messages.map((msg) => {
          // Check if this message belongs to the current user
          const isMe = msg.user === userName;

          return (
            <div
              key={msg.id}
              // Use flex-row-reverse to push your own messages to the right
              className={`flex items-start gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* User Initial Circle */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm"
                style={{ backgroundColor: msg.color || "#94a3b8" }}
              >
                {msg.user ? msg.user.charAt(0).toUpperCase() : "?"}
              </div>

              {/* Chat Bubble & Name */}
              <div
                className={`flex flex-col max-w-[80%] ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`p-3 rounded-2xl text-sm shadow-sm ${
                    isMe
                      ? "bg-black text-white rounded-tr-none" // Your messages: Dark bubble, flat top-right corner
                      : "bg-slate-100 text-gray-800 rounded-tl-none" // Others: Light bubble, flat top-left corner
                  }`}
                >
                  {msg.text}
                </div>
                <span
                  className={`text-[10px] text-gray-400 mt-1 font-medium tracking-wide ${isMe ? "mr-1" : "ml-1"}`}
                >
                  {isMe ? "You" : msg.user}
                </span>
              </div>
            </div>
          );
        })}

        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
            No messages yet. Start yapping!
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="flex gap-2 mt-auto">
        <input
          className="border rounded-md px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="bg-black text-white px-5 py-2 rounded-md hover:bg-gray-800 transition-colors font-medium"
        >
          Send
        </button>
      </form>
    </div>
  );
}
