import * as Posterior from 'posterior';
import * as DOM from '../src/DOM';
import { Client } from '../src/soap-client';
import * as WSDL from '../src/WSDL';

// Until server is CORS-friendly, use the proxy
// const genesisUrl = 'http://esha-sandbox.westus.cloudapp.azure.com/';
const genesisUrl = 'http://localhost:8008/';
const Genesis = new Client(genesisUrl, { debug: true });

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
  expect(requester.metaCfg).toBeInstanceOf(Object);
  expectFunction(requester.config);
  expectFunction(requester.extend);
}
function expectWSDL(wsdl: any) {
  expect(wsdl).not.toBe(null);
  expect(wsdl).toBeInstanceOf(WSDL.Definitions);
  expect(wsdl.node).not.toBe(null);
}
async function expectPromisedResult(promise) {
  expectPromise(promise);
  const result = await promise.catch(e => {
    return null;
  });
  expect(result).not.toBe(null);
  return result;
}
async function expectOkResponse(promise) {
  const doc = await expectPromisedResult(promise);
  expect(doc).toBeInstanceOf(DOM.Wrap);
  const status: DOM.Wrap = doc.query('StatusCode');
  expect(status).toBeInstanceOf(DOM.Wrap);
  expect(status.text).toBe('200');
  return doc;
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
  expect(client.WSDL.Query.metaCfg).toBeTruthy();
  expect(client.WSDL.Query.metaCfg._parent).toBeTruthy();
  expect(client.WSDL.Query.metaCfg._parent).toBe(client.WSDL.metaCfg);

  expectPosterior(client.Query);
  expect(client.Query.method).toBe('POST');
  expect(client.Query.headers).toMatchObject({
    'Content-Type': 'application/soap+xml',
  });
});

test('query wsdl', async () => {
  const queryUrl = Genesis.WSDL.Query.config('url');
  expect(queryUrl).toBe(genesisUrl + 'query.wsdl');
  const wsdlPromise = Genesis.WSDL.Query();
  expectPromise(wsdlPromise);
  const result = await wsdlPromise.catch(e => null);
  expectWSDL(result);
});

test('edit wsdl', async () => {
  const editUrl = Genesis.WSDL.Edit.config('url');
  expect(editUrl).toBe(genesisUrl + 'edit.wsdl');
  const wsdlPromise = Genesis.WSDL.Edit();
  expectPromise(wsdlPromise);
  const result = await wsdlPromise.catch(e => null);
  expectWSDL(result);
});

test('Allergens query', async () => {
  const doc = await expectOkResponse(Genesis.Query.Allergens());
});
test('Nutrients query', async () => {
  const pageSize = 5;
  const doc = await expectOkResponse(Genesis.Query.Nutrients(pageSize));
  const nutrientList = doc.query('Nutrient');
  expect(nutrientList.length).toBe(pageSize);
});
test('Units query', async () => {
  const doc = await expectOkResponse(Genesis.Query.Units());
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
  const doc = await expectOkResponse(
    Genesis.Query.Foods({
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
  const doc = await expectOkResponse(Genesis.Query.ByGroup('My Recipes'));
  const mine = doc.query('Recipe');
  expect(mine.length).toBeGreaterThan(0);
});
test('foods by name', async () => {
  const doc = await expectOkResponse(Genesis.Query.ByName('Cha'));
  const matches = doc.query('Recipe');
  expect(matches.length).toBeGreaterThan(0);
});
test('foods by modified date range', async () => {
  const doc = await expectOkResponse(
    Genesis.Query.ByModifiedDateRange({
      Start: {
        'typ:DateTime': '2013-01-01T00:00:00',
        'typ:UtcOffsetInMinutes': -420,
      },
      End: {
        'typ:DateTime': '2015-12-31T23:59:59',
        'typ:UtcOffsetInMinutes': -420,
      },
    })
  );
  const mine = doc.query('Recipe');
  expect(mine.length).toBeGreaterThan(1);
});
test('food by food id', async () => {
  const id = '798422bd-c422-1f6c-1358-ba860e2e8d71';
  const doc = await expectOkResponse(Genesis.Query.ById(id));
  const recipe = doc.query('Recipe');
  expect(recipe).not.toBe(null);
  expect(recipe).toBeInstanceOf(DOM.Wrap);
  const name = doc.query('Recipe Name Value');
  expect(name).not.toBe(null);
  expect(name.value).toBe('Aniseed Syrup');
});
test('food by user code', async () => {
  const doc = await expectOkResponse(Genesis.Query.ByUserCode(15));
  const recipe = doc.query('Recipe');
  expect(recipe).not.toBe(null);
  expect(recipe).toBeInstanceOf(DOM.Wrap);
  const name = doc.query('Recipe Name Value');
  expect(name).not.toBe(null);
  expect(name.value).toBe('Genen Shouyu');
});

test('analysis', async () => {
  jest.setTimeout(10000);
  const doc = await expectOkResponse(
    Genesis.Query.Analysis(
      `<gen:Quantity Type="Double">1</gen:Quantity>
      <gen:UnitId>a7df0af5-001f-0000-7484-751e8eaf05c6</gen:UnitId>
      <gen:FoodId>798422bd-c422-1f6c-1358-ba860e2e8d71</gen:FoodId>`
    )
  );
});
