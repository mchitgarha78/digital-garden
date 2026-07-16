"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

type NoteEditorProps = {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
};

export function NoteEditor({ content, onChange, placeholder }: NoteEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder:
          placeholder ??
          "یادداشت خود را بنویسید... برای لینک دادن از [[عنوان یادداشت]] استفاده کنید.",
      }),
    ],
    content: content ? `<p>${escapeHtml(content).replace(/\n/g, "</p><p>")}</p>` : "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-emerald max-w-none min-h-[320px] px-4 py-3 outline-none focus:outline-none",
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getText());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getText();
    if (current !== content) {
      editor.commands.setContent(
        content ? `<p>${escapeHtml(content).replace(/\n/g, "</p><p>")}</p>` : "",
      );
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="min-h-[320px] animate-pulse rounded-xl border border-slate-200 bg-slate-50" />
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex gap-1 border-b border-slate-100 px-3 py-2">
        <ToolbarButton
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          label="B"
          className="font-bold"
        />
        <ToolbarButton
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          label="I"
          className="italic"
        />
        <ToolbarButton
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          label="H2"
        />
        <ToolbarButton
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          label="•"
        />
        <span className="mr-auto text-xs text-slate-400">
          سینتکس لینک: [[عنوان یادداشت]]
        </span>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarButton({
  active,
  onClick,
  label,
  className = "",
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded px-2 py-1 text-sm transition ${
        active ? "bg-emerald-100 text-emerald-800" : "text-slate-600 hover:bg-slate-100"
      } ${className}`}
    >
      {label}
    </button>
  );
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
