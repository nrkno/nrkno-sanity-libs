//Public API for the library
export { createCustomGroup, type GroupRegistry, type CustomGroupId } from './lib/group-registry';
export {
  initStructureRegistry,
  type StructureGroupConfig,
  type StructureRegistryApi,
  type StructureItem,
} from './lib/structure-registry';

export { createTemplates } from './lib/new-document-structure';
export * from './lib/types';
