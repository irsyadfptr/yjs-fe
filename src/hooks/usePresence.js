import { useState, useEffect } from 'react';

export function usePresence(provider) {
  const [users, setUsers] = useState(new Map());

  useEffect(() => {
    if (!provider || !provider.awareness) return;

    const awareness = provider.awareness;

    const updateUsers = () => {
      // Get all active clients and their current states
      setUsers(new Map(awareness.getStates()));
    };

    // Listen to changes from other connected clients
    awareness.on('change', updateUsers);
    updateUsers(); // initial sync

    return () => {
      awareness.off('change', updateUsers);
    };
  }, [provider]);

  return users;
}