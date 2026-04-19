export const fmt = (n: number): string => {
  if (!isFinite(n)) return '—';
  return Math.round(n).toLocaleString('fr-FR').replace(/\u202f/g, ' ');
};

export const pct = (n: number): string => (n * 100).toFixed(1) + '%';

export const timeAgo = (iso?: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  const s = Math.max(0, (Date.now() - d.getTime()) / 1000);
  if (s < 60) return `${Math.round(s)}s`;
  if (s < 3600) return `${Math.round(s / 60)}min`;
  if (s < 86400) return `${Math.round(s / 3600)}h`;
  return `${Math.round(s / 86400)}j`;
};

export const SETUP_FEE = 0.025;
export const salesTax = (premium: boolean): number => (premium ? 0.025 : 0.04);
