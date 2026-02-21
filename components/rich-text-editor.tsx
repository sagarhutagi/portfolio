"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { Label } from "@/components/ui/label";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  RemoveFormatting,
  Minus,
} from "lucide-react";
import { useCallback, useEffect } from "react";

/* ────────────────────────────────────────────────────
   Toolbar button
   ──────────────────────────────────────────────────── */

function ToolbarButton({
  onClick,
  active = false,
  disabled = false,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-sm transition-colors disabled:opacity-30 ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
      data-interactive
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-border mx-0.5" />;
}

/* ────────────────────────────────────────────────────
   Toolbar
   ──────────────────────────────────────────────────── */

function Toolbar({ editor }: { editor: Editor }) {
  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);
    if (url === null) return; // cancelled
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  }, [editor]);

  const iconSize = 14;

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border p-1.5 bg-muted/30">
      {/* Undo / Redo */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        <Undo size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        <Redo size={iconSize} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive("heading", { level: 1 })}
        title="Heading 1"
      >
        <Heading1 size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        title="Heading 2"
      >
        <Heading2 size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        title="Heading 3"
      >
        <Heading3 size={iconSize} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Inline formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Bold"
      >
        <Bold size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Italic"
      >
        <Italic size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        title="Underline"
      >
        <UnderlineIcon size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        title="Strikethrough"
      >
        <Strikethrough size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive("code")}
        title="Inline Code"
      >
        <Code size={iconSize} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="Bullet List"
      >
        <List size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="Ordered List"
      >
        <ListOrdered size={iconSize} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Block elements */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        title="Blockquote"
      >
        <Quote size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal Rule"
      >
        <Minus size={iconSize} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Alignment */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        active={editor.isActive({ textAlign: "left" })}
        title="Align Left"
      >
        <AlignLeft size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        active={editor.isActive({ textAlign: "center" })}
        title="Align Center"
      >
        <AlignCenter size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        active={editor.isActive({ textAlign: "right" })}
        title="Align Right"
      >
        <AlignRight size={iconSize} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Link */}
      <ToolbarButton
        onClick={setLink}
        active={editor.isActive("link")}
        title="Link"
      >
        <LinkIcon size={iconSize} />
      </ToolbarButton>

      {/* Clear formatting */}
      <ToolbarButton
        onClick={() =>
          editor.chain().focus().clearNodes().unsetAllMarks().run()
        }
        title="Clear Formatting"
      >
        <RemoveFormatting size={iconSize} />
      </ToolbarButton>
    </div>
  );
}

/* ────────────────────────────────────────────────────
   Main RichTextEditor component
   ──────────────────────────────────────────────────── */

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  label?: string;
  placeholder?: string;
  /** Approximate min-height in editor rows */
  minHeight?: number;
}

export function RichTextEditor({
  value,
  onChange,
  label,
  placeholder = "Start writing…",
  minHeight = 200,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[var(--accent-color)] underline",
        },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose-editor focus:outline-none p-3 text-sm min-h-[${minHeight}px]`,
      },
    },
  });

  // Sync external value changes (e.g. when switching between items)
  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="border border-border rounded-sm overflow-hidden bg-background">
        {editor && <Toolbar editor={editor} />}
        <EditorContent
          editor={editor}
          className="rich-text-editor"
          style={{ minHeight: `${minHeight}px` }}
        />
      </div>
    </div>
  );
}
