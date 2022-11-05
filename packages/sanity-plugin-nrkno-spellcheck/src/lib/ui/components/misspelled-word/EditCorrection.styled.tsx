import styled from 'styled-components';

export const SuggestContainerDiv = styled.div`
  box-sizing: border-box;
  width: 100%;
  position: relative;
`;

export const SuggestInput = styled.input`
  display: block;
  width: 100%;
  height: 40px;
  font-size: 16px;
  padding: 0 0 0 15px;
  outline: none;
  transition: border 200ms;
  border: 1px solid #e0e0e0;
  box-sizing: border-box;

  &:hover,
  &:focus {
    border-color: #f26a55;
  }
`;

/*

.coreSuggest {
  position: absolute;
  top: 40px;
  z-index: 1000;
  min-width: 200px;
  background-color: white;
  width: 100%;
}

.coreSuggest ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.coreSuggest ul li {
  display: block;
  width: 100%;
}

.coreSuggest ul li.selected {
  background-color: #eeeeee;
}

.coreSuggest ul li button {
  display: flex;
  flex-direction: column;
  width: 100%;
  font-size: 16px;
  padding: 8px 0 10px 16px;
  background: inherit;
  text-align: left;
  border: 1px solid #e0e0e0;
  border-bottom: none;
}

.coreSuggest ul li button.customRender {
  padding: 0;
}

.coreSuggest ul li:last-child button {
  border-bottom: 1px solid #e0e0e0;
}

.coreSuggest ul li button:hover,
.coreSuggest ul li button:focus {
  background: #eef0fd;
}
.coreSuggest small {
  color: #999999;
}
.coreSuggest mark {
  display: inline-block;
  background: inherit;
  font-weight: bold;
}
.coreSuggest .hideMark mark {
  color: inherit;
  font-weight: inherit;
}
*/
