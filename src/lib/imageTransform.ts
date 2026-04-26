/**
 * Supabase Storage Image Transformation utility.
 *
 * Generates optimized image URLs (WebP, resized) for any Supabase-hosted image
 * by rewriting `/storage/v1/object/public/...` to `/storage/v1/render/image/public/...`
 * with width/quality/format query params.
 *
 * For non-Supabase URLs (Unsplash, external CDNs, data URLs, placeholder.svg)
 * it returns the URL unchanged so the caller can still set width/srcset markup
 * without breaking external sources.
 */

const SUPABASE_OBJECT_PATH = "/storage/v1/object/public/";
const SUPABASE_RENDER_PATH = "/storage/v1/render/image/public/";

const isSupabaseStorage = (url: string): boolean => {
  return url.includes(SUPABASE_OBJECT_PATH);
};

const isUnsplash = (url: string): boolean => {
  return url.includes("images.unsplash.com");
};

export interface TransformOptions {
  width?: number;
  height?: number;
  quality?: number; // 1-100, default 75
  format?: "webp" | "origin";
  resize?: "cover" | "contain" | "fill";
}

/**
 * Transform a single image URL into an optimized variant.
 */
export function transformImage(url: string, opts: TransformOptions = {}): string {
  if (!url || url.startsWith("data:") || url.endsWith(".svg")) return url;

  const { width, height, quality = 75, format = "webp", resize = "cover" } = opts;

  // Supabase Storage transformation
  if (isSupabaseStorage(url)) {
    const transformed = url.replace(SUPABASE_OBJECT_PATH, SUPABASE_RENDER_PATH);
    const params = new URLSearchParams();
    if (width) params.set("width", String(width));
    if (height) params.set("height", String(height));
    params.set("quality", String(quality));
    params.set("resize", resize);
    if (format === "webp") params.set("format", "webp");
    return `${transformed}?${params.toString()}`;
  }

  // Unsplash supports its own ?w=&q=&fm=webp params
  if (isUnsplash(url)) {
    try {
      const u = new URL(url);
      if (width) u.searchParams.set("w", String(width));
      if (height) u.searchParams.set("h", String(height));
      u.searchParams.set("q", String(quality));
      u.searchParams.set("fm", "webp");
      u.searchParams.set("auto", "format,compress");
      u.searchParams.set("fit", "crop");
      return u.toString();
    } catch {
      return url;
    }
  }

  return url;
}

/**
 * Build a responsive srcset string at the requested widths.
 * Returns "" if no transformation is possible (caller can omit srcset).
 */
export function buildSrcSet(
  url: string,
  widths: number[],
  opts: Omit<TransformOptions, "width"> = {}
): string {
  if (!url || url.startsWith("data:") || url.endsWith(".svg")) return "";
  if (!isSupabaseStorage(url) && !isUnsplash(url)) return "";

  return widths
    .map((w) => `${transformImage(url, { ...opts, width: w })} ${w}w`)
    .join(", ");
}

/**
 * Convenience: return src + srcSet + sizes for a responsive image.
 */
export function getResponsiveImage(
  url: string,
  options: {
    widths: number[];
    sizes: string;
    quality?: number;
    height?: number;
  }
): { src: string; srcSet: string; sizes: string } {
  const { widths, sizes, quality, height } = options;
  const fallbackWidth = widths[Math.floor(widths.length / 2)];
  return {
    src: transformImage(url, { width: fallbackWidth, quality, height }),
    srcSet: buildSrcSet(url, widths, { quality, height }),
    sizes,
  };
}
