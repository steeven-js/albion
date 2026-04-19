import type { City, PriceInfo, ResourceType, Server } from './types';

const API_BASE: Record<Server, string> = {
  west: 'https://west.albion-online-data.com',
  east: 'https://east.albion-online-data.com',
  europe: 'https://europe.albion-online-data.com',
};

const RESOURCE_BASE: Record<ResourceType, string> = {
  wood: 'WOOD',
  ore: 'ORE',
  fiber: 'FIBER',
  hide: 'HIDE',
  stone: 'ROCK',
  fish: 'FISH_FRESHWATER_ALL_COMMON',
};

export function buildResourceItemId(type: ResourceType, tier: number, enchant: number): string {
  const core = `T${tier}_${RESOURCE_BASE[type]}`;
  if (!enchant) return core;
  return `${core}_LEVEL${enchant}@${enchant}`;
}

type ApiPriceRow = {
  item_id: string;
  city: string;
  quality: number;
  sell_price_min: number;
  sell_price_min_date: string;
  buy_price_max: number;
  buy_price_max_date: string;
};

export async function fetchPrice(
  server: Server,
  itemId: string,
  city: City,
): Promise<PriceInfo> {
  const url =
    `${API_BASE[server]}/api/v2/stats/prices/${encodeURIComponent(itemId)}.json` +
    `?locations=${encodeURIComponent(city)}&qualities=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: ApiPriceRow[] = await res.json();
  const match = data.find(
    (d) => d.city === city && (d.sell_price_min > 0 || d.buy_price_max > 0),
  );
  if (!match) throw new Error('Pas de donnée pour ' + city);
  return {
    sellMin: match.sell_price_min,
    sellDate: match.sell_price_min_date,
    buyMax: match.buy_price_max,
    buyDate: match.buy_price_max_date,
  };
}
