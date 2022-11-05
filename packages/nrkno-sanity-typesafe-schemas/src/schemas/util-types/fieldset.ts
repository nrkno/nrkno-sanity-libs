import { MultiFieldSet } from 'sanity';

type FieldsetBase = Omit<MultiFieldSet, 'fields' | 'single'>;
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Fieldset extends FieldsetBase {}
