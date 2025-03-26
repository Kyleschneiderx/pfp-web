"use client";

import clsx from "clsx";
import {
  ALargeSmall,
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Image as ImageIcon,
  IndentDecrease,
  IndentIncrease,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Underline as UnderlineIcon,
} from "lucide-react";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { EditorContent, Editor, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from "@tiptap/extension-image";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";

function debounce<T extends (...args: any[]) => void>(callback: T, delay?: number): T {
  let timeout: NodeJS.Timeout;

  return ((...args: any[]) => {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      callback(...args);
    }, delay ?? 500);
  }) as T;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

const FontSize = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.fontSize || null,
        renderHTML: (attributes: Record<string, any>) => {
          if (!attributes.fontSize) return {};

          return { style: `font-size: ${attributes.fontSize}` };
        },
      },
    };
  },

  addCommands() {
    return {
      setFontSize: (size) => {
        return ({ chain }) => {
          return chain().setMark("textStyle", { fontSize: size }).run();
        }
      },
      unsetFontSize: () => ({ chain }) => {
        return chain().setMark("textStyle", { fontSize: null }).run();
      },
    };
  },
});

interface ToolbarProps {
  editor: Editor;
  iconSize?: number;
}

const TipTapToolbar = ({
  editor,
  iconSize = 16,
}: ToolbarProps) => {
  const inputFileRef = useRef<HTMLInputElement>(null);

  const [isFontSizeOpen, setIsFontSizeOpen] = useState<boolean>(false);

  const fontSizes = ["Default", "12px", "14px", "16px", "18px", "24px"];

  const toolbarIconClass = (isActive: boolean) => {
    return clsx(isActive ? "text-black" : "text-neutral-500", "cursor-pointer hover:text-black");
  };

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    // cancelled
    if (url === null) {
      return
    }

    // empty
    if (url === '') {
      editor.chain().focus().unsetLink().run()

      return
    }

    // update link
    try {
      editor.chain().focus().setLink({ href: url, target: "_blank" }).run()
    } catch (e) {
      console.error(e);
    }
  }, [editor]);

  const addImage = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && editor) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          editor.chain().focus().setImage({ src: reader.result as string }).run();
        }
      };
      reader.readAsDataURL(file);
    }
  }, [editor]);

  const setColor = useCallback(debounce((color: string) => {
    return editor.chain().focus().setColor(color).run();
  }), []);

  return <div className="flex bg-neutral-100 p-2 items-center flex-wrap">
        <div className="flex justify-center items-center mr-8 my-1 space-x-3">
          <span onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
            <Bold size={iconSize} className={toolbarIconClass(editor.isActive('bold'))}/>
          </span>
          <span onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
            <Italic size={iconSize} className={toolbarIconClass(editor.isActive('italic'))}/>
          </span>
          <span onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
            <Strikethrough size={iconSize} className={toolbarIconClass(editor.isActive('strike'))}/>
          </span>
          <span onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline">
            <UnderlineIcon size={iconSize} className={toolbarIconClass(editor.isActive('underline'))}/>
          </span>
          <span onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Blockquote">
            <Quote size={iconSize} className={toolbarIconClass(editor.isActive('blockquote'))}/>
          </span>
        </div>
        <div className="flex justify-center items-center mr-8 my-1 space-x-3">
          <span onClick={() => {!isFontSizeOpen && setIsFontSizeOpen(true)}} title="Font Size">
            {isFontSizeOpen && (
              <div className="absolute mt-1 w-18 text-sm bg-white border rounded shadow-md z-10">
              {fontSizes.map((size) => (
                <div
                  key={size}
                  onClick={() => {
                    if(size === "Default") {
                      editor.chain().focus().unsetFontSize().run();
                    } else {
                      editor.chain().focus().setFontSize(size).run();
                    }

                    setIsFontSizeOpen(false);
                  }}
                  className={clsx(
                    editor.getAttributes('textStyle').fontSize === size || (!editor.getAttributes('textStyle').fontSize && size === 'Default') ? 
                    "bg-gray-200": 
                    "",
                    "px-2 py-2 text-xs cursor-pointer hover:bg-gray-200")}
                >
                  {size}
                </div>
              ))}
            </div>
            )}
            <ALargeSmall size={iconSize} className={toolbarIconClass(editor.getAttributes('textStyle').fontSize)}/>
          </span>
          <span title="Text Color">
            <input
              type="color"
              onChange={(event) => setColor(event.currentTarget.value)}
              value={editor.getAttributes('textStyle').color || "#000000"}
              className="w-5 h-3 mt-[-2px] cursor-pointer align-middle"
              data-testid="setColor"
            />
          </span>
          <span onClick={() => editor.chain().focus().setTextAlign("center").run()} title="Align Center">
            <AlignCenter size={iconSize} className={toolbarIconClass(editor.isActive({ textAlign: 'center' }))}/>
          </span>
          <span onClick={() => editor.chain().focus().setTextAlign("justify").run()} title="Align Justify">
            <AlignJustify size={iconSize} className={toolbarIconClass(editor.isActive({ textAlign: 'justify' }))}/>
          </span>
          <span onClick={() => editor.chain().focus().setTextAlign("left").run()} title="Align Left">
            <AlignLeft size={iconSize} className={toolbarIconClass(editor.isActive({ textAlign: 'left' }))}/>
          </span>
          <span onClick={() => editor.chain().focus().setTextAlign("right").run()} title="Align Right">
            <AlignRight size={iconSize} className={toolbarIconClass(editor.isActive({ textAlign: 'right' }))}/>
          </span>
        </div>
        <div className="flex justify-center items-center mr-8 my-1 space-x-3">
          <span onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet List">
            <List size={iconSize} className={toolbarIconClass(editor.isActive('bulletList'))}/>
          </span>
          <span onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Ordered List">
            <ListOrdered size={iconSize} className={toolbarIconClass(editor.isActive('orderedList'))}/>
          </span>
          <span onClick={() => {
            if(!editor.can().sinkListItem('listItem')) return;

            editor.chain().focus().sinkListItem('listItem').run()
          }} title="Indent List Item">
            <IndentIncrease size={iconSize} className={
              clsx(!editor.can().sinkListItem('listItem') ? "text-neutral-300" : toolbarIconClass(true))}
              />
          </span>
          <span onClick={() => editor.chain().focus().liftListItem('listItem').run()} title="Unindent List Item">
            <IndentDecrease size={iconSize} className={
              clsx(!editor.can().liftListItem('listItem') ? "text-neutral-300" : toolbarIconClass(true))}/>
          </span>
        </div>
        <div className="flex justify-center items-center mr-8 my-1 space-x-3">
          <span onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1">
            <Heading1 size={iconSize} className={toolbarIconClass(editor.isActive('heading', { level: 1 }))}/>
          </span>
          <span onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">
            <Heading2 size={iconSize} className={toolbarIconClass(editor.isActive('heading', { level: 2 }))}/>
          </span>
          <span onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3">
            <Heading3 size={iconSize} className={toolbarIconClass(editor.isActive('heading', { level: 3 }))}/>
          </span>
          <span onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} title="Heading 4">
            <Heading4 size={iconSize} className={toolbarIconClass(editor.isActive('heading', { level: 4 }))}/>
          </span>
          <span onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()} title="Heading 5">
            <Heading5 size={iconSize} className={toolbarIconClass(editor.isActive('heading', { level: 5 }))}/>
          </span>
          <span onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()} title="Heading 6">
            <Heading6 size={iconSize} className={toolbarIconClass(editor.isActive('heading', { level: 6 }))}/>
          </span>
        </div>
        
        <div className="flex justify-center items-center mr-8 my-1 space-x-3">
          <span onClick={setLink} title="Link">
            <Link2 size={iconSize} className={toolbarIconClass(editor.isActive('link'))}/>
          </span>
          
          <span onClick={() => inputFileRef.current?.click()} title="Insert Image">
            <input ref={inputFileRef} type="file" style={{display: "none"}} accept="image/*" onChange={addImage}></input>
            <ImageIcon size={iconSize} className={toolbarIconClass(false)}/>
          </span>
        </div>
      </div>
}

interface Props {
  placeholder: string;
  content?: string | undefined;
  onChange: (content: string) => void;
}

export default function TipTapEditor({
  placeholder,
  content,
  onChange
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || "Write something...",
      }),
      Underline, 
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph', 'image'],
      }),
      TextStyle,
      FontSize,
      
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
        protocols: ['http', 'https'],
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
          class: "text-blue-500 underline"
        },
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        spellcheck: 'false',
        class: 'prose focus:outline-none text-base text-black h-full',
      }
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!!!content && editor) {
      editor.commands.clearContent();
    }
  }, [content, editor]);

  

  if(!editor) return <div>Loading editor...</div>;

  return (
    <div className="rounded-md border">
      <TipTapToolbar editor={editor} />
      <div className="h-[400px] p-[10px] overflow-auto" >
        <EditorContent editor={editor} style={{all: "unset"}}/>

      </div>
      
    </div>
  );
}
