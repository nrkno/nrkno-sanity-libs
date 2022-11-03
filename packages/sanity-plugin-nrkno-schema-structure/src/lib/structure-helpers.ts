import { DocumentDefinition } from 'sanity';
import { CustomGroup } from './types';

export function createFromTopMenu(
  schema: DocumentDefinition | undefined,
  groups: CustomGroup<string>[]
): boolean {
  if (!schema) {
    return false;
  }
  const customStructure = schema.customStructure;
  if (!customStructure || !customStructure.type) {
    return true;
  }
  if (customStructure.type === 'manual') {
    return false;
  }

  const group = groups.find((g) => g.urlId === customStructure.group);
  if (!group) {
    return true;
  }

  const isSingleton = customStructure.type === 'document-singleton';
  const canAdd =
    customStructure.addToCreateMenu === true ||
    (group.addToCreateMenu && customStructure.addToCreateMenu !== false);
  return canAdd && !isSingleton;
}
