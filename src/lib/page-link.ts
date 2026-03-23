import { Node, mergeAttributes } from "@tiptap/react";

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    pageLink: {
      insertPageLink: (noteId: number, name: string) => ReturnType;
    };
  }
}

export const PageLink = Node.create({
  name: "pageLink",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      noteId: { default: null },
      name: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-page-link]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes({
        "data-page-link": "",
        "data-note-id": HTMLAttributes.noteId,
        class: "page-link-node",
      }),
      HTMLAttributes.name,
    ];
  },

  addCommands() {
    return {
      insertPageLink:
        (noteId: number, name: string) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { noteId, name },
          });
        },
    };
  },
});
