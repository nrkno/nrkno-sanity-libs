import { SanitySchemaBase } from './util-types/common';
import { Rule, Validation } from './util-types/validation';
import { InitialValueProperty } from 'sanity';

/**
 * [Datetime docs]{@link https://www.sanity.io/docs/datetime-type }
 */
export interface DatetimeSchema extends SanitySchemaBase {
  type: 'datetime';
  options?: DatetimeOptions;

  /** [Validation docs](https://www.sanity.io/docs/validation) */
  validation?: (rule: DatetimeRule) => Validation<DatetimeRule>;

  /** [Initial value docs](https://www.sanity.io/docs/initial-value-templates) */
  initialValue?: InitialValueProperty<string>;
}

/** [Datetime option docs]{@link https://www.sanity.io/docs/datetime-type#dateFormat-b17d616736ef}. */
export interface DatetimeOptions {
  /**
   * Controls how the time input field formats the displayed date.
   * Use any valid Moment format option. Default is HH:mm.
   *
   * [Datetime option docs]{@link https://www.sanity.io/docs/datetime-type#dateFormat-b17d616736ef}.
   */
  timeFormat?: string;

  /**
   * Number of minutes between each entry in the time input.
   * Default is 15 which lets the user choose between 09:00, 09:15, 09:30 and so on.
   *
   * [Datetime option docs]{@link https://www.sanity.io/docs/datetime-type#dateFormat-b17d616736ef}.
   */
  timeStep?: number;

  /**
   * Label for the "jump to today" button on the date input widget. Default is Today.
   *
   * [Implied in the docs here]{@link https://www.sanity.io/docs/datetime-type#DiOGV9Vd}.
   */
  calendarTodayLabel?: string;
}

/** [Datetime validation docs]{@link https://www.sanity.io/docs/datetime-type#required()-317a51883c16} */
export interface DatetimeRule extends Rule<DatetimeRule> {
  /**
   * @param minDate Minimum date (inclusive). minDate should be in ISO 8601 format.
   */
  min: (minDate: string) => DatetimeRule;
  /**
   * @param maxDate Maximum date (inclusive). maxDate should be in ISO 8601 format.
   */
  max: (maxDate: string) => DatetimeRule;
}
