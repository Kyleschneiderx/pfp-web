"use client";

import clsx from "clsx";
import {
  CompositeDecorator,
  ContentState,
  DraftHandleValue,
  Editor,
  EditorState,
  Modifier,
  RichUtils,
} from "draft-js";
import "draft-js/dist/Draft.css";
import htmlToDraft from "html-to-draftjs";
import {
  Bold,
  Heading,
  Italic,
  Link2,
  List,
  Quote,
  Strikethrough,
  Underline,
} from "lucide-react";
import React, { useEffect, useState } from "react";

const blockStyleFn = (block: any) => {
  switch (block.getType()) {
    case "header-one":
      return "text-2xl font-bold";
    case "blockquote":
      return "border-l-4 border-gray-400 pl-4";
    default:
      return "";
  }
};

const findLinkEntities = (
  contentBlock: any,
  callback: any,
  contentState: ContentState
) => {
  contentBlock.findEntityRanges((character: any) => {
    const entityKey = character.getEntity();
    return (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === "LINK"
    );
  }, callback);
};

const Link = (props: any) => {
  const { url } = props.contentState.getEntity(props.entityKey).getData();
  return (
    <a href={url} style={{ color: "blue", textDecoration: "underline" }}>
      {props.children}
    </a>
  );
};

const decorator = new CompositeDecorator([
  {
    strategy: findLinkEntities,
    component: Link,
  },
]);

interface Props {
  placeholder: string;
  content?: string | null;
  onChange: (content: EditorState) => void;
  isSaved?: boolean;
  isEdit?: boolean;
}

export default function RichTextEditor({
  placeholder,
  content,
  onChange,
  isSaved = false,
  isEdit = false,
}: Props) {
  const [editorState, setEditorState] = useState(
    EditorState.createEmpty(decorator)
  );
  const iconSize = 16;
  const iconClassname = (isActive: boolean) => {
    return clsx(isActive ? "text-black" : "text-neutral-500", "cursor-pointer");
  };

  useEffect(() => {
    if (content) {
      const blocksFromHtml = htmlToDraft(content);
      const { contentBlocks, entityMap } = blocksFromHtml;
      const contentState = ContentState.createFromBlockArray(
        contentBlocks,
        entityMap
      );
      setEditorState(EditorState.createWithContent(contentState, decorator));
    }
  }, [content]);

  useEffect(() => {
    if (isSaved && !isEdit) {
      setEditorState(EditorState.createEmpty(decorator));
    }
  }, [isSaved]);

  const handleEditorChange = (editorState: EditorState) => {
    setEditorState(editorState);
    onChange(editorState);
  };

  const handleKeyCommand = (
    command: string,
    editorState: EditorState
  ): DraftHandleValue => {
    const newState = RichUtils.handleKeyCommand(editorState, command);

    if (newState) {
      setEditorState(newState);
      return "handled";
    }

    return "not-handled";
  };

  const handleInlineClick = (e: React.MouseEvent, type: string) => {
    e?.preventDefault();
    const newState = RichUtils.toggleInlineStyle(editorState, type);
    setEditorState(newState);
  };

  const handleBlockClick = (e: React.MouseEvent, blockType: string) => {
    e.preventDefault();
    const newState = RichUtils.toggleBlockType(editorState, blockType);
    setEditorState(newState);
  };

  // Custom function to handle the "Enter" key
  const handleReturn = (
    e: React.KeyboardEvent,
    editorState: EditorState
  ): DraftHandleValue => {
    const selection = editorState.getSelection();

    // Check if the selection is collapsed (i.e., no text is selected)
    if (selection.isCollapsed()) {
      return "not-handled"; // Return 'not-handled' to continue with default behavior
    } else {
      // If there's an active selection, handle the enter key to clear it
      const newContent = RichUtils.toggleBlockType(editorState, "unstyled");
      setEditorState(newContent);
      return "handled"; // Prevent the default behavior (text deletion)
    }
  };

  const promptForLink = () => {
    const selection = editorState.getSelection();

    if (!selection.isCollapsed()) {
      const url = window.prompt("Enter a URL:");
      if (url) {
        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity(
          "LINK",
          "MUTABLE",
          { url }
        );
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

        const newContentState = Modifier.applyEntity(
          contentStateWithEntity,
          selection,
          entityKey
        );

        const newEditorState = EditorState.push(
          editorState,
          newContentState,
          "apply-entity"
        );
        setEditorState(newEditorState);
      }
    }
  };

  const isBold = editorState.getCurrentInlineStyle().has("BOLD");
  const isItalic = editorState.getCurrentInlineStyle().has("ITALIC");
  const isStrikeThrough = editorState
    .getCurrentInlineStyle()
    .has("STRIKETHROUGH");
  const isUnderline = editorState.getCurrentInlineStyle().has("UNDERLINE");

  const selection = editorState.getSelection();

  const contentState = editorState.getCurrentContent();
  const currentBlockType = contentState
    .getBlockForKey(selection.getStartKey())
    .getType();

  const isHeader = currentBlockType === "header-one";
  const isUnorderedList = currentBlockType === "unordered-list-item";
  const isBlockquote = currentBlockType === "blockquote";

  const startKey = selection.getStartKey();
  const startOffset = selection.getStartOffset();
  const blockWithLink = contentState.getBlockForKey(startKey);
  const linkKey = blockWithLink.getEntityAt(startOffset);

  let isLink = false;
  if (linkKey) {
    const entity = contentState.getEntity(linkKey);
    if (entity.getType() === "LINK") {
      isLink = true;
    }
  }

  return (
    <div className="rounded-md border">
      <div className="h-[400px] p-[10px] overflow-auto">
        <Editor
          editorState={editorState}
          onChange={handleEditorChange}
          handleKeyCommand={handleKeyCommand}
          handleReturn={handleReturn}
          blockStyleFn={blockStyleFn}
          placeholder={placeholder}
        />
      </div>
      <div className="flex bg-neutral-100 p-[10px] space-x-4">
        <span onMouseDown={(e) => handleInlineClick(e, "BOLD")}>
          <Bold size={iconSize} className={iconClassname(isBold)} />
        </span>
        <span onMouseDown={(e) => handleInlineClick(e, "ITALIC")}>
          <Italic size={iconSize} className={iconClassname(isItalic)} />
        </span>
        <span onMouseDown={(e) => handleInlineClick(e, "UNDERLINE")}>
          <Underline size={iconSize} className={iconClassname(isUnderline)} />
        </span>
        <span onMouseDown={(e) => handleInlineClick(e, "STRIKETHROUGH")}>
          <Strikethrough
            size={iconSize}
            className={iconClassname(isStrikeThrough)}
          />
        </span>
        <span onMouseDown={(e) => handleBlockClick(e, "header-one")}>
          <Heading size={iconSize} className={iconClassname(isHeader)} />
        </span>
        <span onMouseDown={(e) => handleBlockClick(e, "unordered-list-item")}>
          <List size={iconSize} className={iconClassname(isUnorderedList)} />
        </span>
        <span onMouseDown={(e) => handleBlockClick(e, "blockquote")}>
          <Quote size={iconSize} className={iconClassname(isBlockquote)} />
        </span>
        <span
          onMouseDown={(e) => {
            e.preventDefault();
            promptForLink();
          }}
        >
          <Link2 size={iconSize} className={iconClassname(isLink)} />
        </span>
      </div>
    </div>
  );
}
