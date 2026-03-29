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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link, Unlink, Quote, Minus, Code, RemoveFormatting, Undo, Redo,
  Palette, Image, ChevronDown, Eye, Code2,
  Superscript, Subscript, Indent, Outdent, Highlighter, Maximize, Minimize,
  Type, LineChart, Search, Printer, ArrowRightLeft, Video, Upload, CheckSquare,
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
  onSaveSelection: () => void;
}

export const EditorToolbar = ({
  toolbar, disabled, readOnly, activeFormats, showSource, isFullscreen,
  execCommand, onToggleSource, onToggleFullscreen,
  onInsertTable, onInsertEmoji, onInsertLink, onInsertImage,
  onInsertChar, onInsertVideo, onSetLineHeight,
  onToggleFindReplace, onToggleDirection, onPrint, onSaveSelection,
}: EditorToolbarProps) => {
  const [linkUrl, setLinkUrl] = React.useState("");
  const [linkOpen, setLinkOpen] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState("");
  const [imageOpen, setImageOpen] = React.useState(false);
  const [videoUrl, setVideoUrl] = React.useState("");
  const [videoOpen, setVideoOpen] = React.useState(false);
  const imageFileRef = React.useRef<HTMLInputElement>(null);
  const videoFileRef = React.useRef<HTMLInputElement>(null);

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

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onInsertImage(reader.result);
        setImageOpen(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        const html = `<video controls style="max-width:100%;border-radius:8px;" src="${reader.result}"></video>`;
        document.execCommand("insertHTML", false, html);
        setVideoOpen(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-input p-1 bg-muted/30">
      {/* 1. Undo / Redo */}
      <ToolBtn icon={Undo} command="undo" label="Undo (Ctrl+Z)" disabled={isDisabled} execCommand={execCommand} />
      <ToolBtn icon={Redo} command="redo" label="Redo (Ctrl+Y)" disabled={isDisabled} execCommand={execCommand} />

      <Divider />

      {/* 2. Headings */}
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

      {/* 3. Font Family & Size (full toolbar only) */}
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
        </>
      )}

      <Divider />

      {/* 4. Text Formatting */}
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

      {toolbar === "full" && (
        <>
          <Divider />

          {/* 5. Text & Highlight Color */}
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
        </>
      )}

      <Divider />

      {/* 6. Alignment */}
      <ToolBtn icon={AlignLeft} command="justifyLeft" label="Align Left" active={isActive("justifyLeft")} disabled={isDisabled} execCommand={execCommand} />
      <ToolBtn icon={AlignCenter} command="justifyCenter" label="Align Center" active={isActive("justifyCenter")} disabled={isDisabled} execCommand={execCommand} />
      <ToolBtn icon={AlignRight} command="justifyRight" label="Align Right" active={isActive("justifyRight")} disabled={isDisabled} execCommand={execCommand} />
      {toolbar === "full" && (
        <ToolBtn icon={AlignJustify} command="justifyFull" label="Justify" active={isActive("justifyFull")} disabled={isDisabled} execCommand={execCommand} />
      )}

      <Divider />

      {/* 7. Lists & Indentation */}
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

      {/* 8. Link */}
      <Popover open={linkOpen} onOpenChange={(open) => { if (open) onSaveSelection(); setLinkOpen(open); }}>
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

          {/* 9. Media: Image, Video, Table */}
          <Popover open={imageOpen} onOpenChange={(open) => { if (open) onSaveSelection(); setImageOpen(open); }}>
            <PopoverTrigger asChild>
              <button type="button" disabled={isDisabled} className="h-7 w-7 flex items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-40">
                <Image className="h-3.5 w-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-2" align="start">
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="w-full h-8 mb-2">
                  <TabsTrigger value="upload" className="text-xs h-7 flex-1"><Upload className="h-3 w-3 mr-1" />Upload</TabsTrigger>
                  <TabsTrigger value="url" className="text-xs h-7 flex-1"><Link className="h-3 w-3 mr-1" />URL</TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="mt-0 space-y-2">
                  <input ref={imageFileRef} type="file" accept="image/*" className="hidden" onChange={handleImageFileChange} />
                  <Button size="sm" variant="outline" className="w-full h-8 text-xs" onClick={() => imageFileRef.current?.click()}>
                    <Upload className="h-3.5 w-3.5 mr-1.5" />Choose Image File
                  </Button>
                  <p className="text-[10px] text-muted-foreground text-center">JPG, PNG, GIF, WebP</p>
                </TabsContent>
                <TabsContent value="url" className="mt-0 space-y-2">
                  <Input placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleInsertImage()} className="h-8 text-xs" />
                  <Button size="sm" className="w-full h-7 text-xs" onClick={handleInsertImage}>Insert Image</Button>
                </TabsContent>
              </Tabs>
            </PopoverContent>
          </Popover>

          <Popover open={videoOpen} onOpenChange={(open) => { if (open) onSaveSelection(); setVideoOpen(open); }}>
            <PopoverTrigger asChild>
              <button type="button" disabled={isDisabled} className="h-7 w-7 flex items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-40">
                <Video className="h-3.5 w-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-2" align="start">
              <Tabs defaultValue="url" className="w-full">
                <TabsList className="w-full h-8 mb-2">
                  <TabsTrigger value="url" className="text-xs h-7 flex-1"><Video className="h-3 w-3 mr-1" />YouTube/URL</TabsTrigger>
                  <TabsTrigger value="upload" className="text-xs h-7 flex-1"><Upload className="h-3 w-3 mr-1" />Upload</TabsTrigger>
                </TabsList>
                <TabsContent value="url" className="mt-0 space-y-2">
                  <Input placeholder="YouTube or video URL" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleInsertVideo()} className="h-8 text-xs" />
                  <Button size="sm" className="w-full h-7 text-xs" onClick={handleInsertVideo}>Embed Video</Button>
                </TabsContent>
                <TabsContent value="upload" className="mt-0 space-y-2">
                  <input ref={videoFileRef} type="file" accept="video/*" className="hidden" onChange={handleVideoFileChange} />
                  <Button size="sm" variant="outline" className="w-full h-8 text-xs" onClick={() => videoFileRef.current?.click()}>
                    <Upload className="h-3.5 w-3.5 mr-1.5" />Choose Video File
                  </Button>
                  <p className="text-[10px] text-muted-foreground text-center">MP4, WebM, OGG</p>
                </TabsContent>
              </Tabs>
            </PopoverContent>
          </Popover>

          <TablePicker disabled={isDisabled} onInsertTable={onInsertTable} />

          <Divider />

          {/* 10. Extras: Emoji, Special Chars, HR, Code */}
          <EmojiPicker disabled={isDisabled} onInsertEmoji={onInsertEmoji} />
          <SpecialCharsPicker disabled={isDisabled} onInsertChar={onInsertChar} />
          <ToolBtn icon={Minus} command="insertHorizontalRule" label="Horizontal Rule" disabled={isDisabled} execCommand={execCommand} />
          <ToolBtn icon={Code} command="formatBlock" value="pre" label="Code Block" active={isBlockActive("pre")} disabled={isDisabled} execCommand={execCommand} />
        </>
      )}

      <Divider />

      {/* 11. Clear Formatting */}
      <ToolBtn icon={RemoveFormatting} command="removeFormat" label="Clear Formatting" disabled={isDisabled} execCommand={execCommand} />

      {toolbar === "full" && (
        <>
          <Divider />

          {/* 12. Utilities: Direction, Find, Print, Fullscreen, Source */}
          <button
            type="button"
            disabled={isDisabled}
            onMouseDown={(e) => { e.preventDefault(); onToggleDirection(); }}
            className="h-7 w-7 flex items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-40"
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); onToggleFindReplace(); }}
            className="h-7 w-7 flex items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); onPrint(); }}
            className="h-7 w-7 flex items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Printer className="h-3.5 w-3.5" />
          </button>

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
