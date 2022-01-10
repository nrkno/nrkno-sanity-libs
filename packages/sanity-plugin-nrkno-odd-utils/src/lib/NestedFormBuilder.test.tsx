/**
 * @jest-environment jsdom
 */
import React, { Component } from 'react';
import { StringSchemaType } from '@sanity/types';
import { NestedFormBuilder } from './NestedFormBuilder';
import { render } from '@testing-library/react';
import { useUnsetOption } from './hooks';

describe('NestedFormBuilder', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should invoke FormBuilderRender.resolveInputComponent and use the result in render', () => {
    render(<NestedFormBuilder {...mockSanityProps()} />);
    expect(getFormBuilderCalls()).toHaveLength(1);
  });

  it('should not invoke onFocus during mount', () => {
    render(<NestedFormBuilder {...mockSanityProps()} />);
    const propInteractions = getFormBuilderCalls()[0][0];
    expect(propInteractions.onFocus).not.toHaveBeenCalled();
  });

  it('should use modified type', () => {
    const type = createMockType({ custom: true });
    const props = mockSanityProps({ type });

    function CustomComponent(props: any) {
      const type = useUnsetOption(props.type, 'custom');
      return <NestedFormBuilder {...props} type={type} />;
    }

    render(<CustomComponent {...props} />);
    const propInteractions = getFormBuilderCalls()[0][0];
    expect(propInteractions.type).toEqual({
      ...props.type,
      options: {
        custom: undefined,
      },
    });
  });
});

function createMockType(options?: any): StringSchemaType {
  return {
    jsonType: 'string',
    name: 'dummy-string-type',
    options,
  };
}

function mockSanityProps(overrides?: any) {
  return {
    value: undefined,
    type: createMockType(),
    onChange: jest.fn(),
    onBlur: jest.fn(),
    onFocus: jest.fn(),
    readOnly: false,
    focusPath: [],
    path: ['items'],
    markers: [],
    level: 0,
    ...overrides,
  };
}

// Workaround to mock FormBuilderInput (parts are tricky to mock)

const MockFormBuilderInput = jest.fn().mockReturnValue(null);
export function getFormBuilderCalls() {
  return MockFormBuilderInput.mock.calls;
}
export function mockFormBuilderInput() {
  return class MockFormBuilder extends Component<any> {
    componentDidMount() {
      // not exactly what happens, but close enough
      this.props.onFocus([]);
    }

    UNSAFE_componentWillReceiveProps() {
      this.props.onFocus([]);
    }

    componentDidUpdate() {
      this.props.onFocus([]);
    }

    resolveInputComponent() {
      return MockFormBuilderInput;
    }
  };
}

jest.mock('@sanity/form-builder/lib/FormBuilderInput', () => ({
  FormBuilderInput: mockFormBuilderInput(),
}));
