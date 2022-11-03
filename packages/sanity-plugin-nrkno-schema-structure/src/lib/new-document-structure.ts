import { createFromTopMenu } from './structure-helpers';
import { initRegistry } from './group-registry';
import { sortDoc } from './sortable';
import { ConfigContext, DocumentDefinition, Template } from 'sanity';
import { CustomGroup } from './types';

export function createTemplates(
  templates: Template[],
  context: ConfigContext,
  groups: CustomGroup<string>[]
): Template[] {
  const schemas: DocumentDefinition[] = context.schema
    .getTypeNames()
    .map((name) => context.schema.get(name) as unknown as DocumentDefinition);

  const registry = initRegistry({
    schemas,
    groups,
    ...context,
    getUser: () => context.currentUser ?? undefined,
  });

  const schemasByName = registry.enabledSchemas.reduce((prev, schema) => {
    return {
      ...prev,
      [schema.name]: schema,
    };
  }, {} as { [index: string]: DocumentDefinition | undefined });

  const withoutParameters = (tpl: Template) => !tpl.parameters || tpl.parameters.length === 0;

  const withCreateEnabledGroup = (tpl: Template) => {
    return createFromTopMenu(schemasByName[tpl.schemaType], registry.rootGroups);
  };

  const bySchemaOrder = (a: Template, b: Template) => {
    const aSchema = schemasByName[a.schemaType];
    const bSchema = schemasByName[b.schemaType];
    return sortDoc(aSchema, bSchema, registry.locale);
  };

  return templates.filter(withoutParameters).filter(withCreateEnabledGroup).sort(bySchemaOrder);
}
