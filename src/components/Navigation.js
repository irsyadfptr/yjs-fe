"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useYjsContext } from "./YjsProvider";
import { usePresence } from "../hooks/usePresence";

export default function Navigation() {
  const pathname = usePathname();
  const { provider, status } = useYjsContext();
  const users = usePresence(provider);

  const activeUsers = Array.from(users.values()).filter((s) => s.user);

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

              <div className="absolute translate-y-5 -space-x-1.5 mt-2 h-5">
                {usersOnThisRoute.map((state, i) => (
                  <div
                    key={i}
                    className="w-5 h-5 rounded-full border border-white flex items-center justify-center text-[10px] font-bold shadow-sm cursor-default"
                    style={{
                      backgroundColor: state.user.color,
                      color: state.user.textColor,
                    }}
                    title={`${state.user.name} is here`}
                  >
                    {state.user.name.charAt(0)}
                  </div>
                ))}
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
      </div>
    </nav>
  );
}
