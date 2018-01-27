import * as index from '../src/index';

test('Should have Client available', () => {
  expect(index.Client).toBeTruthy();
});

test('Should have DOM available', () => {
  expect(index.DOM).toBeTruthy();
});
test('Should have XML available', () => {
  expect(index.XML).toBeTruthy();
});
test('Should have SOAP available', () => {
  expect(index.SOAP).toBeTruthy();
});
test('Should have WSDL available', () => {
  expect(index.WSDL).toBeTruthy();
});
