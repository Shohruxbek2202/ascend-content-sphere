import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import CharacterCount from '@tiptap/extension-character-count';
import {
  Bold, Italic, Strikethrough, Code, Heading2, Heading3,
  List, ListOrdered, Quote, Minus, Link as LinkIcon,
  Image as ImageIcon, AlignLeft, AlignCenter, AlignRight,
  Undo, Redo, RemoveFormatting
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useCallback, useEffect } from 'react';

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const MenuButton = ({
  onClick, active, disabled, title, children
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-1.5 rounded transition-colors text-sm ${
      active
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    } disabled:opacity-40 disabled:cursor-not-allowed`}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-5 bg-border mx-1" />;

const TiptapEditor = ({ content, onChange, placeholder }: TiptapEditorProps) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      Placeholder.configure({ placeholder: placeholder || 'Kontent yozing...' }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      CharacterCount,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none min-h-[400px] p-4 focus:outline-none',
      },
    },
  });

  // Sync external content changes (e.g., language tab switch)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content]);

  const addLink = useCallback(() => {
    if (!linkUrl) return;
    editor?.chain().focus().setLink({ href: linkUrl }).run();
    setLinkUrl('');
    setShowLinkInput(false);
  }, [editor, linkUrl]);

  const addImage = useCallback(() => {
    if (!imageUrl) return;
    editor?.chain().focus().setImage({ src: imageUrl }).run();
    setImageUrl('');
    setShowImageInput(false);
  }, [editor, imageUrl]);

  if (!editor) return null;

  const wordCount = editor.storage.characterCount?.words() || 0;
  const charCount = editor.storage.characterCount?.characters() || 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      {/* Toolbar */}
      <div className="border-b border-border bg-muted/30 p-2 flex flex-wrap items-center gap-0.5">
        {/* History */}
        <MenuButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Orqaga (Ctrl+Z)">
          <Undo className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Oldinga (Ctrl+Y)">
          <Redo className="w-4 h-4" />
        </MenuButton>

        <Divider />

        {/* Headings */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })} title="H2 Sarlavha"
        >
          <span className="font-bold text-xs">H2</span>
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })} title="H3 Sarlavha"
        >
          <span className="font-bold text-xs">H3</span>
        </MenuButton>

        <Divider />

        {/* Text formatting */}
        <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Qalin (Ctrl+B)">
          <Bold className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Kursiv (Ctrl+I)">
          <Italic className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="O'chirilgan">
          <Strikethrough className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Kod">
          <Code className="w-4 h-4" />
        </MenuButton>

        <Divider />

        {/* Alignment */}
        <MenuButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Chapga">
          <AlignLeft className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Markazga">
          <AlignCenter className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="O'ngga">
          <AlignRight className="w-4 h-4" />
        </MenuButton>

        <Divider />

        {/* Lists */}
        <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Belgilangan ro'yxat">
          <List className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Raqamlangan ro'yxat">
          <ListOrdered className="w-4 h-4" />
        </MenuButton>

        <Divider />

        {/* Block elements */}
        <MenuButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Iqtibos">
          <Quote className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Ajratuvchi chiziq">
          <Minus className="w-4 h-4" />
        </MenuButton>

        <Divider />

        {/* Link */}
        <MenuButton onClick={() => setShowLinkInput(!showLinkInput)} active={editor.isActive('link')} title="Havola qo'shish">
          <LinkIcon className="w-4 h-4" />
        </MenuButton>

        {/* Image */}
        <MenuButton onClick={() => setShowImageInput(!showImageInput)} title="Rasm qo'shish">
          <ImageIcon className="w-4 h-4" />
        </MenuButton>

        <Divider />

        {/* Clear formatting */}
        <MenuButton onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Formatlashni tozalash">
          <RemoveFormatting className="w-4 h-4" />
        </MenuButton>
      </div>

      {/* Link input */}
      {showLinkInput && (
        <div className="border-b border-border bg-muted/20 p-2 flex gap-2 items-center">
          <Input
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addLink()}
            className="h-8 text-sm"
          />
          <Button type="button" size="sm" onClick={addLink} className="h-8">Qo'shish</Button>
          <Button type="button" size="sm" variant="outline" onClick={() => { editor.chain().focus().unsetLink().run(); setShowLinkInput(false); }} className="h-8">O'chirish</Button>
        </div>
      )}

      {/* Image URL input */}
      {showImageInput && (
        <div className="border-b border-border bg-muted/20 p-2 flex gap-2 items-center">
          <Input
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addImage()}
            className="h-8 text-sm"
          />
          <Button type="button" size="sm" onClick={addImage} className="h-8">Qo'shish</Button>
          <Button type="button" size="sm" variant="outline" onClick={() => setShowImageInput(false)} className="h-8">Bekor</Button>
        </div>
      )}

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Footer stats */}
      <div className="border-t border-border bg-muted/20 px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{wordCount} so'z · {charCount} belgi</span>
        <span>~{readingTime} daqiqa o'qish</span>
      </div>
    </div>
  );
};

export default TiptapEditor;
