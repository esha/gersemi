import * as index from '../src/index';

test('Should have GenesisClient available', () => {
  expect(index.GenesisClient).toBeTruthy();
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
