// A minimal example of how the helper functions work

interface TypeDirectory {
  a: { type: 'A'; options: string };
  b: { type: 'B'; options: boolean };
}
type Type = keyof TypeDirectory;

type Custom = '' | undefined | null;
type TypeOrCustom = Type | Custom;

type FallbackType = {
  type: string;
  options?: unknown;
};
type InDirectory<T extends TypeOrCustom> = T extends Type ? TypeDirectory[T] : FallbackType;

function inferSchema<InferType extends TypeOrCustom, Out extends InDirectory<InferType>>(
  t: InferType,
  out: InferType extends Type ? Omit<Out, 'type'> : Out
) {
  return out;
}

// dont need to specify type for these and we get autocomplete for options
inferSchema('a', { options: 'A' });
inferSchema('b', { options: true });

// @ts-expect-error c is not in TypeDirectory and is not custom, so out must be boolean
inferSchema('c', 'C');

// no autocomplete for options since it falls back to unknown
inferSchema(undefined, { type: 'anystring' });
inferSchema('', { type: 'anystring', options: {} });
inferSchema(null, { type: 'anystring', options: { noHelpHere: true } });

// @ts-expect-error incorrect fallback
inferSchema('', {});
