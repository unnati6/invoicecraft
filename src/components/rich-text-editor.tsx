
'use client';

import * as React from 'react';
import { useEditor, EditorContent, type Editor, Mark } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import LinkExtension from '@tiptap/extension-link';
import { Color as TiptapColor } from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style'; // Import TextStyle
import { Image as TiptapImage } from '@tiptap/extension-image';

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Pilcrow,
  Type as FontIcon,
  Tags,
  Link as LinkIcon,
  Image as ImageIcon,
  Palette,
  Paintbrush,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// Custom Mark for Font Size
const FontSizeMark = Mark.create({
  name: 'fontSizeMark',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      fontSize: {
        default: null,
        parseHTML: (element) => element.style.fontSize,
        renderHTML: (attributes) => {
          if (!attributes.fontSize) {
            return {};
          }
          return { style: `font-size: ${attributes.fontSize}` };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        style: 'font-size',
        getAttrs: (value) => {
          if (typeof value === 'string') {
            if (/^\d+(pt|px|em|rem|%)$/.test(value)) {
              return { fontSize: value };
            }
          }
          return false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', HTMLAttributes, 0];
  },

  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ commands }) => {
        if (!fontSize) {
          return commands.resetAttributes(this.name, 'fontSize');
        }
        return commands.setMark(this.name, { fontSize });
      },
      unsetFontSize: () => ({ commands }) => {
        return commands.resetAttributes(this.name, 'fontSize');
      },
    };
  },
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const dataTags = [
  { label: 'Customer Name', value: '{{customerName}}' },
  { label: 'Customer Email', value: '{{customerEmail}}' },
  { label: 'Customer Phone', value: '{{customerPhone}}' },
  { label: 'Billing: Street', value: '{{customerBillingAddress.street}}' },
  { label: 'Billing: City', value: '{{customerBillingAddress.city}}' },
  { label: 'Billing: State', value: '{{customerBillingAddress.state}}' },
  { label: 'Billing: Zip', value: '{{customerBillingAddress.zip}}' },
  { label: 'Billing: Country', value: '{{customerBillingAddress.country}}' },
  { label: 'Shipping: Street', value: '{{customerShippingAddress.street}}' },
  { label: 'Shipping: City', value: '{{customerShippingAddress.city}}' },
  { label: 'Shipping: State', value: '{{customerShippingAddress.state}}' },
  { label: 'Shipping: Zip', value: '{{customerShippingAddress.zip}}' },
  { label: 'Shipping: Country', value: '{{customerShippingAddress.country}}' },
  { label: 'Document Number', value: '{{documentNumber}}' },
  { label: 'Issue Date', value: '{{issueDate}}' },
  { label: 'Due Date / Valid Until / Expiry Date', value: '{{dueDate}}' },
  { label: 'Total Amount', value: '{{totalAmount}}' },
  { label: 'Payment Terms', value: '{{paymentTerms}}' },
  { label: 'Commitment Period', value: '{{commitmentPeriod}}' },
  { label: 'Service Start Date', value: '{{serviceStartDate}}' },
  { label: 'Service End Date', value: '{{serviceEndDate}}' },
  { label: 'Signature Panel', value: '{{signaturePanel}}' },
];

const MenuBar: React.FC<{ editor: Editor | null, disabled?: boolean }> = ({ editor, disabled }) => {
  if (!editor) {
    return null;
  }

  const basicFormattingItems = [
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
      action: () => editor.chain().focus().toggleUnderline().run(),
      icon: UnderlineIcon,
      isActive: editor.isActive('underline'),
      label: 'Underline',
      disabled: disabled || !editor.can().chain().focus().toggleUnderline().run(),
    },
  ];

  const blockFormattingItems = [
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
  ];

  const fontSizes = ["8pt", "10pt", "12pt", "14pt", "16pt", "18pt", "20pt", "22pt", "24pt"];

  const setLink = React.useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = React.useCallback(() => {
    const url = window.prompt('Image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);


  return (
    <div className={cn(
      "flex flex-wrap items-center gap-1 border-b border-input p-2 bg-background rounded-t-md",
      "sticky top-16 z-10"
    )}>
      {basicFormattingItems.map((item) => (
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

      <Button // Link Button
        type="button"
        variant="outline"
        size="icon"
        onClick={setLink}
        className={cn('h-8 w-8', { 'bg-accent text-accent-foreground': editor.isActive('link') })}
        aria-label="Link"
        title="Link"
        disabled={disabled || !editor.can().chain().focus().toggleLink({ href: '' }).run()}
      >
        <LinkIcon className="h-4 w-4" />
      </Button>

      <Button // Image Button
        type="button"
        variant="outline"
        size="icon"
        onClick={addImage}
        className={cn('h-8 w-8', { 'bg-accent text-accent-foreground': editor.isActive('image') })}
        aria-label="Image"
        title="Image"
        disabled={disabled || !editor.can().chain().focus().setImage({ src: '' }).run()}
      >
        <ImageIcon className="h-4 w-4" />
      </Button>


      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8" title="Font Size" disabled={disabled}>
            <FontIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            onSelect={() => editor.chain().focus().unsetFontSize().run()}
            className={cn({ 'bg-accent text-accent-foreground': !fontSizes.some(size => editor.isActive('fontSizeMark', { fontSize: size })) })}
            disabled={disabled || !editor.can().chain().focus().unsetFontSize().run()}
          >
            Default
          </DropdownMenuItem>
          {fontSizes.map((size) => (
            <DropdownMenuItem
              key={size}
              onSelect={() => editor.chain().focus().setFontSize(size).run()}
              className={cn({ 'bg-accent text-accent-foreground': editor.isActive('fontSizeMark', { fontSize: size }) })}
              disabled={disabled || !editor.can().chain().focus().setFontSize(size).run()}
            >
              {size.replace('pt', ' pt')}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex items-center gap-1" title="Text Color">
         <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => editor.chain().focus().unsetColor().run()}
            className={cn('h-8 w-8', { 'bg-accent text-accent-foreground': !editor.getAttributes('textStyle').color })}
            aria-label="Default Color"
            title="Default Color"
            disabled={disabled || !editor.can().chain().focus().unsetColor().run()}
          >
            <Paintbrush className="h-4 w-4" />
        </Button>
        <div className="relative h-8 w-8">
          <Palette className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" />
          <input
            type="color"
            onInput={(event) => editor.chain().focus().setColor((event.target as HTMLInputElement).value).run()}
            value={editor.getAttributes('textStyle').color || '#000000'} // Fallback to black if no color is set
            className="h-full w-full cursor-pointer appearance-none rounded-md border border-input bg-transparent p-0 opacity-0"
            disabled={disabled}
            title="Choose text color"
          />
        </div>
      </div>

      {blockFormattingItems.map((item) => (
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8" title="Insert Data Tag" disabled={disabled}>
            <Tags className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-72 overflow-y-auto">
          {dataTags.map((tag) => (
            <DropdownMenuItem
              key={tag.value}
              onSelect={() => editor.chain().focus().insertContent(tag.value).run()}
              disabled={disabled || !editor.can().chain().focus().insertContent(tag.value).run()}
            >
              {tag.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
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
      FontSizeMark,
      Underline,
      LinkExtension.configure({
        openOnClick: false, 
        autolink: true,
      }),
      TiptapImage.configure({ 
        inline: false, 
      }),
      TextStyle, // Correctly add the TextStyle extension object
      TiptapColor.configure({
        types: ['textStyle'], 
      }),
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

  React.useEffect(() => {
    if (editor && !editor.isDestroyed && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  React.useEffect(() => {
    if(editor) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

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

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSizeMark: {
      setFontSize: (fontSize: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}
