

## Plan: Rich Text Editor-এ নতুন ফিচার যোগ করা

### নতুন ৪টি ফিচার

**1. Drag & Drop Image**
- Editor contentEditable div-এ `onDragOver` এবং `onDrop` handler যোগ করা
- Drop হলে File read করে `insertImage` execute করা
- Drop zone visual indicator (border highlight) দেখানো

**2. Image Resize & Float**
- Editor-এর ভিতরে কোনো image ক্লিক করলে একটি floating toolbar দেখাবে
- Toolbar-এ options: Small (25%), Medium (50%), Large (75%), Full (100%) সাইজ
- Float options: Left, Center, Right
- Image-এ inline style সেট করা হবে (`width`, `float`, `margin`)
- Editor এর বাইরে ক্লিক করলে toolbar বন্ধ হবে

**3. Checklist / Task List**
- Toolbar-এ নতুন Checklist বাটন (CheckSquare icon)
- ক্লিক করলে `<ul>` with `<li>` containing checkbox input insert হবে
- CSS styling: `[&_input[type=checkbox]]` দিয়ে চেকবক্স সুন্দর করা

**4. Custom Color Picker**
- Text Color ও Highlight Color Popover-এ preset colors-এর নিচে একটি `<input type="color">` যোগ করা
- যেকোনো কাস্টম কালার কোড দিয়ে text/highlight সেট করা যাবে

### Files to modify

- `src/components/ui/rich-text-editor/RichTextEditor.tsx` — drag/drop handlers, image click toolbar, checklist insert
- `src/components/ui/rich-text-editor/EditorToolbar.tsx` — checklist button, custom color picker input যোগ
- `src/components/ui/rich-text-editor/ImageToolbar.tsx` — নতুন ফাইল: image resize/float floating toolbar component

### Technical Detail

```text
Drag & Drop:
  onDragOver → e.preventDefault() + highlight border
  onDrop → read File → insertImage as base64/data URL

Image Toolbar:
  editor onClick → check if target is <img> → show floating toolbar positioned near image
  toolbar buttons set img.style.width and img.style.float
  
Checklist:
  insertHTML → <ul style="list-style:none;padding-left:0"><li><input type="checkbox"> Item</li></ul>

Custom Color:
  <input type="color"> onChange → execCommand("foreColor"/hiliteColor", hex)
```

