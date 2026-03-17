import * as React from "react";
import { cn } from "@/lib/utils";
import { Toggle } from "@/components/ui/toggle";
import { Bold, Italic, List, ListOrdered, Heading2, Link, Undo, Redo } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
}

const RichTextEditor = React.forwardRef<HTMLDivElement, RichTextEditorProps>(
  ({ value, onChange, placeholder, className, maxLength }, ref) => {
    const editorRef = React.useRef<HTMLDivElement>(null);
    const [charCount, setCharCount] = React.useState(0);

    React.useEffect(() => {
      if (editorRef.current && editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || "";
      }
      setCharCount(editorRef.current?.textContent?.length || 0);
    }, [value]);

    const execCommand = (command: string, value?: string) => {
      document.execCommand(command, false, value);
      editorRef.current?.focus();
      handleInput();
    };

    const handleInput = () => {
      if (editorRef.current) {
        const html = editorRef.current.innerHTML;
        const textLen = editorRef.current.textContent?.length || 0;
        setCharCount(textLen);
        if (maxLength && textLen > maxLength) return;
        onChange(html === "<br>" ? "" : html);
      }
    };

    const handleLink = () => {
      const url = prompt("Enter URL:");
      if (url) {
        execCommand("createLink", url);
      }
    };

    return (
      <div className={cn("rounded-md border border-input bg-background", className)}>
        <div className="flex flex-wrap gap-0.5 border-b border-input p-1">
          <Toggle size="sm" className="h-7 w-7 p-0" onPressedChange={() => execCommand("bold")}>
            <Bold className="h-3.5 w-3.5" />
          </Toggle>
          <Toggle size="sm" className="h-7 w-7 p-0" onPressedChange={() => execCommand("italic")}>
            <Italic className="h-3.5 w-3.5" />
          </Toggle>
          <Toggle size="sm" className="h-7 w-7 p-0" onPressedChange={() => execCommand("formatBlock", "h2")}>
            <Heading2 className="h-3.5 w-3.5" />
          </Toggle>
          <Toggle size="sm" className="h-7 w-7 p-0" onPressedChange={() => execCommand("insertUnorderedList")}>
            <List className="h-3.5 w-3.5" />
          </Toggle>
          <Toggle size="sm" className="h-7 w-7 p-0" onPressedChange={() => execCommand("insertOrderedList")}>
            <ListOrdered className="h-3.5 w-3.5" />
          </Toggle>
          <Toggle size="sm" className="h-7 w-7 p-0" onPressedChange={handleLink}>
            <Link className="h-3.5 w-3.5" />
          </Toggle>
          <div className="mx-1 w-px bg-border" />
          <Toggle size="sm" className="h-7 w-7 p-0" onPressedChange={() => execCommand("undo")}>
            <Undo className="h-3.5 w-3.5" />
          </Toggle>
          <Toggle size="sm" className="h-7 w-7 p-0" onPressedChange={() => execCommand("redo")}>
            <Redo className="h-3.5 w-3.5" />
          </Toggle>
        </div>
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          data-placeholder={placeholder}
          className={cn(
            "min-h-[100px] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background rounded-b-md",
            "prose prose-sm max-w-none dark:prose-invert",
            "[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-muted-foreground [&:empty]:before:pointer-events-none"
          )}
        />
        {maxLength && (
          <div className="flex justify-end px-3 py-1 border-t border-input">
            <span className={cn("text-xs", charCount > maxLength ? "text-destructive" : "text-muted-foreground")}>
              {charCount}/{maxLength}
            </span>
          </div>
        )}
      </div>
    );
  }
);
RichTextEditor.displayName = "RichTextEditor";

export { RichTextEditor };
