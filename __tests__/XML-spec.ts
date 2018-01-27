import * as XML from '../src/XML';

test('namespaceMap defaults', () => {
  expect(XML.getURI('xsd')).toBe('http://www.w3.org/2001/XMLSchema');
  expect(XML.getURI('soap')).toBe('http://www.w3.org/2003/05/soap-envelope');
  expect(XML.getURI('wsa')).toBe('http://www.w3.org/2005/08/addressing');
});

test('getAbbr', () => {
  expect(XML.getAbbr('http://www.w3.org/2001/XMLSchema')).toBe('xsd');
});

test('getURI unmapped', () => {
  expect(XML.getURI('foobar')).toBe(
    'http://ns.esha.com/2013/genesisapi/foobar'
  );
});

test('setURI', () => {
  const uri = 'http://ns.esha.com';
  XML.setURI('esha', uri);
  expect(XML.getURI('esha')).toBe(uri);
});

test('setURIs', () => {
  const gen = XML.getURI('gen');
  const uris = {
    gen: 'http://ns.esha.com/genesis',
    ger: 'http://ns.esha.com/gersemi',
  };
  XML.setURIs(uris);
  // should only override ones not already defined
  expect(XML.getURI('gen')).toBe(gen);
  expect(XML.getURI('ger')).toBe(uris.ger);
});

test('basic element to string', () => {
  const node = new XML.Element('foo');
  expect(node.toString()).toBe('<foo></foo>');
});

test('element w/attrs to string', () => {
  const node = new XML.Element('foo', { bar: true });
  expect(node.toString()).toBe('<foo bar="true"></foo>');
});

test('element w/attrs and body to string', () => {
  const node = new XML.Element('foo', { bar: true }).add('hello world');
  expect(node.toString()).toBe('<foo bar="true">hello world</foo>');
});

test('nested element', () => {
  const node = new XML.Element('foo', { bar: true }).add(
    new XML.Element('fig').add('wig')
  );
  expect(node.toString()).toBe('<foo bar="true"><fig>wig</fig></foo>');
  expect(node.toNiceString()).toBe(
    '<foo bar="true">\n  <fig>wig</fig>\n</foo>'
  );
});

test('mixed kids', () => {
  const node = new XML.Element('foo', { bar: true })
    .add(new XML.Element('fig').add('wig'))
    .add('woogie');
  expect(node.toString()).toBe('<foo bar="true"><fig>wig</fig>woogie</foo>');
  expect(node.toNiceString()).toBe(
    '<foo bar="true">\n  <fig>wig</fig>\n  woogie\n</foo>'
  );
});
