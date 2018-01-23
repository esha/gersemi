import * as Posterior from 'posterior';
import { GenesisClient } from '../src/genesis-base';
import * as WSDL from '../src/WSDL';

// Until server is CORS-friendly, use a proxy
// const genesisUrl = 'http://eshademo.cloudapp.net';
const genesisUrl = 'http://localhost:8008';
const genesis = new GenesisClient(genesisUrl);

// Util functions
function expectFunction(fn: any) {
  expect(fn).toBeTruthy();
  expect(fn).toBeInstanceOf(Function);
}
function expectPromise(promise: any) {
  expect(promise).toBeTruthy();
  expectFunction(promise.then);
  // no, not testing any more of the promise spec than necessary
}
function expectPosterior(requester: any) {
  expectFunction(requester);
  expect(requester.cfg).toBeInstanceOf(Object);
  expectFunction(requester.config);
  expectFunction(requester.extend);
}
function expectWSDL(wsdl: any) {
  expect(wsdl).toBeInstanceOf(WSDL.default);
  expect(wsdl.document).toBeInstanceOf(Document);
  expect(wsdl.node).not.toBe(null);
}

test('multiple client creation, structure, and default cfg', () => {
  // create 2nd client to ensure minimal coexistence support
  const client = new GenesisClient(genesisUrl);
  expect(client).toBeTruthy();

  expectPosterior(client.Base);
  expectPosterior(client.Service);
  expectPosterior(client.Service.Query);
  expectPosterior(client.Service.Edit);

  expect(client.Service.Query.cfg).toBeTruthy();
  expect(client.Service.Query.cfg._parent).toBeTruthy();
  expect(client.Service.Query.cfg._parent).toBe(client.Service.cfg);

  expect(client.Base.url).toBe(genesisUrl);
  expect(client.Base.method).toBe('POST');
  expect(client.Base.json).toBe(false);
  expect(client.Base.headers).toMatchObject({ 'Content-Type': 'text/xml' });
});

test('query wsdl', async () => {
  const queryUrl = genesis.Service.Query.config('url');
  expect(queryUrl).toBe(genesisUrl+'/query.wsdl');
  const wsdlPromise = genesis.Service.Query();
  expectPromise(wsdlPromise);
  const result = await wsdlPromise.catch((e) => null);
  expectWSDL(result);
});

test('edit wsdl', async () => {
  const editUrl = genesis.Service.Edit.config('url');
  expect(editUrl).toBe(genesisUrl + '/edit.wsdl');
  const wsdlPromise = genesis.Service.Edit();
  expectPromise(wsdlPromise);
  const result = await wsdlPromise.catch((e) => null);
  expectWSDL(result);
});
