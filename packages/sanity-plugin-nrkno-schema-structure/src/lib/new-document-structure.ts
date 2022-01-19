import { StructureBuilder as S } from '@sanity/structure';
import { getDefaultSchema } from '@sanity/structure/lib/parts/Schema';
import { getTemplates } from '@sanity/initial-value-templates';
import { isActionEnabled } from '@sanity/structure/lib/parts/documentActionUtils';
import { createFromTopMenu } from './structure-helpers';
import { Template } from '@sanity/initial-value-templates/dist/dts/Template';
import { GroupRegistryApi } from './group-registry';
import { DocumentSchema } from '@nrk/nrkno-sanity-typesafe-schemas';
import { sortDoc } from './sortable';

export function createInitialValueTemplates(registry: GroupRegistryApi) {
  const schema = getDefaultSchema();

  const schemasByName = registry.enabledSchemas.reduce((prev, schema) => {
    return {
      ...prev,
      [schema.name]: schema,
    };
  }, {} as { [index: string]: DocumentSchema | undefined });

  const withoutParameters = (tpl: Template) => !tpl.parameters || tpl.parameters.length === 0;
  const withActionsEnabled = (tpl: Template) =>
    isActionEnabled(schema.get(tpl.schemaType), 'create');

  const withCreateEnabledGroup = (tpl: Template) => {
    return createFromTopMenu(schemasByName[tpl.schemaType], registry.rootGroups);
  };

  const bySchemaOrder = (a: Template, b: Template) => {
    const aSchema = schemasByName[a.schemaType];
    const bSchema = schemasByName[b.schemaType];
    return sortDoc(aSchema, bSchema, registry.locale);
  };

  function createInitialValueTemplateItems() {
    const templates = getTemplates()
      .filter(withoutParameters)
      .filter(withActionsEnabled)
      .filter(withCreateEnabledGroup)
      .sort(bySchemaOrder);

    return templates.map((tpl) => S.initialValueTemplateItem(tpl.id));
  }

  return [...createInitialValueTemplateItems()];
}
