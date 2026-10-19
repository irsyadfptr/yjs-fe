"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { usePresence } from "../hooks/usePresence";

export default function LiveCursors({ provider }) {
  const users = usePresence(provider);
  const pathname = usePathname();

  useEffect(() => {
    if (!provider) return;

    const handlePointerMove = (e) => {
      provider.awareness.setLocalStateField("cursor", {
        x: e.clientX,
        y: e.clientY,
      });
    };

    const handlePointerLeave = () => {
      provider.awareness.setLocalStateField("cursor", null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [provider]);

  if (!provider) return null;
  const clientID = provider.awareness.clientID;

  return (
    <>
      {Array.from(users.entries()).map(([id, state]) => {
        // FILTER APPLIED HERE:
        // Do not render if it's our own cursor, if they have no cursor state,
        // or if they are NOT on the same page as us.
        if (
          id === clientID ||
          !state.cursor ||
          !state.user ||
          state.user.location !== pathname
        ) {
          return null;
        }

        return (
          <div
            key={id}
            className="pointer-events-none fixed top-0 left-0 z-50 transition-transform duration-75 ease-linear"
            style={{
              transform: `translate(${state.cursor.x}px, ${state.cursor.y}px)`,
            }}
          >
            <svg
              width="24"
              height="36"
              viewBox="0 0 24 36"
              fill="none"
              className="drop-shadow-md"
            >
              <path
                d="M5.65376 21.1573L2.30604 3.51351L20.8931 14.8696L11.5317 17.519L9.1235 25.1017L5.65376 21.1573Z"
                fill={state.user.color}
              />
            </svg>

            <div
              className="ml-4 mt-1 px-2 py-1 text-xs rounded-md whitespace-nowrap shadow-sm"
              style={{
                backgroundColor: state.user.color,
                color: state.user.textColor,
              }}
            >
              {state.user.name}
            </div>
          </div>
        );
      })}
    </>
  );
}
