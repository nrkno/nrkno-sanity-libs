import { DocumentSchema } from '@nrk/nrkno-sanity-typesafe-schemas';

export interface Sortable {
  sortKey?: string;
  title?: string;
  urlId?: string;
}

export function sortDoc(
  a: DocumentSchema | undefined,
  b: DocumentSchema | undefined,
  locale: string
) {
  return sortSortable(sortableDoc(a), sortableDoc(b), locale);
}

export function sortSortable(a: Sortable, b: Sortable, locale: string) {
  const sortA = sortString(a);
  const sortB = sortString(b);
  return sortA.localeCompare(sortB, locale, { sensitivity: 'variant' });
}

function sortableDoc(doc?: DocumentSchema) {
  const struc = doc?.customStructure;
  return {
    title: struc?.title ?? doc?.title,
    urlId: struc?.urlId ?? doc?.name,
    sortKey: struc?.sortKey,
  };
}

export function sortString(sortable: Sortable): string {
  return sortable.sortKey ?? sortable.title ?? sortable.urlId ?? '';
}
