import { useMemo, useState } from 'react';
import { fetchPrice } from '../lib/api';
import { fmt, pct, salesTax, SETUP_FEE, timeAgo } from '../lib/format';
import { CITIES, type City, type Server } from '../lib/types';
import {
  Checkbox,
  Field,
  FetchButton,
  NumberInput,
  ResultRow,
  Select,
  Slider,
  TextInput,
  tone,
} from '../components/UI';
import { ItemIcon } from '../components/ItemIcon';

export function CraftTab({ server }: { server: Server }) {
  const [item, setItem] = useState('T5_2H_AXE');
  const [city, setCity] = useState<City>('Martlock');
  const [mats, setMats] = useState(60_000);
  const [returnRate, setReturnRate] = useState(24.8);
  const [fee, setFee] = useState(800);
  const [sell, setSell] = useState(95_000);
  const [premium, setPremium] = useState(true);
  const [sellOrder, setSellOrder] = useState(true);
  const [perHour, setPerHour] = useState(20);
  const [fame, setFame] = useState(1200);
  const [meta, setMeta] = useState('');
  const [loading, setLoading] = useState(false);

  const calc = useMemo(() => {
    const ret = returnRate / 100;
    const effMats = mats * (1 - ret);
    const tax = salesTax(premium) + (sellOrder ? SETUP_FEE : 0);
    const netSell = sell * (1 - tax);
    const profitPer = netSell - effMats - fee;
    const margin = sell > 0 ? profitPer / sell : 0;
    const silverHour = profitPer * perHour;
    const fameHour = fame * perHour * (premium ? 1.5 : 1);
    const silverPerFame = fame > 0 ? profitPer / fame : 0;
    return { effMats, tax, netSell, profitPer, margin, silverHour, fameHour, silverPerFame };
  }, [mats, returnRate, fee, sell, premium, sellOrder, perHour, fame]);

  async function refresh() {
    setLoading(true);
    setMeta('');
    try {
      const p = await fetchPrice(server, item.trim(), city);
      if (p.sellMin) {
        setSell(p.sellMin);
        setMeta(`sell min ${fmt(p.sellMin)} · il y a ${timeAgo(p.sellDate)}`);
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Craft</h2>
          <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-1.5">
            <ItemIcon id={item.trim()} size={40} />
            <code className="text-xs text-amber-300">{item.trim() || '—'}</code>
          </div>
        </div>

        <Field label="Item ID crafté">
          <TextInput value={item} onChange={setItem} />
        </Field>

        <Field label="Ville (marché pour prix vente)">
          <Select value={city} onChange={setCity} options={CITIES.map((c) => ({ value: c, label: c }))} />
        </Field>

        <Field label="Coût total matières (silver)" hint="Prix achat des ressources nécessaires à 1 craft.">
          <NumberInput value={mats} onChange={setMats} />
        </Field>

        <Field
          label="Return rate (%)"
          hint="15% base ville · 24.8% focus · jusqu'à 53.9% focus + spé max."
        >
          <Slider value={returnRate} onChange={setReturnRate} min={0} max={70} step={0.1} unit="%" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Frais d'utilisation (silver)" hint="Usage fee du bâtiment.">
            <NumberInput value={fee} onChange={setFee} />
          </Field>
          <Field label="Prix de vente" hint={meta}>
            <div className="flex gap-2">
              <NumberInput value={sell} onChange={setSell} />
              <FetchButton onClick={refresh} loading={loading} />
            </div>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Checkbox checked={premium} onChange={setPremium} label="Premium" />
          <Checkbox checked={sellOrder} onChange={setSellOrder} label="Vente via sell order" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Crafts / heure">
            <NumberInput value={perHour} onChange={setPerHour} />
          </Field>
          <Field label="Fame par craft">
            <NumberInput value={fame} onChange={setFame} />
          </Field>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Résultats</h2>
        <ResultRow label="Coût matières effectif" value={`${fmt(calc.effMats)} s`} />
        <ResultRow label="Économie return rate" value={`${fmt(mats - calc.effMats)} s`} tone="pos" />
        <ResultRow label={`Vente nette (après ${(calc.tax * 100).toFixed(1)}%)`} value={`${fmt(calc.netSell)} s`} />
        <ResultRow label="Usage fee" value={`−${fmt(fee)} s`} tone="neg" />
        <ResultRow label="Profit / craft" value={`${fmt(calc.profitPer)} s`} tone={tone(calc.profitPer)} bold />
        <ResultRow label="Marge" value={pct(calc.margin)} tone={tone(calc.profitPer)} />
        <ResultRow label="Silver / h" value={`${fmt(calc.silverHour)} s`} tone={tone(calc.silverHour)} />
        <ResultRow label="Fame / h" value={fmt(calc.fameHour)} />
        <ResultRow
          label="Silver / point de fame"
          value={`${calc.silverPerFame.toFixed(2)} s`}
          tone={tone(calc.silverPerFame)}
        />
      </div>
    </div>
  );
}
