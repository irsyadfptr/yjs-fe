"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useYjsContext } from "./YjsProvider";
import { usePresence } from "../hooks/usePresence";
import LiveAvatars from "./LiveAvatars";

export default function Navigation() {
  const pathname = usePathname();
  const { provider, status, handleLogout, name } = useYjsContext();
  const users = usePresence(provider);

  const activeUsers = Array.from(users.values())
    .filter((s) => s.user)
    .filter(
      (state, index, self) =>
        index === self.findIndex((t) => t.user.name === state.user.name),
    );

  const routes = [
    { name: "Form", path: "/form" },
    { name: "Chat", path: "/chat" },
    { name: "Canvas", path: "/canvas" },
  ];

  return (
    <nav className="bg-white border-b px-8 py-3 flex justify-between items-start sticky top-0 z-40 shadow-sm">
      {" "}
      <div className="flex gap-8 mt-1">
        {routes.map((route) => {
          const isActive = pathname === route.path;

          const usersOnThisRoute = activeUsers.filter(
            (u) => u.user.location === route.path,
          );

          return (
            <div
              key={route.path}
              className="flex flex-col items-center relative"
            >
              <Link
                href={route.path}
                className={`font-medium px-4 py-2 rounded-md transition-colors ${
                  isActive
                    ? "bg-black text-white"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                {route.name}
              </Link>

              <div className="absolute translate-y-5 mt-2 h-5 flex flex-row">
                <LiveAvatars users={usersOnThisRoute} size="sm" />
              </div>
            </div>
          );
        })}
      </div>
      {/* Global Status Indicator */}
      <div className="flex gap-4 items-center py-2">
        <div
          className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border text-xs font-semibold capitalize"
          title={
            status === "connected" ? "Connected to server" : "Working offline"
          }
        >
          <span
            className={`w-2 h-2 rounded-full ${
              status === "connected"
                ? "bg-green-500 animate-pulse"
                : status === "connecting"
                  ? "bg-yellow-400"
                  : "bg-red-500"
            }`}
          ></span>
          <span
            className={
              status === "disconnected" ? "text-red-600" : "text-gray-600"
            }
          >
            {status}
          </span>
        </div>
        <span className="text-sm font-medium text-gray-500">
          {activeUsers.length} Online
        </span>

        {name && (
          <div className="flex items-center gap-3 border-l pl-4 ml-2">
            <span
              className="text-sm font-medium text-gray-700 truncate max-w-[100px]"
              title={name}
            >
              Hi, {name.split(" ")[0]}
            </span>
            <button
              onClick={handleLogout}
              className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-200 transition-colors font-medium border border-gray-200"
            >
              Leave
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
