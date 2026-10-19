import { useState, useEffect } from "react";

export function usePresence(provider) {
  const [users, setUsers] = useState(new Map());

  useEffect(() => {
    if (!provider || !provider.awareness) return;

    const awareness = provider.awareness;

    const updateUsers = () => {
      const states = awareness.getStates();
      // console.log(`👥 [Awareness Change] ${states.size} peer state(s) active`, Object.fromEntries(states));
      setUsers(new Map(states));
    };

    // Listen to changes from other connected clients
    awareness.on("change", updateUsers);
    updateUsers(); // initial sync

    return () => {
      awareness.off("change", updateUsers);
    };
  }, [provider]);

  return users;
}
