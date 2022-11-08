import styled from 'styled-components';
import { Box } from '@sanity/ui';

export const SuggestContainerBox = styled(Box)`
  box-sizing: border-box;
  width: 100%;
  position: relative;

  & .coreSuggest {
    position: absolute;
    top: 40px;
    z-index: 1000;
    min-width: 200px;
    background-color: ${({ theme }) => theme.sanity.color.selectable?.primary.enabled.bg};
    color: ${({ theme }) => theme.sanity.color.selectable?.primary.enabled.fg};
    width: 100%;
  }

  & .coreSuggest ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  & .coreSuggest {
  }

  & .coreSuggest ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  & .coreSuggest ul li {
    display: block;
    width: 100%;
  }

  & .coreSuggest ul li.selected {
    background-color: ${({ theme }) => theme.sanity.color.selectable?.primary.selected.bg};
    color: ${({ theme }) => theme.sanity.color.selectable?.primary.selected.fg};
  }

  & .coreSuggest ul li button {
    display: flex;
    flex-direction: column;
    width: 100%;
    font-size: 16px;
    padding: 8px 0 10px 16px;
    background: inherit;
    text-align: left;
    border: 1px solid ${({ theme }) => theme.sanity.color.selectable?.primary.enabled.border};
    border-bottom: none;
  }

  & .coreSuggest ul li button.customRender {
    padding: 0;
  }

  & .coreSuggest ul li:last-child button {
    border-bottom: 1px solid ${({ theme }) => theme.sanity.color.selectable?.primary.enabled.border};
  }

  & .coreSuggest ul li button:hover,
  .coreSuggest ul li button:focus {
    background: ${({ theme }) => theme.sanity.color.selectable?.default.hovered.bg};
    color: ${({ theme }) => theme.sanity.color.selectable?.primary.hovered.fg};
  }

  & .coreSuggest small {
    color: #999999;
  }

  & .coreSuggest mark {
    display: inline-block;
    background: inherit;
    font-weight: bold;
    color: ${({ theme }) => theme.sanity.color.selectable?.primary.hovered.fg};
  }

  & .coreSuggest .hideMark mark {
    color: inherit;
    font-weight: inherit;
  }
`;

export const SuggestInput = styled.input`
  display: block;
  width: 100%;
  height: 40px;
  font-size: 16px;
  padding: 0 0 0 15px;
  outline: none;
  transition: border 200ms;
  border: 1px solid ${({ theme }) => theme.sanity.color.selectable?.default.enabled.border};
  box-sizing: border-box;

  &:hover,
  &:focus {
    border-color: #f26a55;
  }
`;

/*


*/
