import * as React from "react";
import { cn } from "@/lib/utils";
import { EditorToolbar } from "./EditorToolbar";
import { FindReplaceBar } from "./FindReplaceBar";
import type { RichTextEditorProps } from "./types";

const RichTextEditor = React.forwardRef<HTMLDivElement, RichTextEditorProps>(
  ({ value, onChange, placeholder, className, maxLength, minHeight = "120px", disabled = false, readOnly = false, toolbar = "full" }, ref) => {
    const editorRef = React.useRef<HTMLDivElement>(null);
    const savedRangeRef = React.useRef<Range | null>(null);
    const [charCount, setCharCount] = React.useState(0);
    const [wordCount, setWordCount] = React.useState(0);
    const [activeFormats, setActiveFormats] = React.useState<Set<string>>(new Set());
    const [showSource, setShowSource] = React.useState(false);
    const [sourceValue, setSourceValue] = React.useState("");
    const [isFullscreen, setIsFullscreen] = React.useState(false);
    const [showFindReplace, setShowFindReplace] = React.useState(false);

    React.useEffect(() => {
      if (editorRef.current && !showSource) {
        if (editorRef.current.innerHTML !== value) {
          editorRef.current.innerHTML = value || "";
        }
      }
      updateCounts();
    }, [value, showSource]);

    React.useEffect(() => {
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape" && isFullscreen) setIsFullscreen(false);
      };
      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }, [isFullscreen]);

    const updateCounts = () => {
      const text = editorRef.current?.textContent || "";
      setCharCount(text.length);
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    };

    const saveSelection = () => {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        savedRangeRef.current = sel.getRangeAt(0).cloneRange();
      }
    };

    const restoreSelection = () => {
      if (savedRangeRef.current && editorRef.current) {
        editorRef.current.focus();
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(savedRangeRef.current);
        }
      }
    };

    const execCommand = (command: string, val?: string) => {
      restoreSelection();
      document.execCommand(command, false, val);
      editorRef.current?.focus();
      syncContent();
      detectFormats();
    };

    const syncContent = () => {
      if (!editorRef.current) return;
      const html = editorRef.current.innerHTML;
      updateCounts();
      if (maxLength && (editorRef.current.textContent?.length || 0) > maxLength) return;
      onChange(html === "<br>" ? "" : html);
    };

    const detectFormats = () => {
      const formats = new Set<string>();
      const cmds = ["bold", "italic", "underline", "strikeThrough", "superscript", "subscript", "insertUnorderedList", "insertOrderedList", "justifyLeft", "justifyCenter", "justifyRight", "justifyFull"];
      cmds.forEach(cmd => { if (document.queryCommandState(cmd)) formats.add(cmd); });
      const block = document.queryCommandValue("formatBlock")?.toLowerCase();
      if (block) formats.add(`formatBlock:${block}`);
      setActiveFormats(formats);
    };

    const handleInput = () => { syncContent(); detectFormats(); };
    const handleKeyUp = () => detectFormats();
    const handleMouseUp = () => detectFormats();

    const toggleSource = () => {
      if (!showSource) {
        setSourceValue(value || "");
      } else {
        onChange(sourceValue);
      }
      setShowSource(!showSource);
    };

    const handleInsertTable = (rows: number, cols: number) => {
      let html = '<table style="border-collapse:collapse;width:100%">';
      for (let r = 0; r < rows; r++) {
        html += "<tr>";
        for (let c = 0; c < cols; c++) {
          html += '<td style="border:1px solid hsl(var(--border));padding:4px 8px;min-width:40px">&nbsp;</td>';
        }
        html += "</tr>";
      }
      html += "</table><p><br></p>";
      restoreSelection();
      document.execCommand("insertHTML", false, html);
      editorRef.current?.focus();
      syncContent();
    };

    const handleInsertEmoji = (emoji: string) => {
      restoreSelection();
      document.execCommand("insertText", false, emoji);
      editorRef.current?.focus();
      syncContent();
    };

    const handleInsertChar = (char: string) => {
      restoreSelection();
      document.execCommand("insertText", false, char);
      editorRef.current?.focus();
      syncContent();
    };

    const handleInsertLink = (url: string) => {
      execCommand("createLink", url);
    };

    const handleInsertImage = (url: string) => {
      execCommand("insertImage", url);
    };

    const handleInsertVideo = (url: string) => {
      let embedUrl = url;
      const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
      if (ytMatch) {
        embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
      }
      const html = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;margin:8px 0"><iframe src="${embedUrl}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" allowfullscreen></iframe></div><p><br></p>`;
      restoreSelection();
      document.execCommand("insertHTML", false, html);
      editorRef.current?.focus();
      syncContent();
    };

    const handleSetLineHeight = (value: string) => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      const span = document.createElement("span");
      span.style.lineHeight = value;
      range.surroundContents(span);
      editorRef.current?.focus();
      syncContent();
    };

    const handleToggleDirection = () => {
      if (!editorRef.current) return;
      const current = editorRef.current.dir || "ltr";
      editorRef.current.dir = current === "ltr" ? "rtl" : "ltr";
    };

    const handlePrint = () => {
      if (!editorRef.current) return;
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;
      printWindow.document.write(`<!DOCTYPE html><html><head><title>Print</title><style>body{font-family:system-ui,sans-serif;padding:20px;max-width:800px;margin:0 auto}img{max-width:100%}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:4px 8px}</style></head><body>${editorRef.current.innerHTML}</body></html>`);
      printWindow.document.close();
      printWindow.print();
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-md border border-input bg-background overflow-hidden",
          disabled && "opacity-60 pointer-events-none",
          isFullscreen && "fixed inset-0 z-50 rounded-none border-none flex flex-col",
          className
        )}
      >
        <EditorToolbar
          toolbar={toolbar}
          disabled={disabled}
          readOnly={readOnly}
          activeFormats={activeFormats}
          showSource={showSource}
          isFullscreen={isFullscreen}
          execCommand={execCommand}
          onToggleSource={toggleSource}
          onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
          onInsertTable={handleInsertTable}
          onInsertEmoji={handleInsertEmoji}
          onInsertLink={handleInsertLink}
          onInsertImage={handleInsertImage}
          onInsertChar={handleInsertChar}
          onInsertVideo={handleInsertVideo}
          onSetLineHeight={handleSetLineHeight}
          onToggleFindReplace={() => setShowFindReplace(!showFindReplace)}
          onToggleDirection={handleToggleDirection}
          onPrint={handlePrint}
        />

        {showFindReplace && (
          <FindReplaceBar
            editorRef={editorRef}
            onClose={() => setShowFindReplace(false)}
            syncContent={syncContent}
          />
        )}

        {showSource ? (
          <textarea
            value={sourceValue}
            onChange={(e) => setSourceValue(e.target.value)}
            className={cn("w-full px-3 py-2 text-sm font-mono bg-background text-foreground outline-none resize-y", isFullscreen && "flex-1")}
            style={isFullscreen ? undefined : { minHeight }}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable={!disabled && !readOnly}
            onInput={handleInput}
            onKeyUp={handleKeyUp}
            onMouseUp={handleMouseUp}
            onFocus={detectFormats}
            data-placeholder={placeholder}
            className={cn(
              "px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
              "prose prose-sm max-w-none dark:prose-invert",
              "[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-muted-foreground [&:empty]:before:pointer-events-none",
              "[&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
              "[&_pre]:bg-muted [&_pre]:rounded [&_pre]:p-2 [&_pre]:text-xs [&_pre]:font-mono",
              "[&_img]:max-w-full [&_img]:rounded [&_img]:my-2",
              "[&_hr]:border-border [&_hr]:my-3",
              "[&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-border [&_td]:p-1 [&_th]:border [&_th]:border-border [&_th]:p-1",
              isFullscreen && "flex-1 overflow-y-auto"
            )}
            style={isFullscreen ? undefined : { minHeight }}
          />
        )}

        <div className="flex justify-between px-3 py-1 border-t border-input bg-muted/20">
          <span className="text-xs text-muted-foreground">
            {wordCount} word{wordCount !== 1 ? "s" : ""}
          </span>
          {maxLength ? (
            <span className={cn("text-xs", charCount > maxLength ? "text-destructive" : "text-muted-foreground")}>
              {charCount}/{maxLength}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">{charCount} chars</span>
          )}
        </div>
      </div>
    );
  }
);
RichTextEditor.displayName = "RichTextEditor";

export { RichTextEditor };
