import { MultiFieldSet } from '@sanity/types';

type FieldsetBase = Omit<MultiFieldSet, 'fields' | 'single'>;
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Fieldset extends FieldsetBase {}
