import { useMemo, useState } from 'react';
import { fmt, pct, salesTax } from '../lib/format';
import {
  Checkbox,
  Field,
  NumberInput,
  ResultRow,
  Select,
  Slider,
  tone,
} from '../components/UI';

type Activity = 'mists' | 'dungeon' | 'gather' | 'ganking' | 'custom';

export function RiskTab() {
  const [activity, setActivity] = useState<Activity>('mists');
  const [loot, setLoot] = useState(120_000);
  const [runs, setRuns] = useState(3);
  const [death, setDeath] = useState(15);
  const [setVal, setSetVal] = useState(250_000);
  const [recover, setRecover] = useState(25);
  const [premium, setPremium] = useState(true);

  const calc = useMemo(() => {
    const tax = salesTax(premium);
    const netLoot = loot * (1 - tax);
    const lossPerDeath = setVal * (1 - recover / 100);
    const evPerRun = netLoot * (1 - death / 100) - lossPerDeath * (death / 100);
    const evPerHour = evPerRun * runs;
    const naifPerHour = netLoot * runs;
    const breakEvenDeath = netLoot / (netLoot + lossPerDeath);
    return { netLoot, lossPerDeath, evPerRun, evPerHour, naifPerHour, breakEvenDeath };
  }, [loot, runs, death, setVal, recover, premium]);

  const isProfitable = death / 100 < calc.breakEvenDeath;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">EV zone rouge / noire</h2>

        <Field label="Type d'activité">
          <Select
            value={activity}
            onChange={setActivity}
            options={[
              { value: 'mists', label: 'Mists Hunter' },
              { value: 'dungeon', label: 'Donjon solo' },
              { value: 'gather', label: 'Récolte' },
              { value: 'ganking', label: 'Ganking victim (lol)' },
              { value: 'custom', label: 'Autre' },
            ]}
          />
        </Field>

        <Field label="Silver brut / run (loot + fame converti)">
          <NumberInput value={loot} onChange={setLoot} />
        </Field>

        <Field label="Runs / heure">
          <Slider value={runs} onChange={setRuns} min={0.5} max={10} step={0.5} />
        </Field>

        <Field
          label="Proba mort / run (%)"
          hint="Mists solo ≈ 5-10%, zone rouge PK dense ≈ 20-40%."
        >
          <Slider value={death} onChange={setDeath} min={0} max={100} step={1} unit="%" />
        </Field>

        <Field label="Valeur set porté (silver)" hint="Inclut arme, armure, accessoires, potions, nourriture.">
          <NumberInput value={setVal} onChange={setSetVal} />
        </Field>

        <Field
          label="% du set récupéré (trash + craft)"
          hint="Tout n'est pas perdu : les PK looten ~50-70%, le reste se trash."
        >
          <Slider value={recover} onChange={setRecover} min={0} max={100} step={5} unit="%" />
        </Field>

        <Checkbox checked={premium} onChange={setPremium} label="Premium" />
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Résultats</h2>
        <ResultRow label="Loot net / run" value={`${fmt(calc.netLoot)} s`} />
        <ResultRow label="Perte effective / mort" value={`${fmt(calc.lossPerDeath)} s`} tone="neg" />
        <ResultRow label="EV / run" value={`${fmt(calc.evPerRun)} s`} tone={tone(calc.evPerRun)} />
        <ResultRow
          label="EV / heure (ajusté risque)"
          value={`${fmt(calc.evPerHour)} s`}
          tone={tone(calc.evPerHour)}
          bold
        />
        <ResultRow label="Silver / h si zéro mort" value={`${fmt(calc.naifPerHour)} s`} />
        <ResultRow
          label="Seuil rentabilité (proba mort max)"
          value={pct(calc.breakEvenDeath)}
          tone="pos"
        />
        <ResultRow
          label="Verdict"
          value={isProfitable ? '✅ Rentable' : '❌ Risqué'}
          tone={isProfitable ? 'pos' : 'neg'}
          bold
        />
      </div>
    </div>
  );
}
