"use client";
import { usePresence } from "../hooks/usePresence";

export default function LiveAvatars({ provider }) {
  const users = usePresence(provider);

  if (!provider) return null;
  const clientID = provider.awareness.clientID;

  // Filter out connected clients that haven't initialized their user object yet
  const activeUsers = Array.from(users.entries()).filter(
    ([id, state]) => state.user,
  );

  return (
    <div className="flex -space-x-2">
      {activeUsers.map(([id, state]) => {
        const isMe = id === clientID;
        return (
          <div
            key={id}
            className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-white text-white font-bold text-sm shadow-sm"
            style={{ backgroundColor: state.user.color }}
            title={isMe ? `${state.user.name} (You)` : state.user.name}
          >
            {state.user.name.charAt(0)}
          </div>
        );
      })}
    </div>
  );
}
