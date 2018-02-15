import * as Posterior from 'posterior';
import * as DOM from '../src/DOM';
import { Client } from '../src/soap-client';
import * as WSDL from '../src/WSDL';

// Until server is CORS-friendly, use the proxy
// const genesisUrl = 'http://esha-sandbox.westus.cloudapp.azure.com/';
const genesisUrl = 'http://localhost:8008/';
const Genesis = new Client(genesisUrl, { debug: 'capture' });

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
async function expectPromisedResult(promise, expectations?: () => void) {
  expectPromise(promise);
  let error = null;
  const promiseResult = await promise.catch(e => {
    error = e;
    return error;
  });
  if (expectations) {
    expectations();
  }
  expect(promiseResult).not.toBe(error);
  return promiseResult;
}
async function expectOk(promise, expectations?: () => void) {
  const doc = await expectPromisedResult(promise, expectations);
  expect(doc).toBeInstanceOf(DOM.Wrap);
  const status: DOM.Wrap = doc.query('StatusCode');
  expect(status).toBeInstanceOf(DOM.Wrap);
  expect(status.text).toBe('200');
  return doc;
}
async function expectCall(
  fn: Posterior.Requester,
  param?: any,
  expectations?: { [prop: string]: any }
) {
  const doc = await expectOk(fn(param), () => {
    const captured = fn.capture;
    expect(captured).not.toBe(null);
    for (const prop in expectations) {
      const expected = expectations[prop];
      if (typeof expected === 'function') {
        expected(captured[prop]);
      } else {
        expect(captured[prop]).toBe(expected);
      }
    }
  });
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

test('custom debug data caches', async () => {
  const doc = await expectPromise(Genesis.WSDL.Query());
  const fn = Genesis.WSDL.Query;
  expect(fn.capture).toBeInstanceOf(Object);
  expect(fn.capture.status).toBe(200);
  expect(fn.capture.state).toBe('success');
});

test('Allergens query', async () => {
  const doc = await expectOk(Genesis.Query.Allergens());
});
test('Nutrients query', async () => {
  const pageSize = 5;
  const doc = await expectOk(Genesis.Query.Nutrients(pageSize));
  const nutrientList = doc.query('Nutrient');
  expect(nutrientList.length).toBe(pageSize);
});
test('Units query', async () => {
  const doc = await expectOk(Genesis.Query.Units());
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
  const doc = await expectOk(
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
  const doc = await expectOk(Genesis.Query.ByGroup('My Recipes'));
  const mine = doc.query('Recipe');
  expect(mine.length).toBeGreaterThan(0);
});
test('foods by name', async () => {
  const doc = await expectOk(Genesis.Query.ByName('Cha'));
  const matches = doc.query('Recipe');
  expect(matches.length).toBeGreaterThan(0);
});
test('foods by modified date range', async () => {
  const doc = await expectOk(
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
  const doc = await expectOk(Genesis.Query.ById(id));
  const recipe = doc.query('Recipe');
  expect(recipe).not.toBe(null);
  expect(recipe).toBeInstanceOf(DOM.Wrap);
  const name = doc.query('Recipe Name Value');
  expect(name).not.toBe(null);
  expect(name.value).toBe('Aniseed Syrup');
});
test('food by user code', async () => {
  const doc = await expectOk(Genesis.Query.ByUserCode(15));
  const recipe = doc.query('Recipe');
  expect(recipe).not.toBe(null);
  expect(recipe).toBeInstanceOf(DOM.Wrap);
  const name = doc.query('Recipe Name Value');
  expect(name).not.toBe(null);
  expect(name.value).toBe('Genen Shouyu');
});

test('analysis', async () => {
  jest.setTimeout(10000);
  const doc = await expectOk(
    Genesis.Query.Analysis(
      `<gen:Quantity Type="Double">1</gen:Quantity>
      <gen:UnitId>a7df0af5-001f-0000-7484-751e8eaf05c6</gen:UnitId>
      <gen:FoodId>798422bd-c422-1f6c-1358-ba860e2e8d71</gen:FoodId>`
    )
  );

  // TODO: test response content
});

test('user code list', async () => {
  const doc = await expectOk(Genesis.Query.UserCodes(5));
  // TODO: test response content
});

/*test('new food - create food from odr', async () => {
  const doc = await expectOk(
    Genesis.Edit.NewFood(
      `<Foods>
		<Ingredient xmlns:q1="http://ns.esha.com/2013/exlx">
			<q1:Name>
				<Value xml:lang="en-US" xmlns="http://ns.esha.com/2013/types">Oil Juniper Berries N.F.</Value>
			</q1:Name>
			<q1:DefiningAmount>
				<q1:Quantity Type="Double">100</q1:Quantity>
				<q1:UnitId>a7df0af5-0008-0000-7484-751e8eaf05c6</q1:UnitId>
			</q1:DefiningAmount>
			<q1:Brand>
				<q1:Supplier>Ajina Foods - Salt Lake City Hq</q1:Supplier>
				<q1:Product>Tracegains</q1:Product>
			</q1:Brand>
			<q1:PropertyValues>
				<id xmlns="http://tracegains.com/">00U-OIOJB</id>
				<supplierId xmlns="http://tracegains.com/">000003</supplierId>
			</q1:PropertyValues>
			<q1:NutrientProfileId>36dfdb03-05f4-423d-8c62-7d0279f30a59</q1:NutrientProfileId>
		</Ingredient>
	</Foods>
	<NutrientProfiles>
		<NutrientProfile>
			<Id xmlns="http://ns.esha.com/2013/exlx">36dfdb03-05f4-423d-8c62-7d0279f30a59</Id>
			<Conversions xmlns="http://ns.esha.com/2013/exlx"/>
			<DefiningAmount xmlns="http://ns.esha.com/2013/exlx">
				<Quantity Type="Double">100</Quantity>
				<UnitId>a7df0af5-0008-0000-7484-751e8eaf05c6</UnitId>
			</DefiningAmount>
			<NutrientIdVector xmlns="http://ns.esha.com/2013/exlx">
				<Item xmlns="">
					<Key>84a8709a-0000-0000-ebf9-90cea7d9d44f</Key>
					<Value Type="Double">12</Value>
				</Item>
				<Item xmlns="">
					<Key>84a8709a-0016-0000-ebf9-90cea7d9d44f</Key>
					<Value Type="Double">20</Value>
				</Item>
				<Item xmlns="">
					<Key>84a8709a-0011-0000-ebf9-90cea7d9d44f</Key>
					<Value Type="Double">5</Value>
				</Item>
				<Item xmlns="">
					<Key>84a8709a-003c-0000-ebf9-90cea7d9d44f</Key>
					<Value Type="Double">0</Value>
				</Item>
				<Item xmlns="">
					<Key>84a8709a-0012-0000-ebf9-90cea7d9d44f</Key>
					<Value Type="Double">10</Value>
				</Item>
				<Item xmlns="">
					<Key>84a8709a-0015-0000-ebf9-90cea7d9d44f</Key>
					<Value Type="Double">5</Value>
				</Item>
			</NutrientIdVector>
		</NutrientProfile>
	</NutrientProfiles>`
    )
  );
  // TODO: test response content
});// */

test('update food - set property values to null', async () => {
  const doc = await expectCall(
    Genesis.Edit.UpdateFood,
    {
      Foods: {
        Ingredient: {
          'exlx:Id': '798422bd-95b0-002e-1358-ba860e2e8d71',
          'exlx:PropertyValues':
            '<id xsi:nil="true" xmlns="http://tracegains.com/" xmlns:xsi="xsi"/>' +
            '<supplierId xsi:nil="true" xmlns="http://tracegains.com/" xmlns:xsi="xsi"/>',
        },
      },
    },
    {
      requestBody: body => {
        expect(body).toContain(
          '<exlx:Id>798422bd-95b0-002e-1358-ba860e2e8d71</exlx:Id><exlx:PropertyValues><id xsi:nil='
        );
      },
    }
  );
  // TODO: test response content
});
