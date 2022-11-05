import { SanitySchemaBase } from './util-types/common';
import { Rule, Validation } from './util-types/validation';
import { InitialValueProperty } from 'sanity';

/**
 * [Date docs]{@link https://www.sanity.io/docs/date-type }
 */
export interface DateSchema extends SanitySchemaBase {
  type: 'date';
  options?: DateOptions;

  /** [Validation docs](https://www.sanity.io/docs/validation) */
  validation?: (rule: DateRule) => Validation<DateRule>;

  /** [Initial value docs](https://www.sanity.io/docs/initial-value-templates) */
  initialValue?: InitialValueProperty<string>;
}

// must be interface and not type to allow for declaration merging
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DateRule extends Rule<DateRule> {}

/** [Date option docs]{@link https://www.sanity.io/docs/date-type#dateFormat-b17d616736ef} */
export interface DateOptions {
  /**
     Controls how the date input field formats the displayed date.
     Use any valid Moment format option. Default is YYYY-MM-DD.

     [Date option docs]{@link https://www.sanity.io/docs/date-type#dateFormat-b17d616736ef}
     */
  dateFormat?: string;

  /**
   * Label for the "jump to today" button on the date input widget. Default is Today.
   *
   * [Implied in the docs here]{@link https://www.sanity.io/docs/date-type#DiOGV9Vd}.
   */
  calendarTodayLabel?: string;
}
