import { ReactNode } from 'react';

export interface SanitySchemaBase {
  type: string;
  name: string;

  /** Human readable label. */
  title?: string;

  /**  Short description to editors how the field is to be used. */
  description?: string | ReactNode;

  icon?: ReactNode;

  /** [Custom input components]{@link https://www.sanity.io/docs/custom-input-widgets} */
  inputComponent?: ReactNode;

  /**  [Custom diff components]{@link https://www.sanity.io/docs/custom-diff-components} */
  diffComponent?: ReactNode;
}

export type Options<T extends { options?: unknown }> = Required<T>['options'];

export interface Preview {
  /** [Preview docs]{@link https://www.sanity.io/docs/previews-list-views#specify-preview-options-770fd57a8f95} */
  select?: Record<string, string>;

  /** [Preview docs]{@link https://www.sanity.io/docs/previews-list-views#specify-preview-options-770fd57a8f95} */
  prepare?: (
    selectResult: unknown
  ) => Partial<{ title: string; subtitle: string; media: ReactNode }>;

  /** [Preview for array docs]{@link https://www.sanity.io/docs/previews-list-views#custom-preview-component-for-block-content-and-array-previews-d82fd035385f} */
  component?: ReactNode;
}

export interface TitledListValue<V = unknown> {
  _key?: string;
  title: string;
  value: V;
}

export interface EnumListProps<V = unknown> {
  list?: TitledListValue<V>[] | V[];
  layout?: 'radio' | 'dropdown';
  direction?: 'horizontal' | 'vertical';
}

export interface HideContext<Document = any, Parent = any, Value = any> {
  document?: Document;
  parent?: Parent;
  value?: Value;
  currentUser: {
    email: string;
    id: string;
    name: string;
    profileImage: string;
    role: string;
    roles: { name: string; title: string; description: string }[];
  };
}

export type HideFunction<Document = any, Parent = any, Value = any> = (
  state: HideContext<Document, Parent, Value>
) => boolean;

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
