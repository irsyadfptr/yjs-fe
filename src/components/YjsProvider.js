"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { IndexeddbPersistence } from "y-indexeddb";
import LiveCursors from "./LiveCursors";

// Helper: Determine if text should be black or white based on background HEX
function getContrastTextColor(hexColor) {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}

const YjsContext = createContext(null);

export function YjsProvider({ children }) {
  const [nameInput, setNameInput] = useState("");
  const [colorInput, setColorInput] = useState("#3b82f6");

  const [userContext, setUserContext] = useState({
    name: "",
    color: "",
    textColor: "",
  });

  const [isInitializing, setIsInitializing] = useState(true);

  const [yjsState, setYjsState] = useState({
    doc: null,
    provider: null,
    status: "connecting",
    isOfflineDataLoaded: false,
  });

  const pathname = usePathname();

  const yjsRefs = useRef({ doc: null, wsProvider: null, idbProvider: null });

  useEffect(() => {
    const savedUser = localStorage.getItem("yjs-user-profile");
    if (savedUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUserContext(JSON.parse(savedUser));
    }
    setIsInitializing(false);
  }, []);

  const handleJoin = (e) => {
    e.preventDefault();
    if (nameInput.trim()) {
      const newUserContext = {
        name: nameInput.trim(),
        color: colorInput,
        textColor: getContrastTextColor(colorInput),
      };

      setUserContext(newUserContext);
      // NEW: Save to localStorage so it survives refresh
      localStorage.setItem("yjs-user-profile", JSON.stringify(newUserContext));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("yjs-user-profile");
    setUserContext({ name: "", color: "", textColor: "" });
  };

  useEffect(() => {
    if (!userContext.name) return;
    if (yjsRefs.current.doc) return;

    // console.log("🚀 [Yjs Engine] Booting up collaborative environment...");
    console.time("⏱️ [IndexedDB] Time to load local data");

    const ydoc = new Y.Doc();
    console.log(ydoc);
    const roomName = "multi-page-workspace";

    // 1. Initialize WebSocket (Cloud)
    const wsUrl = `ws://${window.location.hostname}:1234`;
    const yprovider = new WebsocketProvider(wsUrl, roomName, ydoc);

    // 2. Initialize IndexedDB (Local Offline Storage)
    const indexeddbProvider = new IndexeddbPersistence(roomName, ydoc);

    // LOG: Watch IndexedDB speed
    indexeddbProvider.on("synced", () => {
      console.timeEnd("⏱️ [IndexedDB] Time to load local data");
      // console.log(
      //   "💾 [IndexedDB] Offline data successfully loaded into memory!",
      // );
      setYjsState((prev) => ({ ...prev, isOfflineDataLoaded: true }));
    });

    // LOG: Watch Network status
    yprovider.on("status", (event) => {
      setYjsState((prev) => ({ ...prev, status: event.status }));
      // console.log(
      //   `🌐 [WebSocket] Status changed to: ${event.status.toUpperCase()}`,
      // );
      if (event.status === "connected") {
        // console.log(
        //   "☁️ [Network] Connected! Ready to sync local diffs to the cloud.",
        // );
      }
    });

    yjsRefs.current = {
      doc: ydoc,
      wsProvider: yprovider,
      idbProvider: indexeddbProvider,
    };

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setYjsState((prev) => ({
      ...prev,
      doc: ydoc,
      provider: yprovider,
      status: "connecting",
    }));

    return () => {
      if (yjsRefs.current.wsProvider) {
        yjsRefs.current.wsProvider.disconnect();
        yjsRefs.current.doc.destroy();
        yjsRefs.current = { doc: null, wsProvider: null, idbProvider: null };
      }
    };
  }, [userContext.name]);

  // Track page location and custom colors in Awareness
  useEffect(() => {
    if (!yjsState.provider) return;
    const payload = {
      name: userContext.name,
      color: userContext.color,
      textColor: userContext.textColor,
      location: pathname,
    };
    // console.log(`📡 [Awareness] Broadcasting user presence →`, payload);
    yjsState.provider.awareness.setLocalStateField("user", payload);
  }, [pathname, yjsState.provider, userContext]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!userContext.name) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <form
          onSubmit={handleJoin}
          className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full"
        >
          <h2 className="text-2xl font-bold mb-6">Join Workspace</h2>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Your Name
              </label>
              <input
                type="text"
                className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:outline-none"
                placeholder="e.g. Jane Doe"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Pick a Color
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  className="w-12 h-12 rounded cursor-pointer border-0 p-0"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                />
                <span className="text-sm text-gray-500 font-mono uppercase">
                  {colorInput}
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white rounded-md py-2 font-medium hover:bg-gray-800"
          >
            Enter Room
          </button>
        </form>
      </div>
    );
  }

  if (!yjsState.doc || !yjsState.isOfflineDataLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center text-gray-500 font-mono">
        Loading local workspace data...
      </div>
    );
  }

  return (
    <YjsContext.Provider value={{ ...yjsState, ...userContext, handleLogout }}>
      <LiveCursors provider={yjsState.provider} />
      {children}
    </YjsContext.Provider>
  );
}

export const useYjsContext = () => useContext(YjsContext);
