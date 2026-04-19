import { useEffect, useMemo, useState } from 'react';
import { buildResourceItemId } from '../lib/api';
import { fmt } from '../lib/format';
import type { ResourceType } from '../lib/types';
import { Field, NumberInput, Select } from '../components/UI';
import { ItemIcon } from '../components/ItemIcon';

const DEFAULT_FAME_PER_GATHER: Record<number, number> = {
  2: 45,
  3: 75,
  4: 112,
  5: 280,
  6: 850,
  7: 2_500,
  8: 7_500,
};

const RESOURCE_LABEL: Record<ResourceType, string> = {
  wood: 'Bois',
  ore: 'Minerai',
  fiber: 'Fibre',
  hide: 'Peau',
  stone: 'Pierre',
  fish: 'Poisson',
};

const TIER_RESOURCE_NAME: Record<string, string> = {
  // Bois
  'wood-2': 'Bouleau',
  'wood-3': 'Châtaignier',
  'wood-4': 'Pin',
  'wood-5': 'Cèdre',
  'wood-6': 'Chêne sanglant',
  'wood-7': 'Frênecendre',
  'wood-8': 'Bois blanc',
  // Minerai
  'ore-2': 'Étain',
  'ore-3': 'Cuivre',
  'ore-4': 'Fer',
  'ore-5': 'Titane',
  'ore-6': 'Runite',
  'ore-7': 'Météorite',
  'ore-8': 'Adamantium',
  // Fibre
  'fiber-2': 'Coton',
  'fiber-3': 'Lin',
  'fiber-4': 'Chanvre',
  'fiber-5': 'Fleur de sang',
  'fiber-6': 'Rougecante',
  'fiber-7': 'Chrysanthème',
  'fiber-8': 'Coton fantôme',
  // Peau
  'hide-2': 'Lapin',
  'hide-3': 'Loup',
  'hide-4': 'Cerf',
  'hide-5': 'Ours',
  'hide-6': 'Keeper',
  'hide-7': 'Loup-garou',
  'hide-8': 'Spectral',
  // Pierre
  'stone-2': 'Pierre grossière',
  'stone-3': 'Calcaire',
  'stone-4': 'Travertin',
  'stone-5': 'Granite',
  'stone-6': 'Basalte',
  'stone-7': 'Marbre',
  'stone-8': 'Obsidienne',
};

const ALL_TIERS = [2, 3, 4, 5, 6, 7, 8] as const;

type FarmResource = Exclude<ResourceType, 'fish'>;
const FARM_RESOURCES: FarmResource[] = ['wood', 'ore', 'fiber', 'hide', 'stone'];

const BIOME: Record<FarmResource, { biome: string; city: string }> = {
  wood: { biome: 'Forêt', city: 'Lymhurst' },
  ore: { biome: 'Montagne', city: 'Fort Sterling' },
  fiber: { biome: 'Marais', city: 'Thetford' },
  hide: { biome: 'Highlands', city: 'Martlock' },
  stone: { biome: 'Steppe', city: 'Bridgewatch' },
};

type Session = {
  resource: FarmResource;
  tier: number;
  fameGather: number;
  fameTarget: number;
  gathers: number;
  nodesPerHour: number;
};

const STORAGE_KEY = 'albion-farm-session';

function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

function saveSession(s: Session) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* quota */
  }
}

export function FarmTab() {
  const initial = loadSession();
  const [resource, setResource] = useState<FarmResource>(initial?.resource ?? 'stone');
  const [tier, setTier] = useState<number>(initial?.tier ?? 4);
  const [fameGather, setFameGather] = useState<number>(
    initial?.fameGather ?? DEFAULT_FAME_PER_GATHER[4],
  );
  const [fameTarget, setFameTarget] = useState<number>(initial?.fameTarget ?? 30_000);
  const [gathers, setGathers] = useState<number>(initial?.gathers ?? 0);
  const [nodesPerHour, setNodesPerHour] = useState<number>(initial?.nodesPerHour ?? 60);
  const [tierOverridden, setTierOverridden] = useState(Boolean(initial?.fameGather));

  useEffect(() => {
    if (!tierOverridden) {
      setFameGather(DEFAULT_FAME_PER_GATHER[tier] ?? 100);
    }
  }, [tier, tierOverridden]);

  useEffect(() => {
    saveSession({ resource, tier, fameGather, fameTarget, gathers, nodesPerHour });
  }, [resource, tier, fameGather, fameTarget, gathers, nodesPerHour]);

  const resourceName = TIER_RESOURCE_NAME[`${resource}-${tier}`] ?? RESOURCE_LABEL[resource];
  const itemId = buildResourceItemId(resource, tier, 0);

  const stats = useMemo(() => {
    const fameDone = gathers * fameGather;
    const fameRemaining = Math.max(0, fameTarget - fameDone);
    const gathersRemaining = fameGather > 0 ? Math.ceil(fameRemaining / fameGather) : 0;
    const hoursRemaining = nodesPerHour > 0 ? gathersRemaining / nodesPerHour : 0;
    const progress = fameTarget > 0 ? Math.min(1, fameDone / fameTarget) : 0;
    return { fameDone, fameRemaining, gathersRemaining, hoursRemaining, progress };
  }, [gathers, fameGather, fameTarget, nodesPerHour]);

  const biome = BIOME[resource];
  const done = stats.progress >= 1;

  function inc(n: number) {
    setGathers((g) => Math.max(0, g + n));
  }

  function reset() {
    if (confirm('Réinitialiser la session farm ?')) {
      setGathers(0);
    }
  }

  function selectResource(r: FarmResource, t: number) {
    setResource(r);
    setTier(t);
    setTierOverridden(false); // reprise du défaut fame/gather pour le tier
    setGathers(0);
  }

  return (
    <div className="space-y-6">
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Session de farm</h2>
          <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-1.5">
            <ItemIcon id={itemId} size={40} />
            <div>
              <div className="text-sm font-semibold text-amber-300">{resourceName}</div>
              <div className="text-xs text-slate-500 font-mono">{itemId}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Ressource">
            <Select
              value={resource}
              onChange={(v) => setResource(v as FarmResource)}
              options={FARM_RESOURCES.map((r) => ({ value: r, label: RESOURCE_LABEL[r] }))}
            />
          </Field>
          <Field label="Tier">
            <Select
              value={String(tier)}
              onChange={(v) => setTier(parseInt(v))}
              options={[2, 3, 4, 5, 6, 7, 8].map((t) => ({ value: String(t), label: `T${t}` }))}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Fame / gather"
            hint={tierOverridden ? 'Valeur personnalisée' : `Défaut T${tier}`}
          >
            <NumberInput
              value={fameGather}
              onChange={(n) => {
                setFameGather(n);
                setTierOverridden(true);
              }}
            />
          </Field>
          <Field label="Objectif fame">
            <NumberInput value={fameTarget} onChange={setFameTarget} />
          </Field>
        </div>

        <Field label="Nœuds / heure (ton rythme)">
          <NumberInput value={nodesPerHour} onChange={setNodesPerHour} />
        </Field>

        <div className="card bg-slate-950 border-slate-800 mt-4">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Route conseillée</div>
          <div className="text-sm">
            Biome <span className="text-amber-300 font-semibold">{biome.biome}</span> ·
            ville <span className="text-amber-300 font-semibold">{biome.city}</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Zones jaunes T{tier}-T{tier + 1} autour · sandwich +20% fame · respawn ~10-15 min
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Progression</h2>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-300">{fmt(stats.fameDone)} / {fmt(fameTarget)} fame</span>
            <span className={done ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
              {(stats.progress * 100).toFixed(1)}%
            </span>
          </div>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${done ? 'bg-emerald-500' : 'bg-amber-500'}`}
              style={{ width: `${stats.progress * 100}%` }}
            />
          </div>
        </div>

        <div className="text-center my-6">
          <div className="text-5xl font-bold text-amber-400 font-mono">{fmt(gathers)}</div>
          <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">gathers effectués</div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <button className="btn" onClick={() => inc(1)}>+1</button>
          <button className="btn" onClick={() => inc(5)}>+5</button>
          <button className="btn" onClick={() => inc(10)}>+10</button>
          <button className="btn" onClick={() => inc(-1)}>−1</button>
        </div>

        <div className="border-t border-slate-800 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-300">Fame restante</span>
            <span className="font-semibold text-slate-100">{fmt(stats.fameRemaining)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-300">Gathers restants</span>
            <span className="font-semibold text-slate-100">{fmt(stats.gathersRemaining)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-300">Temps estimé</span>
            <span className="font-semibold text-amber-400">
              {done ? '✅ terminé !' : `${stats.hoursRemaining.toFixed(1)} h`}
            </span>
          </div>
        </div>

        <button
          className="btn w-full mt-4 border-red-900 hover:border-red-500"
          onClick={reset}
        >
          🔄 Réinitialiser compteur
        </button>

        <div className="text-xs text-slate-500 text-center mt-3">
          Sauvegarde auto (localStorage) — reprends ta session après un refresh
        </div>
      </div>
    </div>

    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">Toutes les ressources</h2>
        <div className="text-xs text-slate-500">Clique sur une ressource pour la cibler</div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="text-left text-xs text-slate-400 uppercase tracking-wider px-2 py-1">
                Type
              </th>
              {ALL_TIERS.map((t) => (
                <th
                  key={t}
                  className="text-center text-xs text-slate-400 uppercase tracking-wider px-2 py-1"
                >
                  T{t}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FARM_RESOURCES.map((r) => (
              <tr key={r}>
                <td className="text-sm font-semibold text-slate-200 px-2 py-1 whitespace-nowrap">
                  {RESOURCE_LABEL[r]}
                  <div className="text-xs text-slate-500 font-normal">{BIOME[r].biome}</div>
                </td>
                {ALL_TIERS.map((t) => {
                  const id = buildResourceItemId(r, t, 0);
                  const name = TIER_RESOURCE_NAME[`${r}-${t}`] ?? `T${t}`;
                  const isActive = resource === r && tier === t;
                  return (
                    <td key={t} className="p-0">
                      <button
                        type="button"
                        onClick={() => selectResource(r, t)}
                        className={`w-full flex flex-col items-center gap-1 p-2 rounded transition-colors ${
                          isActive
                            ? 'bg-amber-500/20 ring-2 ring-amber-400'
                            : 'hover:bg-slate-800'
                        }`}
                        title={`${name} (${id}) · défaut ${DEFAULT_FAME_PER_GATHER[t] ?? '?'} fame/gather`}
                      >
                        <ItemIcon id={id} size={40} />
                        <span
                          className={`text-xs text-center leading-tight ${
                            isActive ? 'text-amber-300 font-semibold' : 'text-slate-400'
                          }`}
                        >
                          {name}
                        </span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-slate-500 mt-3">
        Fame/gather par défaut : T2 ≈ 45 · T3 ≈ 75 · <strong>T4 = 112</strong> · T5 ≈ 280 · T6 ≈ 850 · T7 ≈ 2 500 · T8 ≈ 7 500.
        Ces valeurs supposent Premium actif + spé apprenti ; édite le champ "Fame / gather" pour coller ta valeur réelle.
      </div>
    </div>
    </div>
  );
}
