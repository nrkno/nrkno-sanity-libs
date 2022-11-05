import { definePlugin, isObjectInputProps, ObjectInputProps } from 'sanity';
import { DocumentWithSpellcheck } from './DocumentWithSpellcheck';
import { SanityDocument } from '@sanity/types';

export const nrkSpellcheck = definePlugin({
  name: 'nrk-spellcheck',
  form: {
    components: {
      input: (props) => {
        if (isObjectInputProps(props) && getRootType(props.schemaType).name === 'document') {
          return <DocumentWithSpellcheck {...(props as ObjectInputProps<SanityDocument>)} />;
        }
        return props.renderDefault(props);
      },
    },
  },
});

function getRootType(type: any): any {
  if (!type.type) {
    return type;
  }
  return getRootType(type.type);
}
