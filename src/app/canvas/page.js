"use client";
import { useEffect, useState, useRef } from "react";
import { useYjsContext } from "../../components/YjsProvider";
import * as Y from "yjs";

export default function CanvasPage() {
  const { doc, color, userName, textColor } = useYjsContext();
  const [notes, setNotes] = useState({});
  const [undoManager, setUndoManager] = useState(null);
  const [draggingNote, setDraggingNote] = useState(null);

  const yNotes = doc.getMap("canvas-notes");

  useEffect(() => {
    if (!doc) return;

    console.log("🛡️ [UndoManager] Initializing for Canvas Notes...");
    const manager = new Y.UndoManager(yNotes);

    // 1. Log when a new transaction is recorded into the undo stack
    manager.on("stack-item-added", (event) => {
      console.log(
        `📦 [UndoManager] Transaction Recorded! | Undo Stack Size: ${manager.undoStack.length} | Redo Stack Size: ${manager.redoStack.length}`,
      );
    });

    // 2. Log when an Undo or Redo action pops an item off the stack
    manager.on("stack-item-popped", (event) => {
      console.log(
        `⏪ [UndoManager] Event Popped (${event.type.toUpperCase()}) | Remaining Undo Stack: ${manager.undoStack.length}`,
      );
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUndoManager(manager);

    const updateNotes = () => {
      console.time("⏱️ [Y.Map Canvas] Re-render React Notes");
      setNotes(yNotes.toJSON());
      console.timeEnd("⏱️ [Y.Map Canvas] Re-render React Notes");
    };

    yNotes.observe(updateNotes);
    updateNotes();

    return () => {
      yNotes.unobserve(updateNotes);
      manager.destroy();
      console.log("🛡️ [UndoManager] Cleaned up manager listener.");
    };
  }, [doc, yNotes]);

  const handleUndo = () => {
    if (!undoManager) return;
    console.time("⏱️ [Undo Execution]");
    console.log("⏪ [Action] Triggering Local Undo...");
    undoManager.undo();
    console.timeEnd("⏱️ [Undo Execution]");
  };

  const handleRedo = () => {
    if (!undoManager) return;
    console.time("⏱️ [Redo Execution]");
    console.log("⏩ [Action] Triggering Local Redo...");
    undoManager.redo();
    console.timeEnd("⏱️ [Redo Execution]");
  };

  const addNote = () => {
    const id = Date.now().toString();
    console.log(`➕ [Action] Adding new Sticky Note (ID: ${id})`);
    yNotes.set(id, {
      x: 100 + Math.random() * 50,
      y: 100 + Math.random() * 50,
      text: "New Idea",
      author: userName,
      color: color,
      textColor: textColor,
    });
  };

  const updateNoteText = (id, newText) => {
    const note = yNotes.get(id);
    if (note) {
      yNotes.set(id, { ...note, text: newText });
    }
  };

  const deleteNote = (id) => {
    console.log(`🗑️ [Action] Deleting Sticky Note (ID: ${id})`);
    yNotes.delete(id);
  };

  const handlePointerDown = (e, id) => {
    e.stopPropagation();
    const note = yNotes.get(id);
    if (!note) return;

    setDraggingNote({
      id,
      offsetX: e.clientX - note.x,
      offsetY: e.clientY - note.y,
    });
  };

  const handlePointerMove = (e) => {
    if (!draggingNote) return;

    const note = yNotes.get(draggingNote.id);
    if (note) {
      yNotes.set(draggingNote.id, {
        ...note,
        x: e.clientX - draggingNote.offsetX,
        y: e.clientY - draggingNote.offsetY,
      });
    }
  };

  const handlePointerUp = () => {
    setDraggingNote(null);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
      <div
        className="bg-gray-100 border rounded-lg shadow-inner h-[700px] w-full max-w-5xl relative overflow-hidden touch-none"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div className="absolute top-4 left-4 z-10 flex gap-2 bg-white p-2 rounded-lg shadow-md border">
          <button
            onClick={addNote}
            className="bg-black text-white px-4 py-2 rounded font-medium hover:bg-gray-800"
          >
            + Add Sticky
          </button>
          <div className="w-px bg-gray-300 mx-1" />
          <button
            onClick={handleUndo}
            className="px-4 py-2 rounded hover:bg-gray-100 font-medium"
          >
            Undo
          </button>
          <button
            onClick={handleRedo}
            className="px-4 py-2 rounded hover:bg-gray-100 font-medium"
          >
            Redo
          </button>
        </div>

        {Object.entries(notes).map(([id, note]) => (
          <div
            key={id}
            onPointerDown={(e) => handlePointerDown(e, id)}
            className="absolute shadow-lg rounded-md w-48 border border-black/10 flex flex-col transition-shadow cursor-grab active:cursor-grabbing hover:shadow-xl"
            style={{
              transform: `translate(${note.x}px, ${note.y}px)`,
              backgroundColor: note.color,
              color: note.textColor,
            }}
          >
            {/* Note Header */}
            <div
              className="px-3 py-1 flex justify-between items-center rounded-t-md"
              style={{
                backgroundColor:
                  note.textColor === "#ffffff"
                    ? "rgba(0,0,0,0.2)"
                    : "rgba(0,0,0,0.05)",
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">
                {note.author}
              </span>
              <button
                onClick={() => deleteNote(id)}
                className="opacity-60 hover:opacity-100 rounded-full w-5 h-5 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            {/* Note Body */}
            <textarea
              className="w-full h-32 p-3 bg-transparent resize-none focus:outline-none font-medium"
              style={{ color: note.textColor }}
              value={note.text}
              onChange={(e) => updateNoteText(id, e.target.value)}
              onPointerDown={(e) => e.stopPropagation()}
            />
          </div>
        ))}

        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
      </div>
    </div>
  );
}
