import { Editor } from "@tiptap/react";

interface ToolbarProps {
  editor: Editor | null;
}

export default function Toolbar({ editor }: ToolbarProps) {
  if (!editor) return null;

  const btn = (
    label: string,
    action: () => void,
    isActive: boolean
  ) => (
    <button
      className={`toolbar-btn${isActive ? " active" : ""}`}
      onMouseDown={(e) => {
        e.preventDefault();
        action();
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="toolbar">
      {btn("B", () => editor.chain().focus().toggleBold().run(), editor.isActive("bold"))}
      {btn("I", () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"))}
      {btn("H1", () => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive("heading", { level: 1 }))}
      {btn("H2", () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive("heading", { level: 2 }))}
      {btn("—", () => editor.chain().focus().setHorizontalRule().run(), false)}
    </div>
  );
}
