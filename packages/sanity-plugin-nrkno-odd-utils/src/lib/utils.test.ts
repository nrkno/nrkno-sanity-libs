import { Schema, unsetInputComponent, unsetOption } from './utils';

describe('utils', () => {
  describe('unsetOption', () => {
    it('should unset options recursively', () => {
      const type = {
        jsonType: 'string',
        name: 'custom',
        options: {
          removeMe: true,
          keepMe: true,
        },
        type: {
          jsonType: 'string',
          options: {
            removeMe: true,
            keepMe: true,
          },
        },
      };

      const modifiedType = unsetOption(type, 'removeMe');

      expect(modifiedType).toEqual({
        jsonType: 'string',
        name: 'custom',
        options: {
          removeMe: undefined,
          keepMe: true,
        },
        type: {
          jsonType: 'string',
          options: {
            removeMe: undefined,
            keepMe: true,
          },
        },
      });
    });
  });

  describe('unsetInputComponent', () => {
    it('should unset input component by type recursively', () => {
      const Component = () => {
        return null;
      };
      const type: Schema = {
        jsonType: 'string',
        name: 'custom',
        inputComponent: Component,
        type: {
          jsonType: 'string',
          inputComponent: Component,
          type: {
            jsonType: 'string',
            inputComponent: Component,
          },
        },
      };

      const modifiedType = unsetInputComponent(type);

      expect(modifiedType).toEqual({
        jsonType: 'string',
        name: 'custom',
        inputComponent: undefined,
        type: {
          jsonType: 'string',
          inputComponent: undefined,
          type: {
            jsonType: 'string',
            inputComponent: undefined,
          },
        },
      });
    });
  });
});
