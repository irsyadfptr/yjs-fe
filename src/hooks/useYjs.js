import { useEffect, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

export function useYjs(roomName = 'demo-room') {
  const [doc, setDoc] = useState(null);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    const ydoc = new Y.Doc();

    // Connect to our local WebSocket server
    const yprovider = new WebsocketProvider(
      'ws://localhost:1234',
      roomName,
      ydoc
    );

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDoc(ydoc);
    setProvider(yprovider);

    return () => {
      yprovider.destroy();
      ydoc.destroy();
    };
  }, [roomName]);

  return { doc, provider };
}