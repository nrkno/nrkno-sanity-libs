import { useMemo } from 'react';
import { Schema, unsetInputComponent, unsetOption } from './utils';

/**
 * Given a Sanity schema-type, remove the named option.
 *
 * The result is memoized.
 *
 * @param type Sanity schema, typically props.type in custom components.
 * @param optionName named option to remove, recursively from type.
 *
 * @see unsetOption
 */
export function useUnsetOption<T extends Schema>(type: T, optionName: string): T {
  return useMemo(() => unsetOption(type, optionName), [type, optionName]);
}

/**
 * Given a Sanity schema-type, remove inputComponent from the schema, recursively.
 *
 * The result is memoized.
 *
 * @param type Sanity schema, typically props.type in custom components.
 *
 * @see unsetInputComponent
 */
export function useUnsetInputComponent<T extends Schema>(type: T): T {
  return useMemo(() => unsetInputComponent(type), [type]);
}
