import { CustomGroupId } from './group-registry';
import { ListItemBuilder, ViewBuilder } from 'sanity/desk';
import { DocumentDefinition } from 'sanity';
import { XOR } from './utility-types';
import { ComponentType, ReactNode } from 'react';
import { DefaultDocumentNodeContext, StructureBuilder } from 'sanity/lib/exports/desk';

export type SortItem = {
  field: string;
  direction: 'asc' | 'desc';
};

export type IconType = ComponentType | ReactNode;

export interface StructureBase {
  /**
   * If defined:
   * * the document-type is only visible if current user has a role in the list.
   * * the document-type is not listed in the create menu, even for users with access. Must use document-type list.
   *
   * See [create-access-roles.md](../../../docs/how-tos/create-access-roles.md) for details.
   *
   * Visit Sanity management console to find the role-ids.
   *
   * @example enabledForRoles: ['developer', 'administrator']
   * */
  enabledForRoles?: string[];

  /**
   * Use to override addToCreateMenu on {@link CustomGroup}.
   * This is needed for "Create new" button to appear next to reference-fields.
   *
   * So: set to true for types that are in a group with addToCreateMenu: false,
   * but needs to be created in place.
   *
   * @see createFromTopMenu
   * @see createNewMenuSortLast
   * */
  addToCreateMenu?: boolean;

  /**
   * Entries in a group are sorted lexically by sortKey ?? title ?? urlId
   *
   * Sort uses string.localeCompare with locale provided to structureRegistry.
   *
   * Ungrouped schemas are sorted similarly.
   * */
  sortKey?: string;

  /**
   * When set, a S.divider will be placed at the indicated location.
   */
  divider?: DividerPlacement;
}

export type DividerPlacement = 'over' | 'under' | 'over-under';

export interface StructureSpec extends StructureBase {
  /** Uses schema-title when undefined */
  title?: string;
  /** Structure id, will be visible in url. Uses schema-name when undefined */
  urlId?: string;
  /** Uses schema-icon when undefined*/
  icon?: IconType;
}

export interface CustomGroup<Id extends string> extends StructureBase {
  /** Structure id, will be visible in url. Uses schema-name when undefined */
  urlId: Id;
  title: string;
  icon?: IconType;
  addToCreateMenu: boolean;
}

export interface SubgroupSpec extends StructureSpec {
  /** Structure id, will be visible in url. Uses schema-name when undefined */
  urlId: string;
  title: string;
  icon?: IconType;
  customItems?: CustomBuilderSpec[];
}

export interface Subgroup {
  groups: Subgroup[];
  schemas: DocumentList[];
  documents: SingletonDocument[];
  customItems: CustomItem[];
  spec: SubgroupSpec & { type: 'subgroup' };
}

interface RequiredTitle {
  title: string;
}

export interface DocumentListSpec extends StructureSpec {
  type: 'document-list';

  /**
   * Passed to S.documentTypeList defaultOrdering: https://www.sanity.io/docs/structure-builder-reference#defaultOrdering-f1c765c41782
   * */
  ordering?: SortItem[];
}

export type DocumentList = {
  schema: DocumentDefinition;
  spec: DocumentListSpec & RequiredTitle & GroupableSpec;
};

export interface SingletonSpec extends Omit<StructureSpec, 'sortKey'> {
  type: 'document-singleton';
  ordering?: SortItem[];
  documents: Omit<SingletonDocumentSpec, 'type'>[];
}

export interface SingletonDocumentSpec extends StructureSpec {
  type: 'document';
  urlId?: string;
  documentId: string;
  title: string;
  icon?: IconType;
}

export interface ManualSpec extends StructureBase {
  type: 'manual';
}

export interface SingletonDocument {
  schema: DocumentDefinition;
  spec: SingletonDocumentSpec & RequiredTitle & { urlId: string };
}

export type CustomBuilder = (schema: DocumentDefinition) => ListItemBuilder;

export interface CustomBuilderSpec extends StructureSpec {
  type: 'custom-builder';
  listItem: CustomBuilder;
}

export interface CustomItem {
  spec: CustomBuilderSpec & RequiredTitle;
  schema: DocumentDefinition;
}

export type CustomSubgroup = Omit<SubgroupSpec, 'type'>;

type Groupable = XOR<DocumentListSpec, XOR<SingletonSpec, CustomBuilderSpec>>;

export type GroupableSpec = Groupable &
  XOR<
    {
      group?: CustomGroupId;
    },
    {
      group: CustomGroupId;
      subgroup?: CustomSubgroup | CustomSubgroup[];
    }
  >;

export interface ViewSpec {
  omitFormView?: boolean;
  views?: (S: StructureBuilder, context: DefaultDocumentNodeContext) => ViewBuilder | ViewBuilder[];
}

export type CustomStructureSpec = XOR<GroupableSpec, ManualSpec> & ViewSpec;

export type Types = XOR<Subgroup, XOR<DocumentList, XOR<SingletonDocument, CustomItem>>>;
