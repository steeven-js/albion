import type { Element, ElementContent, Root, Text } from 'hast';
import { visit } from 'unist-util-visit';
import { itemIconUrl } from '../components/ItemIcon';

// Matche les item IDs Albion : T[1-8]_XXX(_YYY...)(@[1-4])?
const ITEM_RE = /\bT[1-8]_[A-Z0-9][A-Z0-9_]*(?:@[1-4])?\b/g;

const SKIP_TAGS = new Set(['code', 'pre', 'a', 'img']);

/**
 * Détecte les item IDs Albion dans les nœuds de texte et les remplace par une
 * petite icône inline (source : render.albiononline.com) suivie du texte.
 */
export function rehypeItemIcons() {
  return (tree: Root) => {
    visit(tree, 'text', (node: Text, index, parent) => {
      if (
        parent == null ||
        index == null ||
        parent.type !== 'element' ||
        SKIP_TAGS.has((parent as Element).tagName)
      ) {
        return;
      }
      const value = node.value;
      ITEM_RE.lastIndex = 0;
      if (!ITEM_RE.test(value)) return;

      ITEM_RE.lastIndex = 0;
      const newChildren: ElementContent[] = [];
      let lastIdx = 0;
      let match: RegExpExecArray | null;

      while ((match = ITEM_RE.exec(value)) !== null) {
        if (match.index > lastIdx) {
          newChildren.push({ type: 'text', value: value.slice(lastIdx, match.index) });
        }
        const id = match[0];
        newChildren.push({
          type: 'element',
          tagName: 'img',
          properties: {
            src: itemIconUrl(id, 48),
            alt: id,
            title: id,
            className: ['item-icon-inline'],
          },
          children: [],
        });
        newChildren.push({ type: 'text', value: id });
        lastIdx = match.index + id.length;
      }
      if (lastIdx < value.length) {
        newChildren.push({ type: 'text', value: value.slice(lastIdx) });
      }

      (parent as Element).children.splice(index, 1, ...newChildren);
    });
  };
}
