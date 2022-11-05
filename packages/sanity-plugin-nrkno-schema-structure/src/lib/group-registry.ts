import {
  CustomGroup,
  CustomItem,
  CustomStructureSpec,
  CustomSubgroup,
  DocumentList,
  GroupableSpec,
  SingletonDocument,
  StructureBase,
  Subgroup,
  SubgroupSpec,
} from './types';
import { CurrentUser, DocumentDefinition } from 'sanity';
import { isDefined } from './utility-types';
import { sortDoc, sortSortable } from './sortable';

declare module 'sanity' {
  interface DocumentDefinition {
    customStructure?: CustomStructureSpec;
  }
}

// open for extension
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GroupRegistry {}

export type CustomGroupId = keyof GroupRegistry;

export interface DocumentGroups {
  [index: string]: Subgroup | undefined;
}

interface Subgroups {
  [index: string]: Subgroup | undefined;
}

export function createCustomGroup<Id extends string, Group extends CustomGroup<Id>>(group: Group) {
  return group;
}

export type GetUser = () => CurrentUser | undefined;

export interface RegistryConfig {
  schemas: DocumentDefinition[];
  groups: CustomGroup<string>[];
  getUser: GetUser;
  isSchemaDisabled?: (schema: DocumentDefinition) => boolean;
  isSubgroupDisabled?: (subgroup: Subgroup) => boolean;
  locale?: string;
}

export interface GroupRegistryApi {
  rootGroups: CustomGroup<string>[];
  groups: DocumentGroups;
  manualSchemas: DocumentDefinition[];
  ungroupedSchemas: DocumentDefinition[];
  disabledSchemas: DocumentDefinition[];
  enabledSchemas: DocumentDefinition[];
  getSubgroupEntries: (
    subgroup: Subgroup
  ) => (Subgroup | DocumentList | SingletonDocument | CustomItem)[];
  locale: string;
}

export const DEFAULT_LOCALE = 'en';

export function initRegistry({
  schemas,
  groups: rootGroups,
  isSchemaDisabled = () => false,
  isSubgroupDisabled = () => false,
  getUser,
  locale = DEFAULT_LOCALE,
}: RegistryConfig): GroupRegistryApi {
  const { groups, subgroups } = initGroups(rootGroups);
  const user = getUser();

  const ungroupedSchemas: DocumentDefinition[] = [];
  const manualSchemas: DocumentDefinition[] = [];
  const disabledSchemas: DocumentDefinition[] = [];
  const enabledSchemas: DocumentDefinition[] = schemas
    .map((schema: DocumentDefinition) => {
      const spec = schema?.customStructure;
      if (!spec) {
        ungroupedSchemas.push(schema);
        return schema;
      }
      const schemaDisabled = isSchemaDisabled(schema) || !userHasAccess(spec, user);
      if (schemaDisabled) {
        return;
      }

      if (spec.type === 'manual') {
        manualSchemas.push(schema);
        return schema;
      }

      const subgroup = ensureSubgroupExists(spec, subgroups, schema);
      if (!subgroup) {
        ungroupedSchemas.push(schema);
        return schema;
      }
      if (isSubgroupDisabled(subgroup) || !userHasAccess(subgroup.spec, user)) {
        return;
      }

      addSpecToSubgroup(spec, subgroup, schema);
      return schema;
    })
    .filter(isDefined);

  ungroupedSchemas.sort((a, b) => sortDoc(a, b, locale));

  return {
    rootGroups,
    groups: removeEmptyGroups(groups),
    ungroupedSchemas,
    disabledSchemas,
    manualSchemas,
    enabledSchemas,
    locale,
    getSubgroupEntries: (subgroup: Subgroup) => getSubgroupEntries(subgroup, locale),
  };
}

function userHasAccess(spec: StructureBase, user?: CurrentUser) {
  const enabledForRoles = spec.enabledForRoles;
  return (
    !enabledForRoles ||
    enabledForRoles.some((role) => user?.roles?.some((userRole) => userRole.name === role))
  );
}

function initGroups(customGroups: CustomGroup<string>[]) {
  const rootGroups: DocumentGroups = {};
  const subgroups: Subgroups = {};

  Object.values(customGroups).forEach((group) => {
    const subgroup = createSubgroup({
      ...group,
    });
    subgroups[group.urlId] = subgroup;
    rootGroups[group.urlId] = subgroup;
  });

  return { groups: rootGroups, subgroups };
}

export function createSubgroup(spec: SubgroupSpec, schema?: DocumentDefinition): Subgroup {
  const customItems: CustomItem[] =
    spec && spec.customItems && schema
      ? spec.customItems?.map((spec) => ({
          schema,
          spec: {
            ...spec,
            title: spec.title ?? schema.title ?? '',
          },
        }))
      : [];
  return {
    spec: {
      type: 'subgroup',
      ...spec,
    },
    groups: [],
    schemas: [],
    documents: [],
    customItems,
  };
}

function ensureSubgroupExists(
  spec: CustomStructureSpec,
  subgroups: Subgroups,
  schema: DocumentDefinition
) {
  if (isGroupeable(spec)) {
    const group = subgroups[spec.group];
    if (!group) {
      return;
    }
    if ('subgroup' in spec && spec.subgroup) {
      const subgroupSpecs = Array.isArray(spec.subgroup) ? spec.subgroup : [spec.subgroup];
      subgroupSpecs.forEach((subgroupSpec: CustomSubgroup, index: number) => {
        const subgroupId = subgroupSpec.urlId;
        let subgroup = subgroups[subgroupId];
        if (!subgroup) {
          subgroup = createSubgroup(subgroupSpec, schema);
          subgroups[subgroupId] = subgroup;
          if (index === 0) {
            group.groups = [...group.groups, subgroup];
          }
        }

        if (index > 0) {
          const parentGroupSpec = subgroupSpecs[index - 1];
          const parent = subgroups[parentGroupSpec.urlId];
          const existInParent = parent?.groups.find((g) => g.spec.urlId === subgroupId);
          if (parent && !existInParent) {
            // mutate the parent, its easier
            parent.groups = [...(parent?.groups ?? []), subgroup];
          }
        }
      });

      const subgroupId = subgroupSpecs[subgroupSpecs.length - 1].urlId;
      return subgroups[subgroupId];
    } else {
      return group;
    }
  }
}

function isGroupeable(spec: CustomStructureSpec): spec is GroupableSpec & { group: CustomGroupId } {
  return !!('group' in spec && spec.group);
}

function addSpecToSubgroup(
  spec: CustomStructureSpec,
  subgroup: Subgroup,
  schema: DocumentDefinition
) {
  switch (spec.type) {
    case 'document-list':
      subgroup.schemas = [
        ...subgroup.schemas,
        {
          schema,
          spec: {
            ...spec,
            title: spec.title ?? schema.title ?? schema.name,
            urlId: spec.urlId ?? schema.name,
          },
        },
      ];
      break;
    case 'document-singleton':
      subgroup.documents = [
        ...subgroup.documents,
        ...spec.documents.map((docSpec) => ({
          spec: {
            type: 'document' as const,
            enabledForRoles: spec.enabledForRoles,
            ...docSpec,
            urlId: docSpec.urlId ?? docSpec.documentId,
          },
          schema,
        })),
      ];
      break;
    case 'custom-builder':
      subgroup.customItems = [
        ...subgroup.customItems,
        {
          spec: {
            ...spec,
            title: spec.title ?? '',
          },
          schema,
        },
      ];
      break;
    default:
      throw new Error(
        `Unknown structure spec. Type: ${(spec as any)?.type}, spec: ${JSON.stringify(spec)}.`
      );
  }
}

function removeEmptyGroups(groups: DocumentGroups) {
  Object.keys(groups).forEach((key: keyof typeof groups) => {
    const group = groups[key];
    if (
      !group ||
      (!group.groups.length &&
        !group.schemas.length &&
        !group.documents.length &&
        !group.customItems.length)
    ) {
      delete groups[key];
    }
  });
  return groups;
}

export function getSubgroupEntries(
  { groups, schemas, documents, customItems }: Subgroup,
  locale: string
): (Subgroup | DocumentList | SingletonDocument | CustomItem)[] {
  return [...groups, ...schemas, ...documents, ...customItems].sort((a, b) =>
    sortSortable(a.spec, b.spec, locale)
  );
}
