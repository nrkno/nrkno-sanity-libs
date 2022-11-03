import type {
  DefaultDocumentNodeContext,
  Divider,
  DocumentBuilder,
  ListItemBuilder,
  StructureBuilder,
  StructureResolverContext,
  ViewBuilder,
} from 'sanity/desk';
import { CustomGroupId, GroupRegistryApi, initRegistry } from './group-registry';
import {
  CustomGroup,
  CustomItem,
  DocumentList,
  SingletonDocument,
  StructureBase,
  Subgroup,
  Types,
  ViewSpec,
} from './types';
import { CurrentUser, DocumentDefinition, typed } from 'sanity';
import { isDefined } from './utility-types';
import { EditIcon } from '@sanity/icons';

export interface StructureGroupConfig {
  /**
   * Groups that should be available at the root level of Studio structure.
   * See documentation for more details.
   *
   * Groups available using {@link StructureRegistryApi}.getGroups.
   * Groups can also be composed using {@link StructureRegistryApi}.getGroupItems.
   */
  groups: CustomGroup<string>[];

  /**
   * Optional callback that will be invoked for every DocumentDefinition.
   *
   * When true is returned from the callback, the schema will
   * be omitted from all StructureRegistryApi structures.
   *
   * This is useful when there a Studio need additional ways to toggle
   * schemas visibility, for instance for feature-toggles based on runtime-environment.
   *
   * To debug disabled schemas, use {@link StructureRegistryApi}.getGroupRegistry().disabledSchemas.
   */
  isSchemaDisabled?: (schema: DocumentDefinition) => boolean;

  /**
   * Optional callback that will be invoked for every Subgroup.
   *
   * When true is returned from the callback, the subgroup will
   * be omitted from all StructureRegistryApi structures.
   *
   * This is useful when there a Studio need additional ways to toggle
   schemas visibility, for instance for feature-toggles based on runtime-environment.
   */
  isSubgroupDisabled?: (subgroup: Subgroup) => boolean;

  /**
   * Locale used for sorting.
   *
   * (sortKeyA.localeCompare(sortKeyB, locale, { sensitivity: 'variant' }) is used)
   *
   * Default: 'en'
   */
  locale?: string;

  /** Pass from StructureResolver S*/
  S: StructureBuilder;

  /** Pass from StructureResolver context*/
  context: Omit<StructureResolverContext, 'documentStore'>;
}

export interface StructureRegistryApi {
  /**
   * Returns ListItemBuilder holding all document-lists, documents, custom-builders and subgroups that are direct children of group with groupId.
   * Return type is an array because Group might have S.divider defined above or below.
   * @see getGroupItems
   * @see getUngrouped
   */
  getGroup: (groupId: CustomGroupId) => StructureItem[];

  /**
   * Returns one ListItemBuilder for every document-list, document, custom-builder and subgroup that are direct children of group with groupId
   * @see getGroup
   * @see getUngrouped
   */
  getGroupItems: (groupId: CustomGroupId) => StructureItem[];

  /**
   * Returns one ListItemBuilder (document list) for every document schema which has not been added to a group
   * and does not have type: 'manual'.
   */
  getUngrouped: () => ListItemBuilder[];

  /**
   * Returns every document schema with customStructure.type: 'manual'
   */
  getManualSchemas: () => DocumentDefinition[];

  /**
   * Returns a DocumentBuilder based on customStructure.views,
   * if they exists for the provided schemaType.
   *
   * ## Example
   * In deskStructure.ts:
   *
   * ```ts
   * export const getDefaultDocumentNode: DefaultDocumentNodeResolver = (S, context) => {
   *   return structureRegistry.getSchemaViews({ S, context }) ?? S.document();
   * };
   * ```
   *
   * Returns views wrapped in a DocumentBuilder if any are defined, undefined otherwise. Combine the return value with  ?? S.document() for default fallback.
   */
  getSchemaViews: ({
    S,
    context,
  }: {
    S: StructureBuilder;
    context: DefaultDocumentNodeContext;
  }) => DocumentBuilder | undefined;

  /**
   * Used by createInitialValueTemplates.
   * Provides access to grouped and ungrouped document schemas, as used by the StructureRegistry.
   *
   * The GroupRegistry also contains lists for enabled and disabled schemas, which can be useful
   * for debugging purposes.
   *
   * Returns GroupRegistryApi used by StructureRegistryApi
   */
  getGroupRegistry: () => GroupRegistryApi;
}

export type StructureItem = ListItemBuilder | Divider;

export function initStructureRegistry(config: StructureGroupConfig): StructureRegistryApi {
  const schemaToListItem = new Map<DocumentDefinition, ListItemBuilder>();
  const { S, context } = config;
  const currentUser = context.currentUser ?? undefined;
  let _registry: GroupRegistryApi | undefined;

  const { schema } = context;
  const schemas = schema
    .getTypeNames()
    .map((name) => schema.get(name) as unknown as DocumentDefinition);

  function getGroupRegistry() {
    if (_registry) {
      return _registry;
    }

    S.documentTypeListItems().forEach((listItem: any) => {
      schemaToListItem.set(listItem.spec.schemaType, listItem);
    });
    _registry = initRegistry({
      schemas,
      ...config,
      getUser: () => currentUser,
    });
    return _registry;
  }

  function getGroup(groupId: CustomGroupId): StructureItem[] {
    const group = getGroupRegistry().groups[groupId];
    if (!group) {
      return [];
    }
    return subgroupList(group);
  }

  function getGroupItems(groupId: CustomGroupId): StructureItem[] {
    const group = getGroupRegistry().groups[groupId];
    if (!group) {
      return [];
    }
    return getGroupRegistry()
      .getSubgroupEntries(group)
      .map(specToBuilder)
      .reduce((x, y) => x.concat(y), typed<StructureItem[]>([]));
  }

  function getUngrouped(): ListItemBuilder[] {
    return getGroupRegistry()
      .ungroupedSchemas.map((schema) => schemaToListItem.get(schema))
      .filter(isDefined);
  }

  function getManualSchemas(): DocumentDefinition[] {
    return getGroupRegistry().manualSchemas;
  }

  function getSchemaViews({
    S,
    context,
  }: {
    S: StructureBuilder;
    context: DefaultDocumentNodeContext;
  }): DocumentBuilder | undefined {
    const matchingTypes = schemas
      .filter((schemaType) => schemaType?.name === context.schemaType)
      .map((schemaType) => {
        const omitFormView = schemaType.customStructure?.omitFormView;
        const viewsFn = schemaType.customStructure?.views;
        let viewList: ViewBuilder[] = [];
        if (viewsFn) {
          const views = viewsFn(S, context);
          viewList = Array.isArray(views) ? [...views] : [views];
        }

        if (viewList.length) {
          if (!omitFormView) {
            viewList = [S.view.form().title('Edit').icon(EditIcon), ...viewList];
          }
          return S.document().views(viewList);
        }
        return undefined;
      });
    return matchingTypes.length ? matchingTypes[0] : undefined;
  }

  function getViews(spec: ViewSpec): ViewBuilder[] {
    const views = spec.views;
    let viewList = views ? (Array.isArray(views) ? [...views] : [views]) : [];
    if (viewList.length) {
      if (!spec.omitFormView) {
        viewList = [S.view.form().title('Edit').icon(EditIcon), ...viewList];
      }
    }
    return viewList;
  }

  function subgroupList(subgroup: Subgroup): StructureItem[] {
    const entries = getGroupRegistry().getSubgroupEntries(subgroup);
    const items = entries.map((structure) => {
      return hasAccess(structure.spec.enabledForRoles, specToBuilder(structure));
    });
    const spec = subgroup.spec;

    return withDividers(
      S.listItem({
        id: spec.urlId,
        title: spec.title,
        icon: spec.icon,
      }).child(async () => {
        const resolvedItems = (await Promise.all(items))
          .filter(isDefined)
          .reduce((x, y) => x.concat(y), typed<StructureItem[]>([]));
        return S.list().title(spec.title).items(resolvedItems);
      }),
      spec
    );
  }

  function withDividers(builder: StructureItem, spec: StructureBase): StructureItem[] {
    if (!builder) {
      return [];
    }
    return [
      spec.divider === 'over' || spec.divider === 'over-under' ? S.divider() : undefined,
      builder,
      spec.divider === 'under' || spec.divider === 'over-under' ? S.divider() : undefined,
    ].filter(isDefined);
  }

  function userHasAccessToStructure(
    enabledForRoles: string[] | undefined,
    user: CurrentUser | undefined
  ): boolean {
    return (
      !enabledForRoles ||
      enabledForRoles.some((role) => user?.roles?.some((userRole) => userRole.name === role))
    );
  }

  async function hasAccess<T>(enabledForRoles: string[] | undefined, item: T) {
    return userHasAccessToStructure(enabledForRoles, currentUser) ? item : undefined;
  }

  function specToBuilder(structure: Types): StructureItem[] {
    const spec = structure.spec;
    switch (spec.type) {
      case 'subgroup':
        return subgroupList(structure as Subgroup);
      case 'document-list':
        return documentTypeList(structure as DocumentList);
      case 'custom-builder':
        return withDividers(spec.listItem((structure as CustomItem).schema), spec);
      case 'document':
        return singletonDocument(structure as SingletonDocument);
    }
  }

  function documentTypeList({ schema, spec }: DocumentList): StructureItem[] {
    const typeList = S.documentTypeList({
      schemaType: schema.name,
      title: spec.title,
    });

    if (!spec.urlId) {
      throw new Error(`urlId missing in spec: ${JSON.stringify(spec)}`);
    }
    spec.ordering && typeList.defaultOrdering(spec.ordering);

    return withDividers(
      S.listItem({
        id: spec.urlId,
        title: spec.title,
        icon: spec.icon,
        schemaType: schema.name,
      }).child(typeList),
      spec
    );
  }

  function singletonDocument(doc: SingletonDocument): StructureItem[] {
    let documentBuilder = S.document({
      id: doc.spec.urlId,
      title: doc.spec.title,
    })
      .schemaType(doc.schema.name)
      .documentId(doc.spec.documentId);

    if (doc.schema.customStructure) {
      const customViews = getViews(doc.schema.customStructure);
      if (customViews) {
        documentBuilder = documentBuilder.views(customViews);
      }
    }
    return withDividers(
      S.listItem({
        id: doc.spec.urlId,
        title: doc.spec.title,
        icon: doc.spec.icon,
      }).child(documentBuilder),
      doc.spec
    );
  }

  return {
    getGroup,
    getGroupItems,
    getUngrouped,
    getSchemaViews,
    getManualSchemas,
    getGroupRegistry,
  };
}
