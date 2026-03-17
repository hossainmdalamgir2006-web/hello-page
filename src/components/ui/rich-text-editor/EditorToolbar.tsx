import * as React from "react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link, Unlink, Quote, Minus, Code, RemoveFormatting, Undo, Redo,
  Palette, Image, ChevronDown, Eye, Code2,
  Superscript, Subscript, Indent, Outdent, Highlighter, Maximize, Minimize,
  Type, LineChart, Search, Pilcrow, Printer, ArrowRightLeft, Video,
} from "lucide-react";
import { ToolBtn, Divider } from "./ToolBtn";
import { TablePicker } from "./TablePicker";
import { EmojiPicker } from "./EmojiPicker";
import { SpecialCharsPicker } from "./SpecialCharsPicker";
import { PRESET_COLORS, HIGHLIGHT_COLORS, FONT_SIZES, FONT_FAMILIES, LINE_HEIGHTS } from "./constants";

interface EditorToolbarProps {
  toolbar: "full" | "minimal";
  disabled: boolean;
  readOnly: boolean;
  activeFormats: Set<string>;
  showSource: boolean;
  isFullscreen: boolean;
  execCommand: (command: string, value?: string) => void;
  onToggleSource: () => void;
  onToggleFullscreen: () => void;
  onInsertTable: (rows: number, cols: number) => void;
  onInsertEmoji: (emoji: string) => void;
  onInsertLink: (url: string) => void;
  onInsertImage: (url: string) => void;
  onInsertChar: (char: string) => void;
  onInsertVideo: (url: string) => void;
  onSetLineHeight: (value: string) => void;
  onToggleFindReplace: () => void;
  onToggleDirection: () => void;
  onPrint: () => void;
}

export const EditorToolbar = ({
  toolbar, disabled, readOnly, activeFormats, showSource, isFullscreen,
  execCommand, onToggleSource, onToggleFullscreen,
  onInsertTable, onInsertEmoji, onInsertLink, onInsertImage,
  onInsertChar, onInsertVideo, onSetLineHeight,
  onToggleFindReplace, onToggleDirection, onPrint,
}: EditorToolbarProps) => {
  const [linkUrl, setLinkUrl] = React.useState("");
  const [linkOpen, setLinkOpen] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState("");
  const [imageOpen, setImageOpen] = React.useState(false);
  const [videoUrl, setVideoUrl] = React.useState("");
  const [videoOpen, setVideoOpen] = React.useState(false);

  const isDisabled = disabled || readOnly;
  const isActive = (cmd: string) => activeFormats.has(cmd);
  const isBlockActive = (tag: string) => activeFormats.has(`formatBlock:${tag}`);
  const currentHeading = isBlockActive("h1") ? "H1" : isBlockActive("h2") ? "H2" : isBlockActive("h3") ? "H3" : "¶";

  const handleInsertLink = () => {
    if (linkUrl) { onInsertLink(linkUrl); setLinkUrl(""); setLinkOpen(false); }
  };
  const handleInsertImage = () => {
    if (imageUrl) { onInsertImage(imageUrl); setImageUrl(""); setImageOpen(false); }
  };
  const handleInsertVideo = () => {
    if (videoUrl) { onInsertVideo(videoUrl); setVideoUrl(""); setVideoOpen(false); }
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-input p-1 bg-muted/30">
      {/* Text style */}
      <ToolBtn icon={Bold} command="bold" label="Bold (Ctrl+B)" active={isActive("bold")} disabled={isDisabled} execCommand={execCommand} />
      <ToolBtn icon={Italic} command="italic" label="Italic (Ctrl+I)" active={isActive("italic")} disabled={isDisabled} execCommand={execCommand} />
      <ToolBtn icon={Underline} command="underline" label="Underline (Ctrl+U)" active={isActive("underline")} disabled={isDisabled} execCommand={execCommand} />
      <ToolBtn icon={Strikethrough} command="strikeThrough" label="Strikethrough" active={isActive("strikeThrough")} disabled={isDisabled} execCommand={execCommand} />

      {toolbar === "full" && (
        <>
          <ToolBtn icon={Superscript} command="superscript" label="Superscript" active={isActive("superscript")} disabled={isDisabled} execCommand={execCommand} />
          <ToolBtn icon={Subscript} command="subscript" label="Subscript" active={isActive("subscript")} disabled={isDisabled} execCommand={execCommand} />
        </>
      )}

      <Divider />

      {/* Font Family & Size */}
      {toolbar === "full" && (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" disabled={isDisabled} className="h-7 px-1.5 flex items-center gap-0.5 rounded text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-40">
                <Type className="h-3 w-3 mr-0.5" />Font<ChevronDown className="h-3 w-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[140px]">
              {FONT_FAMILIES.map((f) => (
                <DropdownMenuItem key={f.value} onSelect={() => execCommand("fontName", f.value)}>
                  <span className="text-sm" style={{ fontFamily: f.value }}>{f.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" disabled={isDisabled} className="h-7 px-1.5 flex items-center gap-0.5 rounded text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-40">
                Size<ChevronDown className="h-3 w-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[100px]">
              {FONT_SIZES.map((s) => (
                <DropdownMenuItem key={s.value} onSelect={() => execCommand("fontSize", s.value)}>
                  <span className="text-sm">{s.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Line Height */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" disabled={isDisabled} className="h-7 px-1.5 flex items-center gap-0.5 rounded text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-40">
                <LineChart className="h-3 w-3 mr-0.5" />LH<ChevronDown className="h-3 w-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[80px]">
              {LINE_HEIGHTS.map((lh) => (
                <DropdownMenuItem key={lh.value} onSelect={() => onSetLineHeight(lh.value)}>
                  <span className="text-sm">{lh.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Divider />
        </>
      )}

      {/* Headings dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" disabled={isDisabled} className="h-7 px-1.5 flex items-center gap-0.5 rounded text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-40">
            {currentHeading}<ChevronDown className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[120px]">
          <DropdownMenuItem onSelect={() => execCommand("formatBlock", "p")}><span className="text-sm">Paragraph</span></DropdownMenuItem>
          <DropdownMenuItem onSelect={() => execCommand("formatBlock", "h1")}><span className="text-lg font-bold">Heading 1</span></DropdownMenuItem>
          <DropdownMenuItem onSelect={() => execCommand("formatBlock", "h2")}><span className="text-base font-bold">Heading 2</span></DropdownMenuItem>
          <DropdownMenuItem onSelect={() => execCommand("formatBlock", "h3")}><span className="text-sm font-bold">Heading 3</span></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Divider />

      {/* Lists */}
      <ToolBtn icon={List} command="insertUnorderedList" label="Bullet List" active={isActive("insertUnorderedList")} disabled={isDisabled} execCommand={execCommand} />
      <ToolBtn icon={ListOrdered} command="insertOrderedList" label="Numbered List" active={isActive("insertOrderedList")} disabled={isDisabled} execCommand={execCommand} />
      <ToolBtn icon={Quote} command="formatBlock" value="blockquote" label="Blockquote" active={isBlockActive("blockquote")} disabled={isDisabled} execCommand={execCommand} />

      {toolbar === "full" && (
        <>
          <ToolBtn icon={Indent} command="indent" label="Indent" disabled={isDisabled} execCommand={execCommand} />
          <ToolBtn icon={Outdent} command="outdent" label="Outdent" disabled={isDisabled} execCommand={execCommand} />
        </>
      )}

      <Divider />

      {/* Alignment */}
      <ToolBtn icon={AlignLeft} command="justifyLeft" label="Align Left" active={isActive("justifyLeft")} disabled={isDisabled} execCommand={execCommand} />
      <ToolBtn icon={AlignCenter} command="justifyCenter" label="Align Center" active={isActive("justifyCenter")} disabled={isDisabled} execCommand={execCommand} />
      <ToolBtn icon={AlignRight} command="justifyRight" label="Align Right" active={isActive("justifyRight")} disabled={isDisabled} execCommand={execCommand} />
      {toolbar === "full" && (
        <ToolBtn icon={AlignJustify} command="justifyFull" label="Justify" active={isActive("justifyFull")} disabled={isDisabled} execCommand={execCommand} />
      )}

      <Divider />

      {/* Link */}
      <Popover open={linkOpen} onOpenChange={setLinkOpen}>
        <PopoverTrigger asChild>
          <button type="button" disabled={isDisabled} className="h-7 w-7 flex items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-40">
            <Link className="h-3.5 w-3.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2 space-y-2" align="start">
          <Input placeholder="https://example.com" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleInsertLink()} className="h-8 text-xs" />
          <Button size="sm" className="w-full h-7 text-xs" onClick={handleInsertLink}>Insert Link</Button>
        </PopoverContent>
      </Popover>
      <ToolBtn icon={Unlink} command="unlink" label="Remove Link" disabled={isDisabled} execCommand={execCommand} />

      {toolbar === "full" && (
        <>
          <Divider />

          {/* Text Color */}
          <Popover>
            <PopoverTrigger asChild>
              <button type="button" disabled={isDisabled} className="h-7 w-7 flex items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-40">
                <Palette className="h-3.5 w-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" align="start">
              <div className="text-xs text-muted-foreground mb-1">Text Color</div>
              <div className="grid grid-cols-4 gap-1">
                {PRESET_COLORS.map((color) => (
                  <button key={color} type="button" className="h-6 w-6 rounded border border-input hover:scale-110 transition-transform" style={{ backgroundColor: color }} onMouseDown={(e) => { e.preventDefault(); execCommand("foreColor", color); }} />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Highlight Color */}
          <Popover>
            <PopoverTrigger asChild>
              <button type="button" disabled={isDisabled} className="h-7 w-7 flex items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-40">
                <Highlighter className="h-3.5 w-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" align="start">
              <div className="text-xs text-muted-foreground mb-1">Highlight Color</div>
              <div className="grid grid-cols-4 gap-1">
                {HIGHLIGHT_COLORS.map((color) => (
                  <button key={color} type="button" className="h-6 w-6 rounded border border-input hover:scale-110 transition-transform" style={{ backgroundColor: color }} onMouseDown={(e) => { e.preventDefault(); execCommand("hiliteColor", color); }} />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Image */}
          <Popover open={imageOpen} onOpenChange={setImageOpen}>
            <PopoverTrigger asChild>
              <button type="button" disabled={isDisabled} className="h-7 w-7 flex items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-40">
                <Image className="h-3.5 w-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2 space-y-2" align="start">
              <Input placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleInsertImage()} className="h-8 text-xs" />
              <Button size="sm" className="w-full h-7 text-xs" onClick={handleInsertImage}>Insert Image</Button>
            </PopoverContent>
          </Popover>

          {/* Video Embed */}
          <Popover open={videoOpen} onOpenChange={setVideoOpen}>
            <PopoverTrigger asChild>
              <button type="button" disabled={isDisabled} className="h-7 w-7 flex items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-40">
                <Video className="h-3.5 w-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-2 space-y-2" align="start">
              <Input placeholder="YouTube or video URL" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleInsertVideo()} className="h-8 text-xs" />
              <Button size="sm" className="w-full h-7 text-xs" onClick={handleInsertVideo}>Embed Video</Button>
            </PopoverContent>
          </Popover>

          {/* Table */}
          <TablePicker disabled={isDisabled} onInsertTable={onInsertTable} />

          {/* Emoji */}
          <EmojiPicker disabled={isDisabled} onInsertEmoji={onInsertEmoji} />

          {/* Special Characters */}
          <SpecialCharsPicker disabled={isDisabled} onInsertChar={onInsertChar} />

          <ToolBtn icon={Minus} command="insertHorizontalRule" label="Horizontal Rule" disabled={isDisabled} execCommand={execCommand} />
          <ToolBtn icon={Code} command="formatBlock" value="pre" label="Code Block" active={isBlockActive("pre")} disabled={isDisabled} execCommand={execCommand} />
        </>
      )}

      <Divider />

      <ToolBtn icon={RemoveFormatting} command="removeFormat" label="Clear Formatting" disabled={isDisabled} execCommand={execCommand} />
      <ToolBtn icon={Undo} command="undo" label="Undo (Ctrl+Z)" disabled={isDisabled} execCommand={execCommand} />
      <ToolBtn icon={Redo} command="redo" label="Redo (Ctrl+Y)" disabled={isDisabled} execCommand={execCommand} />

      {toolbar === "full" && (
        <>
          <Divider />

          {/* Text Direction */}
          <button
            type="button"
            disabled={isDisabled}
            onMouseDown={(e) => { e.preventDefault(); onToggleDirection(); }}
            className="h-7 w-7 flex items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-40"
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
          </button>

          {/* Find & Replace */}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); onToggleFindReplace(); }}
            className="h-7 w-7 flex items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
          </button>

          {/* Print */}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); onPrint(); }}
            className="h-7 w-7 flex items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Printer className="h-3.5 w-3.5" />
          </button>

          {/* Fullscreen */}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); onToggleFullscreen(); }}
            className={cn(
              "h-7 w-7 flex items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
              isFullscreen && "bg-accent text-accent-foreground"
            )}
          >
            {isFullscreen ? <Minimize className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
          </button>

          {/* Source toggle */}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); onToggleSource(); }}
            className={cn(
              "h-7 w-7 flex items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
              showSource && "bg-accent text-accent-foreground"
            )}
          >
            {showSource ? <Eye className="h-3.5 w-3.5" /> : <Code2 className="h-3.5 w-3.5" />}
          </button>
        </>
      )}
    </div>
  );
};
