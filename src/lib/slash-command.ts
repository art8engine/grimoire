import { Extension } from "@tiptap/react";

// Detects "/" typed in editor and triggers the slash menu
export const SlashDetector = (onSlash: (pos: { top: number; left: number }) => void, onClose: () => void) =>
  Extension.create({
    name: "slashDetector",
    addKeyboardShortcuts() {
      return {
        Backspace: ({ editor }) => {
          try {
            const { state } = editor;
            const { $from } = state.selection;
            const text = $from.parent.textContent;
            // If deleting will remove the "/" that triggered the menu, close it
            if (text === "/") {
              onClose();
            }
          } catch { /* */ }
          return false;
        },
      };
    },
    onUpdate: ({ editor }) => {
      try {
        const { state } = editor;
        const { $from } = state.selection;
        const text = $from.parent.textContent;

        if (text.startsWith("/") && text.length >= 1) {
          // Get cursor coords for menu positioning
          const coords = editor.view.coordsAtPos(state.selection.from);
          const editorRect = editor.view.dom.closest(".notes-body")?.getBoundingClientRect();
          if (editorRect) {
            onSlash({
              top: coords.bottom - editorRect.top + 4,
              left: coords.left - editorRect.left,
            });
          }
        } else {
          onClose();
        }
      } catch { /* editor not ready */ }
    },
  });
