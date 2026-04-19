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

export function FlipTab({ server }: { server: Server }) {
  const [item, setItem] = useState('T5_2H_AXE');
  const [cityA, setCityA] = useState<City>('Caerleon');
  const [cityB, setCityB] = useState<City>('Martlock');
  const [buy, setBuy] = useState(50_000);
  const [sell, setSell] = useState(75_000);
  const [qty, setQty] = useState(1);
  const [premium, setPremium] = useState(true);
  const [buyOrder, setBuyOrder] = useState(false);
  const [sellOrder, setSellOrder] = useState(true);
  const [time, setTime] = useState(15);
  const [risk, setRisk] = useState(0);
  const [buyMeta, setBuyMeta] = useState('');
  const [sellMeta, setSellMeta] = useState('');
  const [loading, setLoading] = useState<'buy' | 'sell' | 'both' | null>(null);

  const calc = useMemo(() => {
    const buyCost = buy * (1 + (buyOrder ? SETUP_FEE : 0));
    const sellTaxTotal = salesTax(premium) + (sellOrder ? SETUP_FEE : 0);
    const sellRevenue = sell * (1 - sellTaxTotal);
    const profitPer = sellRevenue - buyCost;
    const roi = buyCost > 0 ? profitPer / buyCost : 0;
    const r = risk / 100;
    const expectedTotal = profitPer * qty * (1 - r) - buyCost * qty * r;
    const perHour = time > 0 ? expectedTotal * (60 / time) : 0;
    return { buyCost, sellRevenue, profitPer, roi, expectedTotal, perHour };
  }, [buy, sell, qty, premium, buyOrder, sellOrder, time, risk]);

  async function fetchSide(side: 'buy' | 'sell') {
    setLoading(side);
    try {
      const target = side === 'buy' ? cityA : cityB;
      const p = await fetchPrice(server, item.trim(), target);
      if (p.sellMin) {
        if (side === 'buy') {
          setBuy(p.sellMin);
          setBuyMeta(`sell min ${fmt(p.sellMin)} · il y a ${timeAgo(p.sellDate)}`);
        } else {
          setSell(p.sellMin);
          setSellMeta(`sell min ${fmt(p.sellMin)} · il y a ${timeAgo(p.sellDate)}`);
        }
      }
    } catch (e) {
      const setter = side === 'buy' ? setBuyMeta : setSellMeta;
      setter('❌ ' + (e as Error).message);
    } finally {
      setLoading(null);
    }
  }

  async function fetchBoth() {
    setLoading('both');
    try {
      await fetchSide('buy');
      await fetchSide('sell');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Flipping / Revente</h2>

        <Field
          label="Item ID"
          hint={
            <>
              Format <code>T[tier]_[nom]</code>. Enchants : <code>@1</code> à <code>@4</code>.
            </>
          }
        >
          <TextInput value={item} onChange={setItem} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Ville A (achat)">
            <Select value={cityA} onChange={setCityA} options={CITIES.map((c) => ({ value: c, label: c }))} />
          </Field>
          <Field label="Ville B (vente)">
            <Select value={cityB} onChange={setCityB} options={CITIES.map((c) => ({ value: c, label: c }))} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Prix d'achat (ville A)" hint={buyMeta}>
            <div className="flex gap-2">
              <NumberInput value={buy} onChange={setBuy} />
              <FetchButton onClick={() => fetchSide('buy')} loading={loading === 'buy'} />
            </div>
          </Field>
          <Field label="Prix de vente (ville B)" hint={sellMeta}>
            <div className="flex gap-2">
              <NumberInput value={sell} onChange={setSell} />
              <FetchButton onClick={() => fetchSide('sell')} loading={loading === 'sell'} />
            </div>
          </Field>
        </div>

        <button
          type="button"
          className="btn btn-primary mb-3"
          onClick={fetchBoth}
          disabled={loading !== null}
        >
          {loading === 'both' ? '⏳ Fetch…' : '🔄 Récupérer les 2 villes'}
        </button>

        <Field label="Quantité">
          <NumberInput value={qty} onChange={setQty} />
        </Field>

        <Checkbox checked={premium} onChange={setPremium} label="Premium (taxe vente 2.5% au lieu de 4%)" />
        <Checkbox checked={buyOrder} onChange={setBuyOrder} label="Achat via buy order (+2.5% setup)" />
        <Checkbox checked={sellOrder} onChange={setSellOrder} label="Vente via sell order (+2.5% setup)" />

        <div className="grid grid-cols-2 gap-3 mt-3">
          <Field label="Temps trajet total (min)">
            <NumberInput value={time} onChange={setTime} />
          </Field>
          <Field label="Proba perte cargaison (%)">
            <Slider value={risk} onChange={setRisk} min={0} max={50} step={1} unit="%" />
          </Field>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Résultats</h2>
        <ResultRow label="Coût achat / unité" value={`${fmt(calc.buyCost)} s`} />
        <ResultRow label="Revenu net vente / unité" value={`${fmt(calc.sellRevenue)} s`} />
        <ResultRow label="Profit / unité" value={`${fmt(calc.profitPer)} s`} tone={tone(calc.profitPer)} />
        <ResultRow label="ROI" value={pct(calc.roi)} tone={tone(calc.profitPer)} />
        <ResultRow
          label={`Profit total (×${qty})`}
          value={`${fmt(calc.profitPer * qty)} s`}
          tone={tone(calc.profitPer)}
        />
        <ResultRow
          label="Profit ajusté au risque"
          value={`${fmt(calc.expectedTotal)} s`}
          tone={tone(calc.expectedTotal)}
        />
        <ResultRow
          label="Silver / h (avec trajet)"
          value={`${fmt(calc.perHour)} s`}
          tone={tone(calc.perHour)}
          bold
        />
      </div>
    </div>
  );
}
