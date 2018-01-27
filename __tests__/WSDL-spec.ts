import * as DOM from '../src/DOM';
import * as WSDL from '../src/WSDL';

const minSrc =
  '<wsdl:definitions xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/">' +
  '</wsdl:definitions>';

test('create a Definitions', () => {
  expect(new WSDL.Definitions(minSrc)).toBeInstanceOf(DOM.Wrapper);
});
