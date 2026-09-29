import { useEffect, useState } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

const COLORS = [
  "#dc2626",
  "#d97706",
  "#059669",
  "#2563eb",
  "#7c3aed",
  "#db2777",
];

export function useYjs(roomName = "demo-room", userName) {
  const [doc, setDoc] = useState(null);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    // Wait until the user has entered a name before connecting
    if (!userName) return;

    const ydoc = new Y.Doc();
    const yprovider = new WebsocketProvider(
      "ws://localhost:1234",
      roomName,
      ydoc,
    );

    // Assign a fixed random color for this session
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];

    // Set the presence state using the name from the modal
    yprovider.awareness.setLocalStateField("user", {
      name: userName,
      color: randomColor,
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDoc(ydoc);
    setProvider(yprovider);

    return () => {
      yprovider.disconnect();
      ydoc.destroy();
    };
  }, [roomName, userName]);

  return { doc, provider };
}
