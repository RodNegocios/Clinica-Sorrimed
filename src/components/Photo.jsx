import assets from '../assets.json';

// The downloadable, standalone HTML supplies embedded copies of the same assets.
// Hosted builds continue to use responsive WebP files with normal browser caching.
const resolveAsset = path => globalThis.__SORRIMED_EMBEDDED_ASSETS__?.[path] ?? path;
export const assetSrc = (id, size = 900) => resolveAsset(`/images/${id}-${size}.webp`);

export default function Photo({ id, alt, className = '', sizes = '(max-width: 760px) 90vw, 45vw', priority = false, ...props }) {
  const asset = assets[id];
  const unique = asset.variants.filter((v, i, all) => all.findIndex(item => item.width === v.width) === i);
  return <img className={className} src={assetSrc(id)} srcSet={unique.map(v => `${resolveAsset(v.src)} ${v.width}w`).join(', ')} sizes={sizes} width={asset.width} height={asset.height} alt={alt} loading={priority ? 'eager' : 'lazy'} decoding="async" fetchPriority={priority ? 'high' : 'auto'} {...props} />;
}
