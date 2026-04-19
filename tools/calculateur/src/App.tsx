import { useState } from 'react';
import { HarvestTab } from './tabs/Harvest';
import { FlipTab } from './tabs/Flip';
import { CraftTab } from './tabs/Craft';
import { RiskTab } from './tabs/Risk';
import { Guide } from './guide/Guide';
import type { Server } from './lib/types';
import { Field, Select } from './components/UI';

type Mode = 'calc' | 'guide';
type CalcTab = 'harvest' | 'flip' | 'craft' | 'risk';

const CALC_TABS: { id: CalcTab; label: string }[] = [
  { id: 'harvest', label: 'Récolte' },
  { id: 'flip', label: 'Revente' },
  { id: 'craft', label: 'Craft' },
  { id: 'risk', label: 'EV zone rouge' },
];

export function App() {
  const [mode, setMode] = useState<Mode>('calc');
  const [tab, setTab] = useState<CalcTab>('harvest');
  const [server, setServer] = useState<Server>('west');

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <header className="mb-6 flex flex-wrap items-center gap-4 justify-between">
        <div>
          <h1 className="text-3xl font-bold">🛡️ Albion Solo Guide</h1>
          <p className="text-slate-400 text-sm mt-1">
            Calculateur + guide personnel — farmer solo, Hache de Guerre
          </p>
        </div>
        <div className="flex gap-2 p-1 bg-slate-800 rounded-lg">
          <button
            onClick={() => setMode('calc')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              mode === 'calc' ? 'bg-amber-500 text-slate-900' : 'text-slate-300 hover:text-amber-200'
            }`}
          >
            🧮 Calculateur
          </button>
          <button
            onClick={() => setMode('guide')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              mode === 'guide' ? 'bg-amber-500 text-slate-900' : 'text-slate-300 hover:text-amber-200'
            }`}
          >
            📚 Guide
          </button>
        </div>
      </header>

      {mode === 'calc' && (
        <>
          <div className="card mb-6 flex flex-wrap items-end gap-4">
            <div style={{ minWidth: 200 }}>
              <Field label="Serveur">
                <Select
                  value={server}
                  onChange={setServer}
                  options={[
                    { value: 'west', label: 'Ouest (Albion West)' },
                    { value: 'east', label: 'Est (Albion East)' },
                    { value: 'europe', label: 'Europe (Albion Europe)' },
                  ]}
                />
              </Field>
            </div>
            <div className="text-xs text-slate-500 flex-1 min-w-[200px]">
              Prix fournis par{' '}
              <a
                href="https://www.albion-online-data.com/"
                className="underline hover:text-amber-400"
                target="_blank"
                rel="noreferrer"
              >
                AlbionOnline Data Project
              </a>
              . Les prix peuvent être vieux de quelques heures.
            </div>
          </div>

          <nav className="flex gap-2 mb-6 border-b border-slate-700 overflow-x-auto">
            {CALC_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  tab === t.id
                    ? 'text-amber-400 border-amber-400'
                    : 'text-slate-400 border-transparent hover:text-amber-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>

          {tab === 'harvest' && <HarvestTab server={server} />}
          {tab === 'flip' && <FlipTab server={server} />}
          {tab === 'craft' && <CraftTab server={server} />}
          {tab === 'risk' && <RiskTab />}
        </>
      )}

      {mode === 'guide' && <Guide />}

      <footer className="mt-10 text-center text-xs text-slate-500">
        Calculs indicatifs · Toujours vérifier sur{' '}
        <a
          href="https://www.albion-online-data.com/"
          className="underline hover:text-amber-400"
          target="_blank"
          rel="noreferrer"
        >
          AlbionOnline Data
        </a>{' '}
        ou AlbionFreeMarket.
      </footer>
    </div>
  );
}
