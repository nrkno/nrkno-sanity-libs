import { useRef } from 'react';

export function typed<T>(arg: T) {
  return arg;
}

export function classNames(...classes: (undefined | false | string)[]): string {
  return classes.filter((c): c is string => !!c).join(' ');
}

export function useId() {
  const ref = useRef('');
  if (!ref.current) {
    ref.current = `id-${Math.floor(Math.random() * Number.MAX_VALUE)}`;
  }
  return ref.current;
}
