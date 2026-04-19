import { useMemo, useState } from 'react';
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

const FAME_BASE: Record<number, number> = { 3: 30, 4: 60, 5: 120, 6: 240, 7: 480, 8: 960 };
const ENCHANT_MULT = [1, 1.5, 2.25, 3.4, 5];

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
  const [meta, setMeta] = useState('');
  const [loading, setLoading] = useState(false);

  const calc = useMemo(() => {
    const unitsPerHour = nodes * perNode;
    const gross = unitsPerHour * price;
    const tax = salesTax(premium) + (sellOrder ? SETUP_FEE : 0);
    const netSell = gross * (1 - tax);
    const expectedLoss = (death / 100) * setVal;
    const netAdjusted = netSell - expectedLoss;
    const famePerHour =
      unitsPerHour *
      (FAME_BASE[tier] || 0) *
      (ENCHANT_MULT[enchant] || 1) *
      (premium ? 1.5 : 1);
    return { unitsPerHour, gross, tax, netSell, expectedLoss, netAdjusted, famePerHour };
  }, [nodes, perNode, price, premium, sellOrder, death, setVal, tier, enchant]);

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

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Paramètres récolte</h2>

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
        <ResultRow label="Fame / h (est.)" value={fmt(calc.famePerHour)} />
      </div>
    </div>
  );
}
