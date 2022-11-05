import { SanitySchemaBase } from './util-types/common';
import { Rule, Validation } from './util-types/validation';
import { InitialValueProperty, TitledListValue } from 'sanity';

/**
 * [Number docs](https://www.sanity.io/docs/number-type).
 */
export interface NumberSchema extends SanitySchemaBase {
  type: 'number';
  options?: NumberOptions;

  /** [Validation docs](https://www.sanity.io/docs/validation) */
  validation?: (rule: NumberRule) => Validation<NumberRule>;

  /** [Initial value docs](https://www.sanity.io/docs/initial-value-templates) */
  initialValue?: InitialValueProperty<number>;
}

export interface NumberOptions {
  /**
   * A list of predefined values that the user may pick from.
   * The array can include numeric values [1, 2] or objects [{value: 1, title: 'One'}, ...].
   */
  list?: TitledListValue<number>[] | number[];

  /**
   * Controls how the items defined in the list option are presented.
   * If set to 'radio' the list will render radio buttons.
   * If set to 'dropdown' we'll get a dropdown menu instead.
   *
   * Default is dropdown.
   */
  layout?: 'radio' | 'dropdown';

  /**
   * Controls how radio buttons are lined up. Use direction: 'horizontal|vertical' to
   * render radio buttons in a row or a column.
   *
   * Default is vertical.
   *
   * Will only take effect if the layout option is set to radio.
   */
  direction?: 'horizontal' | 'vertical';
}

/** [Number validation docs](https://www.sanity.io/docs/number-type#required()-538506d6c6c6) */
export interface NumberRule extends Rule<NumberRule> {
  /** [Number validation docs](https://www.sanity.io/docs/number-type#required()-538506d6c6c6) */
  min: (minNumber: number) => NumberRule;
  /** [Number validation docs](https://www.sanity.io/docs/number-type#required()-538506d6c6c6) */
  max: (maxNumber: number) => NumberRule;
  /** [Number validation docs](https://www.sanity.io/docs/number-type#required()-538506d6c6c6) */
  lessThan: (limit: number) => NumberRule;
  /** [Number validation docs](https://www.sanity.io/docs/number-type#required()-538506d6c6c6) */
  greaterThan: (limit: number) => NumberRule;
  /** [Number validation docs](https://www.sanity.io/docs/number-type#required()-538506d6c6c6) */
  integer: () => NumberRule;
  /** [Number validation docs](https://www.sanity.io/docs/number-type#required()-538506d6c6c6) */
  precision: (limit: number) => NumberRule;
  /** [Number validation docs](https://www.sanity.io/docs/number-type#required()-538506d6c6c6) */
  positive: () => NumberRule;
  /** [Number validation docs](https://www.sanity.io/docs/number-type#required()-538506d6c6c6) */
  negative: () => NumberRule;
}
