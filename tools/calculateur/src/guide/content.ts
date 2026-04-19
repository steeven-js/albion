// Imports `?raw` : Vite inline le contenu des .md à la compilation
import readme from '../../../../README.md?raw';
import lexique from '../../../../lexique.md?raw';
import liensUtiles from '../../../../liens-utiles.md?raw';

import haches from '../../../../builds/hache-de-guerre-pve.md?raw';
import gathering from '../../../../builds/gathering-setup.md?raw';
import setsRechange from '../../../../builds/sets-rechange.md?raw';

import prixMarche from '../../../../economie/prix-marche.md?raw';
import runesArtefacts from '../../../../economie/runes-artefacts.md?raw';
import flippingNotes from '../../../../economie/flipping-notes.md?raw';

import roadmap from '../../../../progression/roadmap.md?raw';
import checklist from '../../../../progression/checklist.md?raw';
import journal from '../../../../progression/journal.md?raw';

import mists from '../../../../zones/mists-hunter.md?raw';
import donjons from '../../../../zones/donjons-solo.md?raw';
import itineraires from '../../../../zones/itineraires.md?raw';

export type GuideEntry = {
  slug: string;
  title: string;
  content: string;
};

export type GuideSection = {
  title: string;
  icon: string;
  entries: GuideEntry[];
};

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    title: 'Accueil',
    icon: '🏠',
    entries: [{ slug: 'readme', title: 'README', content: readme }],
  },
  {
    title: 'Progression',
    icon: '🎯',
    entries: [
      { slug: 'roadmap', title: 'Roadmap', content: roadmap },
      { slug: 'checklist', title: 'Checklist', content: checklist },
      { slug: 'journal', title: 'Journal de sessions', content: journal },
    ],
  },
  {
    title: 'Builds',
    icon: '⚔️',
    entries: [
      { slug: 'hache', title: 'Hache de Guerre PvE', content: haches },
      { slug: 'gathering', title: 'Gathering setup', content: gathering },
      { slug: 'sets', title: 'Sets de rechange', content: setsRechange },
    ],
  },
  {
    title: 'Économie',
    icon: '💰',
    entries: [
      { slug: 'prix', title: 'Prix du marché', content: prixMarche },
      { slug: 'runes', title: 'Runes, âmes, reliques', content: runesArtefacts },
      { slug: 'flipping', title: 'Notes flipping', content: flippingNotes },
    ],
  },
  {
    title: 'Zones',
    icon: '🗺️',
    entries: [
      { slug: 'mists', title: 'Mists Hunter', content: mists },
      { slug: 'donjons', title: 'Donjons solo', content: donjons },
      { slug: 'itineraires', title: 'Itinéraires zones rouges', content: itineraires },
    ],
  },
  {
    title: 'Ressources',
    icon: '📚',
    entries: [
      { slug: 'lexique', title: 'Lexique FR/EN', content: lexique },
      { slug: 'liens', title: 'Liens utiles', content: liensUtiles },
    ],
  },
];
