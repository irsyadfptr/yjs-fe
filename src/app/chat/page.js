"use client";
import CollabChat from "@/components/CollabChat";
import { useYjsContext } from "../../components/YjsProvider";

export default function ChatPage() {
  const { doc, name, color, textColor } = useYjsContext();

  if (!doc) {
    return <div>Connecting to room...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-120px)] bg-gray-50">
      <div className="w-full max-w-2xl">
        <CollabChat
          doc={doc}
          userName={name}
          color={color}
          textColor={textColor}
        />
      </div>
    </div>
  );
}
