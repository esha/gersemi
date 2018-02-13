import * as SOAP from '../src/SOAP';
import * as XML from '../src/XML';

test('basic element to string', () => {
  const node = new SOAP.Element('foo');
  expect(node.toString()).toBe('<soap:foo></soap:foo>');
});

test('basic element w/xmlns to string', () => {
  const node = new SOAP.Element('foo', 'soap');
  expect(node.toString()).toBe(
    '<soap:foo xmlns:soap="http://www.w3.org/2003/05/soap-envelope"></soap:foo>'
  );
});

test('namespace element', () => {
  const node = new SOAP.Element('gen:NutrientListRequest');
  expect(node.toString()).toBe(
    '<gen:NutrientListRequest></gen:NutrientListRequest>'
  );
});

test('header', () => {
  const node = new SOAP.Header(
    'http://ns.esha.com/2013/genesisapi/listnutrients',
    'http://localhost:8888/api/soap/FoodEditService.svc'
  );
  expect(node.toString()).toBe(
    '<soap:Header xmlns:wsa="http://www.w3.org/2005/08/addressing">' +
      '<wsa:Action>http://ns.esha.com/2013/genesisapi/listnutrients</wsa:Action>' +
      '<wsa:To>http://genesis.esha.com/soap/FoodEditService.svc</wsa:To>' +
      '</soap:Header>'
  );
});

test('header shortcut', () => {
  const node = new SOAP.Header(
    'listnutrients',
    'http://esha/soap/FoodEditService.svc'
  );
  expect(node.toString()).toBe(
    '<soap:Header xmlns:wsa="http://www.w3.org/2005/08/addressing">' +
      '<wsa:Action>http://ns.esha.com/2013/genesisapi/listnutrients</wsa:Action>' +
      '<wsa:To>http://esha/soap/FoodEditService.svc</wsa:To>' +
      '</soap:Header>'
  );
});

test('genesis request', () => {
  const node = new SOAP.Request(
    'listnutrients',
    'http://esha/soap/FoodQueryService.svc',
    'gen'
  );
  expect(node.toString()).toBe(
    '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:gen="http://ns.esha.com/2013/genesisapi">' +
      '<soap:Header xmlns:wsa="http://www.w3.org/2005/08/addressing">' +
      '<wsa:Action>http://ns.esha.com/2013/genesisapi/listnutrients</wsa:Action>' +
      '<wsa:To>http://esha/soap/FoodQueryService.svc</wsa:To>' +
      '</soap:Header>' +
      '<soap:Body></soap:Body>' +
      '</soap:Envelope>'
  );
});
