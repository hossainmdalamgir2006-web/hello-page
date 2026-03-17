export interface RichTextEditorProps {
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

export interface ToolBtnProps {
  icon: React.ElementType;
  command?: string;
  value?: string;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
}
