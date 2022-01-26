import { Button, Flex, Menu, MenuButton, MenuItem, Spinner } from '@sanity/ui';
import React, { ComponentProps, forwardRef, Ref } from 'react';
import { Language } from '../../core/types';
import { useId } from '../../core/helpers';
import { useDisplayText } from './display-texts/DisplayTexts';

export type LanguageConfig = Language | Language[] | undefined;

export type SpellcheckButtonProps = Omit<ComponentProps<typeof Button>, 'onClick'> & {
  loading?: boolean;
  language: LanguageConfig;
  onLanguageSelected: (language: Language) => void;
};

export const SpellcheckButton = React.memo(function SpellcheckButton(props: SpellcheckButtonProps) {
  const { language } = props;
  const isArray = Array.isArray(language);
  const menuId = useId();
  return (
    <Flex>
      {isArray ? (
        <MenuButton
          button={<ActivateSpellcheckButton {...props} />}
          id={menuId}
          menu={
            <Menu>
              {language.map((lang) => (
                <MenuItem
                  key={lang.code}
                  text={lang.title}
                  onClick={() => props.onLanguageSelected(lang)}
                />
              ))}
            </Menu>
          }
          placement="bottom"
          popover={{ portal: true, constrainSize: true }}
        />
      ) : (
        <ActivateSpellcheckButton {...props} />
      )}
    </Flex>
  );
});

const ActivateSpellcheckButton = forwardRef(function ActivateSpellcheckButton(
  { loading, language, onLanguageSelected, ...props }: SpellcheckButtonProps,
  ref: Ref<any>
) {
  const isArray = Array.isArray(language);
  const hasLanguage = Array.isArray(language) ? language.length > 0 : !!language;
  const disabled = !hasLanguage || loading;
  const spellcheckButtonText = useDisplayText('spellcheckButtonText');
  return (
    <Button
      ref={ref}
      mode={'ghost'}
      type="button"
      disabled={disabled}
      onClick={isArray ? undefined : () => language && onLanguageSelected(language)}
      text={spellcheckButtonText}
      icon={
        loading ? (
          <Flex align="center" justify="center">
            <Spinner size={3} muted style={{ marginBottom: '-1.25em' }} />
          </Flex>
        ) : undefined
      }
      {...props}
    />
  );
});
