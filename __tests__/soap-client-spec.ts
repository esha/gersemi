import * as Posterior from 'posterior';
import * as DOM from '../src/DOM';
import { Client } from '../src/soap-client';
import * as WSDL from '../src/WSDL';

// Until server is CORS-friendly, use the proxy
// const genesisUrl = 'http://esha-sandbox.westus.cloudapp.azure.com/';
const genesisUrl = 'http://localhost:8008/';
const genesis = new Client(genesisUrl);

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
  expect(wsdl).not.toBe(null);
  expect(wsdl).toBeInstanceOf(WSDL.Definitions);
  expect(wsdl.node).not.toBe(null);
}

test('multiple client creation, structure, and default cfg', () => {
  // create 2nd client to ensure minimal coexistence support
  const client = new Client(genesisUrl);
  expect(client).toBeTruthy();

  expectPosterior(client.Base);
  expect(client.Base.url).toBe(genesisUrl);
  expect(client.Base.json).toBe(false);

  expectPosterior(client.WSDL);
  expectPosterior(client.WSDL.Edit);

  expectPosterior(client.WSDL.Query);
  expect(client.WSDL.Query.cfg).toBeTruthy();
  expect(client.WSDL.Query.cfg._parent).toBeTruthy();
  expect(client.WSDL.Query.cfg._parent).toBe(client.WSDL.cfg);

  expectPosterior(client.Query);
  expect(client.Query.method).toBe('POST');
  expect(client.Query.headers).toMatchObject({
    'Content-Type': 'application/soap+xml',
  });
});

test('query wsdl', async () => {
  const queryUrl = genesis.WSDL.Query.config('url');
  expect(queryUrl).toBe(genesisUrl + 'query.wsdl');
  const wsdlPromise = genesis.WSDL.Query();
  expectPromise(wsdlPromise);
  const result = await wsdlPromise.catch(e => null);
  expectWSDL(result);
});

test('edit wsdl', async () => {
  const editUrl = genesis.WSDL.Edit.config('url');
  expect(editUrl).toBe(genesisUrl + 'edit.wsdl');
  const wsdlPromise = genesis.WSDL.Edit();
  expectPromise(wsdlPromise);
  const result = await wsdlPromise.catch(e => null);
  expectWSDL(result);
});

async function expectListPromise(listPromise) {
  expectPromise(listPromise);
  const doc = await listPromise.catch(e => {
    return null;
  });
  expect(doc).not.toBe(null);
  expect(doc).toBeInstanceOf(DOM.Wrap);
  const status: DOM.Wrap = doc.query('StatusCode');
  expect(status).toBeInstanceOf(DOM.Wrap);
  expect(status.text).toBe('200');
  return doc;
}

test('Allergens query', async () => {
  const doc = await expectListPromise(genesis.Query.Allergens());
});
test('Nutrients query', async () => {
  const pageSize = 5;
  const doc = await expectListPromise(genesis.Query.Nutrients(pageSize));
  const nutrientList = doc.query('Nutrient');
  expect(nutrientList.length).toBe(pageSize);
});
test('Units query', async () => {
  const doc = await expectListPromise(genesis.Query.Units());
  const unitList = doc.query('Unit');
  expect(unitList.length).toBeGreaterThan(1);

  const response = doc.query('UnitListResponse');
  expect(response).not.toBe(null);
  const value = response.value;
  const units = value.Units;
  expect(units).not.toBe(null);
  expect(units).toBeInstanceOf(Array);
  expect(units.length).toBe(unitList.length);
});
test('Food list query', async () => {
  const doc = await expectListPromise(
    genesis.Query.Foods({
      PageSize: 2,
      FilterByFoodTypes: {
        FoodType: 'Recipe',
      },
    })
  );
  const list = doc.query('Recipe');
  expect(list.length).toBe(2);
});
test('foods by group query', async () => {
  const doc = await expectListPromise(genesis.Query.ByGroup('My Recipes'));
  const mine = doc.query('Recipe');
  expect(mine.length).toBeGreaterThan(0);
});
test('foods by name', async () => {
  const doc = await expectListPromise(genesis.Query.ByName('Cha'));
  const matches = doc.query('Recipe');
  expect(matches.length).toBeGreaterThan(0);
});

/*test('foods by modified date range', async () => {
  const doc = await expectListPromise(
    genesis.Query.ByModifiedDateRange({
      Start: {
        'typ:DateTime': '2016-01-01T00:00:00',
        'typ:UtcOffsetInMinutes': -420,
      },
      End: {
        'typ:DateTime': '2016-12-31T23:59:59',
        'typ:UtcOffsetInMinutes': -420,
      },
    })
  );
  const mine = doc.query('Recipe');
  expect(mine.length).toBe(1);
});*/
