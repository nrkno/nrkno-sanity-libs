import { SanityDocument } from '@sanity/types';

export interface BasicPreviewProps {
  documentId: string;
  schemaType?: unknown;
  document: {
    draft?: SanityDocument;
    published?: SanityDocument;
    historical?: SanityDocument;
    displayed?: SanityDocument;
  };
}
