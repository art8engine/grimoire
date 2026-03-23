import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

interface TipTapEditorProps {
  content: string;
  placeholder?: string;
  fontSize?: number;
  onChange: (json: string) => void;
  onSlashCommand?: (name: string) => void;
}

export default function TipTapEditor({
  content,
  placeholder = "",
  fontSize = 15,
  onChange,
  onSlashCommand,
}: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
    ],
    content: content ? JSON.parse(content) : undefined,
    onUpdate: ({ editor: e }) => {
      const json = JSON.stringify(e.getJSON());

      // Check for /page command
      if (onSlashCommand) {
        const text = e.state.doc.textBetween(
          e.state.selection.from - 50,
          e.state.selection.from,
          " "
        );
        const match = text.match(/\/page\s+(.+)$/);
        if (match) {
          const name = match[1].trim();
          if (name) {
            // Remove the /page command text
            const from = e.state.selection.from - match[0].length;
            const to = e.state.selection.from;
            e.chain().deleteRange({ from, to }).run();
            onSlashCommand(name);
            return;
          }
        }
      }

      onChange(json);
    },
  });

  useEffect(() => {
    if (editor && content) {
      const currentJson = JSON.stringify(editor.getJSON());
      if (currentJson !== content) {
        editor.commands.setContent(JSON.parse(content));
      }
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="editor-area" style={{ fontSize }}>
      <EditorContent editor={editor} />
    </div>
  );
}

export { useEditor };
export type { TipTapEditorProps };
