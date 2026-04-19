const RENDER_BASE = 'https://render.albiononline.com/v1/item/';

export function itemIconUrl(itemId: string, size = 64, quality = 1): string {
  const enc = encodeURIComponent(itemId);
  return `${RENDER_BASE}${enc}.png?size=${size}&quality=${quality}`;
}

export function ItemIcon({
  id,
  size = 48,
  className = '',
  title,
}: {
  id: string;
  size?: number;
  className?: string;
  title?: string;
}) {
  if (!id) return null;
  return (
    <img
      src={itemIconUrl(id, size * 2)}
      alt={id}
      title={title ?? id}
      width={size}
      height={size}
      className={className}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.visibility = 'hidden';
      }}
    />
  );
}
