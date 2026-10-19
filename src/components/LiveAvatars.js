"use client";
import { usePresence } from "../hooks/usePresence";

export default function LiveAvatars({ provider, users: usersProp, size = "md" }) {
  const presenceMap = usePresence(usersProp ? undefined : provider);

  const activeUsers = usersProp
    ? usersProp
    : Array.from(presenceMap.entries())
        .filter(([, state]) => state.user)
        .map(([, state]) => state);

  const clientID = provider?.awareness?.clientID;

  const dims =
    size === "sm"
      ? "w-5 h-5 text-[10px] border"
      : "w-10 h-10 text-sm border-2";

  return (
    <div className="flex -space-x-2">
      {activeUsers.map((state, i) => {
        const isMe = clientID && state.user.clientID === clientID;
        return (
          <div
            key={state.user.name + i}
            className={`flex items-center justify-center ${dims} rounded-full border-white font-bold shadow-sm`}
            style={{
              backgroundColor: state.user.color,
              color: state.user.textColor || "#fff",
              zIndex: activeUsers.length - i,
            }}
            title={isMe ? `${state.user.name} (You)` : state.user.name}
          >
            {state.user.name.charAt(0).toUpperCase()}
          </div>
        );
      })}
    </div>
  );
}
