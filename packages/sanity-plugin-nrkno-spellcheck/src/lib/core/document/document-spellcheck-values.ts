import {
  ArraySchemaType,
  Block,
  ObjectSchemaType,
  Path,
  PathSegment,
  SanityDocument,
  SchemaType,
  pathToString,
} from 'sanity';
import { DisablesSpellcheckOptions, Language, OffsetPathValue, PathValue } from '../types';
import groupBy from 'lodash/groupBy';

const ignoredBlockFields = ['marks', 'markDefs', 'style', 'list'];
const ignoredTypes = ['slug', 'reference', 'url', 'datetime', 'date'];

export const blockSpanSeparator = '\n\n';

export function getSpellcheckedValues(
  document: SanityDocument,
  type: ObjectSchemaType,
  language: Language
): OffsetPathValue[][] {
  if (!document) {
    return [];
  }
  const paths = getPaths(document, type, language);
  const spellcheck = paths.filter(isSpellcheckable);
  return mergeSpans(spellcheck);
}

export function mergeSpans(paths: PathValue[]): OffsetPathValue[][] {
  const groupedByField: Record<string, PathValue[]> = groupBy(paths, (s) =>
    s.blockFieldPath ? pathToString(s.blockFieldPath) : pathToString(s.path)
  );

  return Object.values(groupedByField).map((g) => {
    let currentOffset = 0;
    return g.map((path) => {
      const offset = currentOffset;
      currentOffset += path.value.length + blockSpanSeparator.length;
      return { ...path, offset };
    });
  });
}

function isSpellcheckable(p: PathValue) {
  // the p.value type is not entirely correctly typed
  // noinspection SuspiciousTypeOfGuard
  return p.value && typeof p.value === 'string' && p.spellcheck;
}

function getPaths(object: any, documentType: ObjectSchemaType, language: Language) {
  const paths: PathValue[] = [];
  const nodeStack: PathValue[] = [
    {
      type: documentType,
      value: object,
      parentFieldTypes: [],
      path: [] as Path,
    },
  ];

  while (nodeStack.length > 0) {
    const n = nodeStack.pop();
    if (!n) {
      break;
    }

    Object.entries(n.value)
      .filter(([key]) => !key.startsWith('_'))
      .forEach(([key, value]) => {
        const parentType = n.type as ObjectSchemaType | ArraySchemaType;
        let fieldType: SchemaType | undefined;
        if (parentType.jsonType === 'object') {
          fieldType = parentType.fields.find((f) => f.name === key)?.type;
        } else {
          fieldType = parentType.of.find((o) => o.type?.name === (value as any)._type);
        }

        const isWithinBlock = fieldType?.name === 'block' || !!n.blockParentType;

        if (
          !fieldType ||
          isSpellcheckDisabledForPath(fieldType, language) ||
          (isWithinBlock && ignoredBlockFields.includes(key))
        ) {
          return;
        }

        const keyedItem = (value as any)?._key;
        const pathSegment: PathSegment = keyedItem ? { _key: keyedItem } : key;

        const path = n.path.concat(pathSegment);
        const blockParentType = fieldType.name === 'block' ? parentType : n.blockParentType;
        const blockValue = fieldType.name === 'block' ? (value as unknown as Block) : n.blockValue;
        const isSpanString = fieldType.name === 'string' && parentType.name === 'span';
        let blockFieldPath;
        if (isSpanString && path.length > 4) {
          blockFieldPath = path.slice(0, path.length - 4);
        }

        const pathValue: PathValue = {
          type: fieldType,
          path,
          parentFieldTypes: [...n.parentFieldTypes, n.type],
          blockFieldPath,
          blockParentType,
          blockValue,
          value,
          spellcheck: canSpellcheckField(fieldType, language),
        };
        paths.push(pathValue);

        // if value is object or array (this covers both), add to stack
        if (typeof value === 'object') {
          nodeStack.unshift(pathValue);
        }
      });
  }
  return paths;
}

function canSpellcheckField(fieldType: any, language: Language) {
  const spellcheckableType = fieldType.name === 'text' || fieldType.name === 'string';

  const options = fieldType?.options as DisablesSpellcheckOptions | undefined;
  const disableSpellcheck = isSpellcheckDisabledForPath(fieldType, language) || !!options?.list;

  return spellcheckableType && !disableSpellcheck;
}

function isSpellcheckDisabledForPath(fieldType: any, language: Language) {
  const options = fieldType?.options as DisablesSpellcheckOptions | undefined;
  const rootType = getRootType(fieldType);
  return (
    fieldType?.hidden ||
    options?.spellcheck === false ||
    (typeof options?.spellcheck === 'string' && options?.spellcheck !== language.code) ||
    ignoredTypes.includes(fieldType?.name) ||
    ignoredTypes.includes(rootType?.name)
  );
}

export function getRootType(type: SchemaType): SchemaType {
  if (!type.type) {
    return type;
  }
  return getRootType(type.type);
}
