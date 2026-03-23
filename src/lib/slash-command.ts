import { Extension } from "@tiptap/react";

// Safe slash detector that never touches editor.view directly
export const SlashDetector = (onSlash: (query: string) => void, onClose: () => void) =>
  Extension.create({
    name: "slashDetector",
    onUpdate({ editor }) {
      try {
        const { state } = editor;
        const { $from } = state.selection;
        const text = $from.parent.textContent;
        if (text.startsWith("/")) {
          onSlash(text.slice(1));
        } else {
          onClose();
        }
      } catch {
        onClose();
      }
    },
  });
