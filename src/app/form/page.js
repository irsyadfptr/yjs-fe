"use client";

import { useYjsContext } from "@/components/YjsProvider";
import { usePresence } from "@/hooks/usePresence";
import CollabForm from "@/components/CollabForm";

const FIELDS = [
  { key: "title", label: "Project Title", type: "text" },
  { key: "email", label: "Contact Email", type: "email" },
  { key: "notes", label: "Project Notes", type: "textarea" },
];

export default function FormPage() {
  const { doc, provider } = useYjsContext();
  const users = usePresence(provider);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-120px)] p-4">
      <div className="bg-white p-6 rounded-lg shadow-sm border w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">Collaborative Form Demo</h2>

        {/* Render the extracted component and pass props */}
        <CollabForm
          doc={doc}
          provider={provider}
          users={users}
          fields={FIELDS}
        />
      </div>
    </div>
  );
}
