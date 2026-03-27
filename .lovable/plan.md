

# Replace Lucide Icons with Official Logos on Integrations Page

## Summary
All 9 integration cards currently use generic Lucide icons (Truck, BarChart3, Code2, Share2, Search). Replace each with the official brand logo using `<img>` tags with public logo URLs.

## Files to Update (8 files)

### 1. `src/components/settings/IntegrationsSettings.tsx` (Steadfast Courier)
- Replace `<Truck>` icon with Steadfast logo
- Logo URL: `https://steadfast.com.bd/images/logo.png` (or SVG from their site)

### 2. `src/components/settings/PathaoSettings.tsx` (Pathao Courier)
- Replace `<Truck>` icon with Pathao logo
- Logo: Pathao's official red logo

### 3. `src/components/settings/RedXSettings.tsx` (RedX Courier)
- Replace `<Truck>` icon with RedX logo

### 4. `src/components/settings/PaperflySettings.tsx` (Paperfly Courier)
- Replace `<Truck>` icon with Paperfly logo

### 5. `src/components/settings/ECourierSettings.tsx` (eCourier)
- Replace `<Truck>` icon with eCourier logo

### 6. `src/components/settings/GoogleAnalyticsSettings.tsx` (GA4)
- Replace `<BarChart3>` icon with Google Analytics logo

### 7. `src/components/settings/GoogleTagManagerSettings.tsx` (GTM)
- Replace `<Code2>` icon with GTM logo

### 8. `src/components/settings/MetaPixelSettings.tsx` (Meta Pixel)
- Replace `<Share2>` icon with Meta/Facebook logo

### 9. `src/components/settings/GoogleSearchConsoleSettings.tsx` (GSC)
- Replace `<Search>` icon with Google Search Console logo

## Implementation Pattern
Each card header icon block changes from:
```tsx
<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
  <Truck className="h-5 w-5 text-primary" />
</div>
```
To:
```tsx
<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white overflow-hidden">
  <img src="https://..." alt="Logo" className="h-7 w-7 object-contain" />
</div>
```

## Logo Sources (official CDN/public URLs)
- **Steadfast**: `https://steadfast.com.bd` logo
- **Pathao**: `https://pathao.com` logo  
- **RedX**: `https://redx.com.bd` logo
- **Paperfly**: `https://go.paperfly.com.bd` logo
- **eCourier**: `https://ecourier.com.bd` logo
- **Google Analytics**: Google's official GA4 icon SVG
- **Google Tag Manager**: Google's official GTM icon SVG
- **Meta Pixel**: Meta's official logo
- **Google Search Console**: Google's official GSC icon

Logos will be stored in `/public/logos/` as downloaded images to avoid external dependency and broken links.

