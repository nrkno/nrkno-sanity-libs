import { arrayOf, field, schema, typed } from '../typesafe-schemas';
import { HideContext } from '../schemas/util-types/common';
import { SanityDocument, ValidationContext } from 'sanity';
import { SlugOptions } from '../schemas/slug';

export const megaSchema = schema('document', {
  name: 'megatron',
  title: 'Optimus Prime',
  fields: [
    {
      name: 'noHelperField',
      type: 'string',
      title: 'Still must implement some generic fields',
    },
    field('array', {
      name: 'arrayField',
      title: 'Array of dates',
      validation: (rule) => rule.min(1).max(2),
      of: [arrayOf('date'), { type: 'datetime' }],
      options: {
        editModal: 'popover',
      },
    }),
    field('boolean', {
      name: 'booleanField',
      title: 'Checkbox',
      validation: (rule) => rule.required(),
      options: {
        layout: 'checkbox',
      },
    }),
    field('object', {
      name: 'objectField',
      title: 'Object field',
      fieldsets: [
        {
          title: 'Row',
          name: 'row',
          options: { columns: 2 },
        },
      ],
      hidden: ({
        currentUser,
        parent,
      }: HideContext<SanityDocument, { booleanField?: boolean }, Record<string, unknown>>) => {
        if (currentUser.roles.find((r) => r.name === 'wizard')) {
          return false;
        }
        return !!parent?.booleanField;
      },
      fields: [
        field('geopoint', {
          name: 'geopointField',
          title: 'Geopoint',
          fieldset: 'row',
        }),
        field('number', {
          name: 'numberField',
          title: 'Number',
          validation: (rule) => rule.integer().greaterThan(1).lessThan(5),
        }),
      ],
      validation: (rule) =>
        rule.required().custom((value: Record<string, unknown>, context: ValidationContext) => {
          if (!context.parent) {
            return false;
          }
          if (!value.geopointField) {
            return {
              message: 'Something childlike',
              paths: [['geopointField']],
            };
          }
          return true;
        }),
    }),
    field('array', {
      name: 'portableText',
      title: 'Portable text',
      of: [
        arrayOf('block', {
          title: 'Block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H1', value: 'h1' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'H4', value: 'h4' },
            { title: 'Quote', value: 'blockquote' },
          ],
          lists: [{ title: 'Bullet', value: 'bullet' }],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
            ],
            annotations: [
              {
                title: 'URL',
                name: 'link',
                type: 'object',
                fields: [
                  {
                    title: 'URL',
                    name: 'href',
                    type: 'url',
                  },
                ],
              },
            ],
          },
        }),
        arrayOf('image', {
          fields: [
            field('text', {
              name: 'imageText',
              title: 'Image text',
            }),
          ],
          options: { hotspot: true },
        }),
      ],
    }),
    field('slug', {
      name: 'slug',
      title: 'Slug',
      // options: {
      //   // typescript refuse infer function params types for whatever reason
      //   source: (_: unknown, options: SlugSourceOptions<any>) => options.parent.whateverYouWant,
      //   slugify: (source: string) => {
      //     return source;
      //   },
      //   isUnique: (slug: string, options: SlugUniqueOptions) => {
      //     return !!options.type.options;
      //   },
      // },
      // this works however :shrug:
      options: typed<SlugOptions>({
        source: (_, options) => (options.parent as any).whatever,
        slugify: (source) => source,
        isUnique: (slug, options) => !!options.type.options,
      }),
    }),
  ],
});
