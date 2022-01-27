//Public API for the library
export { ConfiguredSpellcheckButton } from './lib/ui/components/ConfiguredSpellcheckButton';

export { CachedSpellchecker } from './lib/core/words/cached-spellchecker';

export { getMisspelledWords } from './lib/core/words/misspelled-words';

export { createWordParser, defaultWordParserOptions } from './lib/core/words/word-parser';

export { useCommitReplaceOperations } from './lib/core/document/commit-hook';
export { createPathPatches, createPathPatch } from './lib/core/document/document-patch';

export {
  getSpellcheckedValues,
  blockSpanSeparator,
} from './lib/core/document/document-spellcheck-values';

export {
  DisplayTextsContext,
  DisplayTexts,
  defaultDisplayTexts,
} from './lib/ui/components/display-texts/DisplayTexts';

export * from './lib/core/types';
