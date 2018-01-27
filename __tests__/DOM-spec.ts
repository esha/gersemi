import * as DOM from '../src/DOM';

test('Parser.dom', () => {
  expect(DOM.Parser.dom('<foo></foo>')).toBeInstanceOf(DOM.Wrapper);
});

test('Parser.doc', () => {
  expect(DOM.Parser.doc('<foo></foo>')).toBeInstanceOf(Document);
});
