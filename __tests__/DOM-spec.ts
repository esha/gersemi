import * as DOM from '../src/DOM';

test('Parser.dom', () => {
  expect(DOM.Parser.dom('<foo></foo>')).toBeInstanceOf(DOM.Wrap);
});

test('Parser.doc', () => {
  expect(DOM.Parser.doc('<foo></foo>')).toBeInstanceOf(Document);
});

test('Wrap.list', () => {
  const dom = DOM.Parser.dom('<foo><a></a><b></b><b></b></foo>');
  const els = dom.element.querySelectorAll('*');
  const list = DOM.Wrap.list(els);
  expect(list).not.toBe(null);
  expect(list.length).toBe(3);
  expect(list[0].type).toBe('a');
  expect(list[1].type).toBe('b');
  expect(list[2].type).toBe('b');
});

test('Wrap.map', () => {
  const dom = DOM.Parser.dom('<foo><a></a><b></b><b></b></foo>');
  const els = dom.element.querySelectorAll('*');
  const list = DOM.Wrap.list(els);
  const map = DOM.Wrap.map(list);
  expect(map).not.toBe(null);
  expect(map.a).not.toBe(undefined);
  expect(map.a.length).toBe(1);
  expect(map.b).not.toBe(undefined);
  expect(map.b.length).toBe(2);
  expect(map.a[0].element).toBe(dom.element.querySelector('a'));
});

test('Wrap members', () => {
  const dom = DOM.Parser.dom('<foo bar="1"></foo>');
  expect(dom.type).toBe('foo');
  expect(dom.document).toBeInstanceOf(Document);
  expect(dom.document.children.length).toBe(1);
  expect(dom.children.length).toBe(0);
  expect(dom.document.documentElement).toBe(dom.element);
  expect(dom.attr('bar')).toBe('1');
  expect(dom.attributes).toMatchObject({
    bar: '1',
  });
});

test('isParent', () => {
  let dom = DOM.Parser.dom('<Dimension>Volume</Dimension>');
  expect(dom.isParent()).toBe(false);
  expect(dom.text).toBe('Volume');

  dom = DOM.Parser.dom('<Unit><Dimension>Volume</Dimension></Unit>');
  expect(dom.type).toBe('Unit');
  expect(dom.children.length).toBe(dom.element.children.length);
  expect(dom.isParent()).toBe(true);
});

test('Wrap.json() non-parent', () => {
  const xml = `<Value>valuable</Value>`;
  const dom = DOM.Parser.dom(xml);
  const json = dom.json();
  expect(json).toBeInstanceOf(Object);
  expect(json['Value']).toBe(dom.value);
  expect(json).toMatchObject({ Value: 'valuable' });
});

test('Wrap.json() basic parent', () => {
  const xml = `<Parent><Value>valuable</Value></Parent>`;
  const dom = DOM.Parser.dom(xml);
  const json = dom.json();
  expect(json).toBeInstanceOf(Object);
  expect(json).toMatchObject({ Parent: { Value: 'valuable' } });
});

test('Wrap.json() nested object', () => {
  const xml = `<Unit>
        <Id xmlns="http://ns.esha.com/2013/exlx">a7df0af5-0001-0000-7484-751e8eaf05c6</Id>
        <Name xmlns="http://ns.esha.com/2013/exlx">
            <Value xml:lang="en-US" xmlns="http://ns.esha.com/2013/types">Teaspoon</Value>
        </Name>
    </Unit>`;
  const dom = DOM.Parser.dom(xml);
  const json = dom.json();
  expect(json).toMatchObject({
    Unit: {
      Id: 'a7df0af5-0001-0000-7484-751e8eaf05c6',
      Name: {
        Value: 'Teaspoon',
      },
    },
  });
});

test('Wrap.json() array', () => {
  const oneItemList = DOM.Parser.dom('<Items><Item>1</Item></Items>');
  expect(oneItemList.json()).toMatchObject({ Items: [{ Item: 1 }] });

  const xml = `<Items>
        <Item>one</Item>
        <Item>two</Item>
        <Item>three</Item>
    </Items>`;
  const dom = DOM.Parser.dom(xml);
  expect('Item' in dom.childMap).toBe(true);
  expect(dom.childMap['Item'].length).toBe(3);
  const json = dom.json();
  expect(dom.name).toBe('Items');
  expect(json).toMatchObject({
    Items: [{ Item: 'one' }, { Item: 'two' }, { Item: 'three' }],
  });
});
