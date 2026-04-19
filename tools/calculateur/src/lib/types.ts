export type Server = 'west' | 'east' | 'europe';

export type City =
  | 'Caerleon'
  | 'Bridgewatch'
  | 'Martlock'
  | 'Lymhurst'
  | 'Fort Sterling'
  | 'Thetford'
  | 'Black Market';

export const CITIES: City[] = [
  'Caerleon',
  'Bridgewatch',
  'Martlock',
  'Lymhurst',
  'Fort Sterling',
  'Thetford',
  'Black Market',
];

export type ResourceType = 'wood' | 'ore' | 'fiber' | 'hide' | 'stone' | 'fish';

export type PriceInfo = {
  sellMin: number;
  sellDate: string;
  buyMax: number;
  buyDate: string;
};
