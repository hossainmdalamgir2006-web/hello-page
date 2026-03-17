import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  Heading1, Heading2, Heading3, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link, Unlink, Quote, Minus, Code, RemoveFormatting, Undo, Redo,
  Palette, Image, ChevronDown, Eye, Code2,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  minHeight?: string;
  disabled?: boolean;
  readOnly?: boolean;
  toolbar?: "full" | "minimal";
}

const PRESET_COLORS = [
  "hsl(0, 0%, 0%)", "hsl(0, 0%, 30%)", "hsl(0, 0%, 50%)", "hsl(0, 0%, 70%)",
  "hsl(0, 72%, 51%)", "hsl(25, 95%, 53%)", "hsl(48, 96%, 53%)", "hsl(142, 71%, 45%)",
  "hsl(199, 89%, 48%)", "hsl(217, 91%, 60%)", "hsl(263, 70%, 50%)", "hsl(330, 81%, 60%)",
];

type ToolbarAction = {
  icon: React.ElementType;
  command: string;
  value?: string;
  label: string;
  type?: "button" | "divider";
};

const RichTextEditor = React.forwardRef<HTMLDivElement, RichTextEditorProps>(
  ({ value, onChange, placeholder, className, maxLength, minHeight = "120px", disabled = false, readOnly = false, toolbar = "full" }, ref) => {
    const editorRef = React.useRef<HTMLDivElement>(null);
    const [charCount, setCharCount] = React.useState(0);
    const [activeFormats, setActiveFormats] = React.useState<Set<string>>(new Set());
    const [showSource, setShowSource] = React.useState(false);
    const [sourceValue, setSourceValue] = React.useState("");
    const [linkUrl, setLinkUrl] = React.useState("");
    const [linkOpen, setLinkOpen] = React.useState(false);
    const [imageUrl, setImageUrl] = React.useState("");
    const [imageOpen, setImageOpen] = React.useState(false);

    // Sync value into editor
    React.useEffect(() => {
      if (editorRef.current && !showSource) {
        if (editorRef.current.innerHTML !== value) {
          editorRef.current.innerHTML = value || "";
        }
      }
      setCharCount(editorRef.current?.textContent?.length || 0);
    }, [value, showSource]);

    const execCommand = (command: string, val?: string) => {
      document.execCommand(command, false, val);
      editorRef.current?.focus();
      syncContent();
      detectFormats();
    };

    const syncContent = () => {
      if (!editorRef.current) return;
      const html = editorRef.current.innerHTML;
      const textLen = editorRef.current.textContent?.length || 0;
      setCharCount(textLen);
      if (maxLength && textLen > maxLength) return;
      onChange(html === "<br>" ? "" : html);
    };

    const detectFormats = () => {
      const formats = new Set<string>();
      if (document.queryCommandState("bold")) formats.add("bold");
      if (document.queryCommandState("italic")) formats.add("italic");
      if (document.queryCommandState("underline")) formats.add("underline");
      if (document.queryCommandState("strikeThrough")) formats.add("strikeThrough");
      if (document.queryCommandState("insertUnorderedList")) formats.add("insertUnorderedList");
      if (document.queryCommandState("insertOrderedList")) formats.add("insertOrderedList");

      const block = document.queryCommandValue("formatBlock")?.toLowerCase();
      if (block) formats.add(`formatBlock:${block}`);

      const align = document.queryCommandValue("justifyLeft") ? "left"
        : document.queryCommandValue("justifyCenter") ? "center"
        : document.queryCommandValue("justifyRight") ? "right"
        : document.queryCommandValue("justifyFull") ? "justify" : "";
      if (document.queryCommandState("justifyLeft")) formats.add("justifyLeft");
      if (document.queryCommandState("justifyCenter")) formats.add("justifyCenter");
      if (document.queryCommandState("justifyRight")) formats.add("justifyRight");
      if (document.queryCommandState("justifyFull")) formats.add("justifyFull");

      setActiveFormats(formats);
    };

    const handleInput = () => {
      syncContent();
      detectFormats();
    };

    const handleKeyUp = () => detectFormats();
    const handleMouseUp = () => detectFormats();

    const handleInsertLink = () => {
      if (linkUrl) {
        execCommand("createLink", linkUrl);
        setLinkUrl("");
        setLinkOpen(false);
      }
    };

    const handleInsertImage = () => {
      if (imageUrl) {
        execCommand("insertImage", imageUrl);
        setImageUrl("");
        setImageOpen(false);
      }
    };

    const toggleSource = () => {
      if (!showSource) {
        setSourceValue(value || "");
      } else {
        onChange(sourceValue);
      }
      setShowSource(!showSource);
    };

    const isActive = (cmd: string) => activeFormats.has(cmd);
    const isBlockActive = (tag: string) => activeFormats.has(`formatBlock:${tag}`);

    const ToolBtn = ({ icon: Icon, command, value: cmdValue, label, active }: {
      icon: React.ElementType; command?: string; value?: string; label: string; active?: boolean;
    } & { onClick?: () => void }) => (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              disabled={disabled || readOnly}
              onMouseDown={(e) => {
                e.preventDefault();
                if (command) execCommand(command, cmdValue);
              }}
              className={cn(
                "h-7 w-7 flex items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
                "disabled:opacity-40 disabled:pointer-events-none",
                active && "bg-accent text-accent-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">{label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    const Divider = () => <div className="mx-1 h-5 w-px bg-border self-center" />;

    const currentHeading = isBlockActive("h1") ? "H1" : isBlockActive("h2") ? "H2" : isBlockActive("h3") ? "H3" : "¶";

    return (
      <div className={cn(
        "rounded-md border border-input bg-background overflow-hidden",
        disabled && "opacity-60 pointer-events-none",
        className
      )}>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 border-b border-input p-1 bg-muted/30">
          {/* Text style */}
          <ToolBtn icon={Bold} command="bold" label="Bold (Ctrl+B)" active={isActive("bold")} />
          <ToolBtn icon={Italic} command="italic" label="Italic (Ctrl+I)" active={isActive("italic")} />
          <ToolBtn icon={Underline} command="underline" label="Underline (Ctrl+U)" active={isActive("underline")} />
          <ToolBtn icon={Strikethrough} command="strikeThrough" label="Strikethrough" active={isActive("strikeThrough")} />

          <Divider />

          {/* Headings dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                disabled={disabled || readOnly}
                className="h-7 px-1.5 flex items-center gap-0.5 rounded text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-40"
              >
                {currentHeading}
                <ChevronDown className="h-3 w-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[120px]">
              <DropdownMenuItem onSelect={() => execCommand("formatBlock", "p")}>
                <span className="text-sm">Paragraph</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => execCommand("formatBlock", "h1")}>
                <span className="text-lg font-bold">Heading 1</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => execCommand("formatBlock", "h2")}>
                <span className="text-base font-bold">Heading 2</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => execCommand("formatBlock", "h3")}>
                <span className="text-sm font-bold">Heading 3</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Divider />

          {/* Lists */}
          <ToolBtn icon={List} command="insertUnorderedList" label="Bullet List" active={isActive("insertUnorderedList")} />
          <ToolBtn icon={ListOrdered} command="insertOrderedList" label="Numbered List" active={isActive("insertOrderedList")} />
          <ToolBtn icon={Quote} command="formatBlock" value="blockquote" label="Blockquote" active={isBlockActive("blockquote")} />

          <Divider />

          {/* Alignment */}
          <ToolBtn icon={AlignLeft} command="justifyLeft" label="Align Left" active={isActive("justifyLeft")} />
          <ToolBtn icon={AlignCenter} command="justifyCenter" label="Align Center" active={isActive("justifyCenter")} />
          <ToolBtn icon={AlignRight} command="justifyRight" label="Align Right" active={isActive("justifyRight")} />
          {toolbar === "full" && (
            <ToolBtn icon={AlignJustify} command="justifyFull" label="Justify" active={isActive("justifyFull")} />
          )}

          <Divider />

          {/* Link */}
          <Popover open={linkOpen} onOpenChange={setLinkOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={disabled || readOnly}
                className="h-7 w-7 flex items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-40"
              >
                <Link className="h-3.5 w-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2 space-y-2" align="start">
              <Input
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleInsertLink()}
                className="h-8 text-xs"
              />
              <Button size="sm" className="w-full h-7 text-xs" onClick={handleInsertLink}>
                Insert Link
              </Button>
            </PopoverContent>
          </Popover>
          <ToolBtn icon={Unlink} command="unlink" label="Remove Link" />

          {toolbar === "full" && (
            <>
              <Divider />

              {/* Color picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    disabled={disabled || readOnly}
                    className="h-7 w-7 flex items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-40"
                  >
                    <Palette className="h-3.5 w-3.5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start">
                  <div className="grid grid-cols-4 gap-1">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className="h-6 w-6 rounded border border-input hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          execCommand("foreColor", color);
                        }}
                      />
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Image */}
              <Popover open={imageOpen} onOpenChange={setImageOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    disabled={disabled || readOnly}
                    className="h-7 w-7 flex items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-40"
                  >
                    <Image className="h-3.5 w-3.5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2 space-y-2" align="start">
                  <Input
                    placeholder="Image URL"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleInsertImage()}
                    className="h-8 text-xs"
                  />
                  <Button size="sm" className="w-full h-7 text-xs" onClick={handleInsertImage}>
                    Insert Image
                  </Button>
                </PopoverContent>
              </Popover>

              <ToolBtn icon={Minus} command="insertHorizontalRule" label="Horizontal Rule" />
              <ToolBtn icon={Code} command="formatBlock" value="pre" label="Code Block" active={isBlockActive("pre")} />
            </>
          )}

          <Divider />

          <ToolBtn icon={RemoveFormatting} command="removeFormat" label="Clear Formatting" />
          <ToolBtn icon={Undo} command="undo" label="Undo (Ctrl+Z)" />
          <ToolBtn icon={Redo} command="redo" label="Redo (Ctrl+Y)" />

          {toolbar === "full" && (
            <>
              <Divider />
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); toggleSource(); }}
                      className={cn(
                        "h-7 w-7 flex items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
                        showSource && "bg-accent text-accent-foreground"
                      )}
                    >
                      {showSource ? <Eye className="h-3.5 w-3.5" /> : <Code2 className="h-3.5 w-3.5" />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    {showSource ? "Visual View" : "HTML Source"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>

        {/* Editor area */}
        {showSource ? (
          <textarea
            value={sourceValue}
            onChange={(e) => setSourceValue(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono bg-background text-foreground outline-none resize-y"
            style={{ minHeight }}
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
              "px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background rounded-b-md",
              "prose prose-sm max-w-none dark:prose-invert",
              "[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-muted-foreground [&:empty]:before:pointer-events-none",
              "[&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
              "[&_pre]:bg-muted [&_pre]:rounded [&_pre]:p-2 [&_pre]:text-xs [&_pre]:font-mono",
              "[&_img]:max-w-full [&_img]:rounded [&_img]:my-2",
              "[&_hr]:border-border [&_hr]:my-3"
            )}
            style={{ minHeight }}
          />
        )}

        {/* Footer */}
        {maxLength && (
          <div className="flex justify-end px-3 py-1 border-t border-input bg-muted/20">
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
export type { RichTextEditorProps };
