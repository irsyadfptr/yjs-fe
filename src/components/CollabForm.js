"use client";

import { useEffect, useRef, useState } from "react";

export default function CollabForm({ doc, provider, users, fields }) {
  const [formData, setFormData] = useState({});
  const isObserved = useRef(false);

  useEffect(() => {
    if (!doc) return;

    const yForm = doc.getMap("form");

    const updateForm = () => {
      console.time("⏱️ [Y.Map Reactivity] Update Form UI");

      const rawMap = yForm.toJSON();
      // console.log("🔍 [Y.Map State] RAW Yform", yForm);
      // console.log("🔍 [Y.Map State] Converted Yjs Object:", rawMap);

      const nextState = {};
      fields.forEach((field) => {
        nextState[field.key] = yForm.get(field.key) ?? "";
      });

      setFormData(nextState);
      console.timeEnd("⏱️ [Y.Map Reactivity] Update Form UI");
    };

    const observer = (event) => {
      // console.log("⚡ [Y.Map Event] Remote keys changed:", event.changes.keys);
      updateForm();
    };

    // Prevent duplicate observations if effect runs multiple times during connection sync
    if (!isObserved.current) {
      yForm.observe(observer);
      isObserved.current = true;
    }

    updateForm(); // Initial load on mount

    return () => {
      if (isObserved.current) {
        yForm.unobserve(observer);
        isObserved.current = false;
      }
    };
  }, [doc, fields]);

  const handleChange = (field, value) => {
    // console.log(`✏️ [Y.Map Action] Setting "${field}" → "${value}"`);
    setFormData((prev) => ({ ...prev, [field]: value }));
    doc.getMap("form").set(field, value);
  };

  const setFocus = (fieldName) => {
    if (!provider) return;
    if (fieldName) {
      // console.log(`👁️ [Awareness] Broadcasting focused field: "${fieldName}"`);
    } else {
      // console.log(`👁️ [Awareness] Cleared field focus`);
    }
    provider.awareness.setLocalStateField("focusedField", fieldName);
  };

  const getFieldEditors = (fieldName) => {
    if (!users || !provider) return [];
    return Array.from(users.entries()).filter(
      ([id, state]) =>
        id !== provider.awareness.clientID && state.focusedField === fieldName,
    );
  };

  return (
    <div className="space-y-6">
      {fields.map((field) => {
        const editors = getFieldEditors(field.key);

        return (
          <div key={field.key} className="relative">
            <label className="block text-sm font-medium mb-1">
              {field.label}
            </label>

            {field.type === "textarea" ? (
              <textarea
                rows="4"
                className="border rounded-md px-3 py-2 w-full focus:ring-2 focus:outline-none"
                value={formData[field.key] || ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                onFocus={() => setFocus(field.key)}
                onBlur={() => setFocus(null)}
                placeholder={`Enter ${field.label.toLowerCase()}...`}
              />
            ) : (
              <input
                type={field.type}
                className="border rounded-md px-3 py-2 w-full focus:ring-2 focus:outline-none"
                value={formData[field.key] || ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                onFocus={() => setFocus(field.key)}
                onBlur={() => setFocus(null)}
                placeholder={`Enter ${field.label.toLowerCase()}...`}
              />
            )}

            {/* Real-time typing/focus indicator badges */}
            {editors.length > 0 && (
              <div className="absolute right-2 top-8 flex -space-x-1">
                {editors.map(([id, state]) => (
                  <div
                    key={id}
                    className="w-5 h-5 rounded-full border border-white text-[10px] text-white flex items-center justify-center font-bold"
                    style={{ backgroundColor: state.user?.color || "#cbd5e1" }}
                    title={`${state.user?.name || "Someone"} is typing...`}
                  >
                    {state.user?.name
                      ? state.user.name.charAt(0).toUpperCase()
                      : "?"}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
