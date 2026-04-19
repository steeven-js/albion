import { useEffect, useMemo, useState } from 'react';
import { buildResourceItemId, fetchPrice } from '../lib/api';
import { fmt, salesTax, SETUP_FEE, timeAgo } from '../lib/format';
import { CITIES, type City, type ResourceType, type Server } from '../lib/types';
import {
  Checkbox,
  Field,
  FetchButton,
  NumberInput,
  ResultRow,
  Select,
  Slider,
  tone,
} from '../components/UI';
import { ItemIcon } from '../components/ItemIcon';

// Fame/gather typique observé en jeu, setup apprenti + Premium.
// À ajuster via le champ éditable.
const DEFAULT_FAME_PER_GATHER: Record<number, number> = {
  3: 40,
  4: 112, // travertin T4 observé (90 apprenti + 7 premium + base)
  5: 280,
  6: 850,
  7: 2_500,
  8: 7_500,
};

export function HarvestTab({ server }: { server: Server }) {
  const [resource, setResource] = useState<ResourceType>('ore');
  const [tier, setTier] = useState(5);
  const [enchant, setEnchant] = useState(0);
  const [nodes, setNodes] = useState(60);
  const [perNode, setPerNode] = useState(2.5);
  const [price, setPrice] = useState(400);
  const [premium, setPremium] = useState(true);
  const [sellOrder, setSellOrder] = useState(true);
  const [city, setCity] = useState<City>('Martlock');
  const [death, setDeath] = useState(5);
  const [setVal, setSetVal] = useState(150_000);
  const [fameGather, setFameGather] = useState(DEFAULT_FAME_PER_GATHER[5]);
  const [fameTarget, setFameTarget] = useState(30_000);
  const [fameOverridden, setFameOverridden] = useState(false);
  const [meta, setMeta] = useState('');
  const [loading, setLoading] = useState(false);

  // Maj fame/gather quand le tier change, sauf si l'utilisateur a overridé
  useEffect(() => {
    if (!fameOverridden) {
      setFameGather(DEFAULT_FAME_PER_GATHER[tier] ?? 40);
    }
  }, [tier, fameOverridden]);

  const calc = useMemo(() => {
    const unitsPerHour = nodes * perNode;
    const gross = unitsPerHour * price;
    const tax = salesTax(premium) + (sellOrder ? SETUP_FEE : 0);
    const netSell = gross * (1 - tax);
    const expectedLoss = (death / 100) * setVal;
    const netAdjusted = netSell - expectedLoss;
    const famePerHour = nodes * fameGather;
    const gathersNeeded = fameGather > 0 ? fameTarget / fameGather : 0;
    const hoursNeeded = nodes > 0 ? gathersNeeded / nodes : 0;
    return {
      unitsPerHour,
      gross,
      tax,
      netSell,
      expectedLoss,
      netAdjusted,
      famePerHour,
      gathersNeeded,
      hoursNeeded,
    };
  }, [nodes, perNode, price, premium, sellOrder, death, setVal, fameGather, fameTarget]);

  async function refreshPrice() {
    const id = buildResourceItemId(resource, tier, enchant);
    setLoading(true);
    setMeta('');
    try {
      const p = await fetchPrice(server, id, city);
      if (p.sellMin) {
        setPrice(p.sellMin);
        setMeta(`${id} · sell min ${fmt(p.sellMin)} · maj il y a ${timeAgo(p.sellDate)}`);
      } else {
        setMeta(`${id} · aucune sell order`);
      }
    } catch (e) {
      setMeta('❌ ' + (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const itemId = buildResourceItemId(resource, tier, enchant);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Paramètres récolte</h2>
          <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-1.5">
            <ItemIcon id={itemId} size={40} />
            <code className="text-xs text-amber-300">{itemId}</code>
          </div>
        </div>

        <Field label="Ressource">
          <Select
            value={resource}
            onChange={setResource}
            options={[
              { value: 'wood', label: 'Bois' },
              { value: 'ore', label: 'Minerai' },
              { value: 'fiber', label: 'Fibre' },
              { value: 'hide', label: 'Peau' },
              { value: 'stone', label: 'Pierre' },
              { value: 'fish', label: 'Poisson' },
            ]}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Tier">
            <Select
              value={String(tier)}
              onChange={(v) => setTier(parseInt(v))}
              options={[3, 4, 5, 6, 7, 8].map((t) => ({ value: String(t), label: `T${t}` }))}
            />
          </Field>
          <Field label="Enchant">
            <Select
              value={String(enchant)}
              onChange={(v) => setEnchant(parseInt(v))}
              options={[0, 1, 2, 3, 4].map((e) => ({ value: String(e), label: `.${e}` }))}
            />
          </Field>
        </div>

        <Field label="Ville (marché)">
          <Select
            value={city}
            onChange={setCity}
            options={CITIES.map((c) => ({ value: c, label: c }))}
          />
        </Field>

        <Field label="Nœuds récoltés / heure" hint="60 = solo zone jaune. 100+ = zone peuplée sans PK.">
          <Slider value={nodes} onChange={setNodes} min={10} max={200} step={5} />
        </Field>

        <Field label="Unités par nœud (avec bonus)" hint="Base ≈ 2. Outil enchanté + bonus île/ville peut monter à 3-4.">
          <Slider value={perNode} onChange={setPerNode} min={1} max={6} step={0.1} />
        </Field>

        <Field
          label="Prix marché / unité (silver)"
          hint={meta || 'Cliquer 🔄 pour fetch via AlbionOnline Data'}
        >
          <div className="flex gap-2">
            <NumberInput value={price} onChange={setPrice} />
            <FetchButton onClick={refreshPrice} loading={loading} />
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Checkbox checked={premium} onChange={setPremium} label="Premium actif" />
          <Checkbox checked={sellOrder} onChange={setSellOrder} label="Vendre via sell order" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Fame / gather (ton setup)"
            hint={
              fameOverridden
                ? 'Valeur personnalisée'
                : `Défaut T${tier}. Lis la valeur réelle dans le tooltip Albion et écrase-la ici.`
            }
          >
            <NumberInput
              value={fameGather}
              onChange={(n) => {
                setFameGather(n);
                setFameOverridden(true);
              }}
            />
          </Field>
          <Field label="Objectif fame (nœud destiny)">
            <NumberInput value={fameTarget} onChange={setFameTarget} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Proba mort / heure (%)">
            <Slider value={death} onChange={setDeath} min={0} max={80} step={1} unit="%" />
          </Field>
          <Field label="Valeur set récolte (silver)">
            <NumberInput value={setVal} onChange={setSetVal} />
          </Field>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Résultats</h2>
        <ResultRow label="Unités / heure" value={fmt(calc.unitsPerHour)} />
        <ResultRow label="Revenu brut / h" value={`${fmt(calc.gross)} s`} />
        <ResultRow
          label={`Taxes (${(calc.tax * 100).toFixed(1)}%)`}
          value={`−${fmt(calc.gross * calc.tax)} s`}
          tone="neg"
        />
        <ResultRow label="Revenu net vente / h" value={`${fmt(calc.netSell)} s`} tone={tone(calc.netSell)} />
        <ResultRow
          label="Perte attendue (mort)"
          value={`−${fmt(calc.expectedLoss)} s`}
          tone={calc.expectedLoss ? 'neg' : 'neutral'}
        />
        <ResultRow
          label="Silver / h ajusté"
          value={`${fmt(calc.netAdjusted)} s`}
          tone={tone(calc.netAdjusted)}
          bold
        />
        <ResultRow label="Fame / h" value={fmt(calc.famePerHour)} />
        <ResultRow
          label={`Gathers pour ${fmt(fameTarget)} fame`}
          value={fmt(calc.gathersNeeded)}
        />
        <ResultRow
          label="Heures de farm estimées"
          value={`${calc.hoursNeeded.toFixed(1)} h`}
          tone="pos"
          bold
        />
      </div>
    </div>
  );
}
