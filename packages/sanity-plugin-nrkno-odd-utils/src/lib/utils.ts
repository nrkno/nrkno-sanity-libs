export type Schema = RecursiveSchema | { jsonType: string };

export interface RecursiveSchema extends Record<string, unknown> {
  jsonType: string;
  type?: Schema;
}

/**
 * Given a Sanity schema-type, remove the named option.
 *
 * @param type Sanity schema, typically props.type in custom components.
 * @param optionName named option to remove, recursively from type.
 *
 * @see useUnsetOption
 */
export function unsetOption<T extends Schema>(type: T, optionName: string): T {
  const options = 'options' in type ? type.options : undefined;
  const isObjectOption = typeof options === 'object' && !Array.isArray(options);
  const t: T = {
    ...type,
    options: isObjectOption
      ? {
          ...options,
          [optionName]: undefined,
        }
      : options,
  };
  const typeOfType = 'type' in type && type.type ? unsetOption(type.type, optionName) : undefined;
  return {
    ...t,
    type: typeOfType,
  };
}

/**
 * Given a Sanity schema-type, remove inputComponent from the schema, recursively.
 *
 * @param type Sanity schema, typically props.type in custom components.
 *
 * @see useUnsetInputComponent
 */
export function unsetInputComponent<T extends Schema>(type: T): T {
  const t = {
    ...type,
    inputComponent: undefined,
  };
  const typeOfType = 'type' in type && type.type ? unsetInputComponent(type.type) : undefined;
  return {
    ...t,
    type: typeOfType,
  };
}
