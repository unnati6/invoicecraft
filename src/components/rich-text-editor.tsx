
'use client';

import * as React from 'react';
import { useEditor, EditorContent, type Editor, Mark } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Pilcrow,
  Baseline, // Import the Baseline icon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Custom Mark for 8pt font size
const EightPtStyle = Mark.create({
  name: 'eightPtStyle',

  addOptions() {
    return {
      HTMLAttributes: {
        style: 'font-size: 8pt;',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span',
        getAttrs: (node) => {
          if (typeof node === 'string') return false;
          const hasEightPtStyle = node.style.fontSize === '8pt';
          return hasEightPtStyle ? {} : false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', { ...HTMLAttributes, style: 'font-size: 8pt;' }, 0];
  },

  addCommands() {
    return {
      toggleEightPtStyle: () => ({ commands }) => {
        return commands.toggleMark(this.name);
      },
    };
  },
});


interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const MenuBar: React.FC<{ editor: Editor | null, disabled?: boolean }> = ({ editor, disabled }) => {
  if (!editor) {
    return null;
  }

  const menuItems = [
    {
      action: () => editor.chain().focus().toggleBold().run(),
      icon: Bold,
      isActive: editor.isActive('bold'),
      label: 'Bold',
      disabled: disabled || !editor.can().chain().focus().toggleBold().run(),
    },
    {
      action: () => editor.chain().focus().toggleItalic().run(),
      icon: Italic,
      isActive: editor.isActive('italic'),
      label: 'Italic',
      disabled: disabled || !editor.can().chain().focus().toggleItalic().run(),
    },
    {
      action: () => editor.chain().focus().setParagraph().run(),
      icon: Pilcrow,
      isActive: editor.isActive('paragraph'),
      label: 'Paragraph',
      disabled: disabled || !editor.can().chain().focus().setParagraph().run(),
    },
    {
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      icon: Heading1,
      isActive: editor.isActive('heading', { level: 1 }),
      label: 'H1',
      disabled: disabled || !editor.can().chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      icon: Heading2,
      isActive: editor.isActive('heading', { level: 2 }),
      label: 'H2',
      disabled: disabled || !editor.can().chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      icon: Heading3,
      isActive: editor.isActive('heading', { level: 3 }),
      label: 'H3',
      disabled: disabled || !editor.can().chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      action: () => editor.chain().focus().toggleBulletList().run(),
      icon: List,
      isActive: editor.isActive('bulletList'),
      label: 'Bullet List',
      disabled: disabled || !editor.can().chain().focus().toggleBulletList().run(),
    },
    {
      action: () => editor.chain().focus().toggleOrderedList().run(),
      icon: ListOrdered,
      isActive: editor.isActive('orderedList'),
      label: 'Ordered List',
      disabled: disabled || !editor.can().chain().focus().toggleOrderedList().run(),
    },
    { // Added 8pt Font Button
      action: () => editor.chain().focus().toggleEightPtStyle().run(),
      icon: Baseline,
      isActive: editor.isActive('eightPtStyle'),
      label: '8pt Font',
      disabled: disabled || !editor.can().chain().focus().toggleEightPtStyle().run(),
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-input p-2 bg-background rounded-t-md">
      {menuItems.map((item) => (
        <Button
          key={item.label}
          type="button"
          variant="outline"
          size="icon"
          onClick={item.action}
          className={cn('h-8 w-8', { 'bg-accent text-accent-foreground': item.isActive })}
          aria-label={item.label}
          title={item.label}
          disabled={item.disabled}
        >
          <item.icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );
};

export function RichTextEditor({ value, onChange, disabled = false }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      EightPtStyle, // Added custom mark
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none',
      },
    },
  });

  // Update editor content if 'value' prop changes externally
  React.useEffect(() => {
    if (editor && !editor.isDestroyed && value !== editor.getHTML()) {
      editor.commands.setContent(value, false); // false to not emit update
    }
  }, [value, editor]);


  return (
    <div className="rounded-md border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
      <MenuBar editor={editor} disabled={disabled} />
      <EditorContent
        editor={editor}
        className={cn(
          "min-h-[200px] w-full rounded-b-md bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground",
          "focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
           disabled ? "bg-muted/50" : ""
        )}
      />
    </div>
  );
}

RichTextEditor.displayName = 'RichTextEditor';
