"use client";
import { useEffect, useState, useRef } from "react";
import { useYjsContext } from "../../components/YjsProvider";
import * as Y from "yjs";

export default function CanvasPage() {
  const { doc, color, name, textColor } = useYjsContext();

  // Y.Text state
  const [undoManager, setUndoManager] = useState(null);
  const textareaRef = useRef(null);

  // Y.Map (sticky notes) state
  const [notes, setNotes] = useState({});
  const [draggingNote, setDraggingNote] = useState(null);

  const yText = doc.getText("canvas-text");
  const yNotes = doc.getMap("canvas-notes");

  useEffect(() => {
    if (!doc) return;

    // --- Y.Text + UndoManager ---
    // console.log("🛡️ [UndoManager] Initializing for Y.Text...");
    const manager = new Y.UndoManager([yText, yNotes], {
      trackedOrigins: new Set([doc.clientID]),
    });
    // console.log(manager);

    manager.on("stack-item-added", () => {
      // console.log(
      //   `📦 [UndoManager] Transaction Recorded! | Undo Stack: ${manager.undoStack.length} | Redo Stack: ${manager.redoStack.length}`,
      // );
    });

    manager.on("stack-item-popped", (event) => {
      // console.log(
      //   `⏪ [UndoManager] Popped (${event.type.toUpperCase()}) | Remaining Undo: ${manager.undoStack.length}`,
      // );
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUndoManager(manager);

    const updateText = () => {
      const newVal = yText.toString();
      console.time("⏱️ [Y.Text] Re-render from remote change");
      if (textareaRef.current && textareaRef.current.value !== newVal) {
        const { selectionStart, selectionEnd } = textareaRef.current;
        textareaRef.current.value = newVal;
        try {
          textareaRef.current.setSelectionRange(selectionStart, selectionEnd);
        } catch {}
      }
      console.timeEnd("⏱️ [Y.Text] Re-render from remote change");
    };

    yText.observe(updateText);
    updateText();

    // --- Y.Map (sticky notes) ---
    const updateNotes = () => {
      console.time("⏱️ [Y.Map Canvas] Re-render React Notes");
      setNotes(yNotes.toJSON());
      console.timeEnd("⏱️ [Y.Map Canvas] Re-render React Notes");
    };

    yNotes.observe(updateNotes);
    updateNotes();

    return () => {
      yText.unobserve(updateText);
      yNotes.unobserve(updateNotes);
      manager.destroy();
      // console.log("🛡️ [UndoManager] Cleaned up.");
    };
  }, [doc]);

  // Y.Text: diff-based update so concurrent edits merge at character level
  const handleTextChange = (e) => {
    const newValue = e.target.value;
    const oldValue = yText.toString();

    console.log(`✏️ [Y.Text Action] Mutating via doc.transact(origin: clientID=${doc.clientID})`);
    doc.transact(() => {
      let start = 0;
      while (
        start < Math.min(oldValue.length, newValue.length) &&
        oldValue[start] === newValue[start]
      )
        start++;

      let endOld = oldValue.length;
      let endNew = newValue.length;
      while (
        endOld > start &&
        endNew > start &&
        oldValue[endOld - 1] === newValue[endNew - 1]
      ) {
        endOld--;
        endNew--;
      }

      if (endOld > start) yText.delete(start, endOld - start);
      if (endNew > start) yText.insert(start, newValue.slice(start, endNew));
    }, doc.clientID); // tracked origin — UndoManager only reverts YOUR changes
  };

  const handleUndo = () => {
    if (!undoManager) return;
    console.time("⏱️ [Undo Execution]");
    // console.log("⏪ [Action] Triggering Local Undo...");
    undoManager.undo();
    console.timeEnd("⏱️ [Undo Execution]");
  };

  const handleRedo = () => {
    if (!undoManager) return;
    console.time("⏱️ [Redo Execution]");
    // console.log("⏩ [Action] Triggering Local Redo...");
    undoManager.redo();
    console.timeEnd("⏱️ [Redo Execution]");
  };

  // Y.Map sticky note handlers
  const addNote = () => {
    const id = Date.now().toString();
    // console.log(`➕ [Action] Adding new Sticky Note (ID: ${id})`);
    doc.transact(() => {
      yNotes.set(id, {
        x: 80 + Math.random() * 200,
        y: 80 + Math.random() * 200,
        text: "New Idea",
        author: name,
        color,
        textColor,
      });
    }, doc.clientID);
  };

  const updateNoteText = (id, newText) => {
    const note = yNotes.get(id);
    if (note) {
      // console.log(`✏️ [Y.Map Action] Updating Sticky Note text (ID: ${id}) → "${newText}"`);
      doc.transact(() => {
        yNotes.set(id, { ...note, text: newText });
      }, doc.clientID);
    }
  };

  const deleteNote = (id) => {
    // console.log(`🗑️ [Action] Deleting Sticky Note (ID: ${id})`);
    doc.transact(() => {
      yNotes.delete(id);
    }, doc.clientID);
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

  return (
    <div className="flex flex-col gap-4 p-4 h-[calc(100vh-64px)]">
      {/* Top: Y.Text Collaborative Editor + UndoManager */}
      <div className="flex flex-col flex-1 bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50 shrink-0">
          <div>
            <h3 className="font-semibold text-gray-800">Collaborative Editor</h3>
            <p className="text-xs text-gray-500 font-mono">Y.Text + UndoManager</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleUndo}
              className="px-3 py-1.5 rounded text-sm hover:bg-gray-200 font-medium border border-gray-200"
            >
              ↩ Undo
            </button>
            <button
              onClick={handleRedo}
              className="px-3 py-1.5 rounded text-sm hover:bg-gray-200 font-medium border border-gray-200"
            >
              ↪ Redo
            </button>
          </div>
        </div>
        <textarea
          ref={textareaRef}
          className="flex-1 p-4 resize-none focus:outline-none font-mono text-sm"
          placeholder="Start typing here... changes sync to all users instantly. Undo only reverts YOUR changes, not teammates'."
          onChange={handleTextChange}
        />
      </div>

      {/* Bottom: Y.Map Sticky Notes Canvas */}
      <div className="flex flex-col flex-1 bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50 shrink-0">
          <div>
            <h3 className="font-semibold text-gray-800">Sticky Notes</h3>
            <p className="text-xs text-gray-500 font-mono">Y.Map</p>
          </div>
          <button
            onClick={addNote}
            className="bg-black text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-gray-800"
          >
            + Add Sticky
          </button>
        </div>
        <div
          className="flex-1 relative overflow-hidden touch-none bg-gray-100"
          onPointerMove={handlePointerMove}
          onPointerUp={() => setDraggingNote(null)}
          onPointerLeave={() => setDraggingNote(null)}
        >
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          {Object.entries(notes).map(([id, note]) => (
            <div
              key={id}
              onPointerDown={(e) => handlePointerDown(e, id)}
              className="absolute shadow-lg rounded-md w-48 border border-black/10 flex flex-col cursor-grab active:cursor-grabbing hover:shadow-xl"
              style={{
                transform: `translate(${note.x}px, ${note.y}px)`,
                backgroundColor: note.color,
                color: note.textColor,
              }}
            >
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
              <textarea
                className="w-full h-32 p-3 bg-transparent resize-none focus:outline-none font-medium"
                style={{ color: note.textColor }}
                value={note.text}
                onChange={(e) => updateNoteText(id, e.target.value)}
                onPointerDown={(e) => e.stopPropagation()}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
