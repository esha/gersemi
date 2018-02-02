import * as Posterior from 'posterior';
import * as DOM from './DOM';
import * as SOAP from './SOAP';
import * as WSDL from './WSDL';
import * as XML from './XML';

XML.setURIs({
  gen: 'http://ns.esha.com/2013/genesisapi',
  exlx: 'http://ns.esha.com/2013/exlx',
  typ: 'http://ns.esha.com/2013/types',
});

export class Client {
  public Base: Posterior.Requester;
  public WSDL: Posterior.Requester & {
    [Sub: string]: Posterior.Requester;
  };
  public Query: Posterior.Requester & {
    [Sub: string]: Posterior.Requester;
  };
  public config: Posterior.InputConfig;

  constructor(public url: string, cfg: Posterior.InputConfig = {}) {
    cfg.url = url;
    cfg.json = false;
    this.config = cfg;
    this.Base = Posterior(cfg, 'Client');

    this.WSDL = this.Base.extend(
      {
        headers: { 'Content-Type': 'text/xml' },
        singleton: true,
        then: (xml: any) => new WSDL.Definitions(xml),
        Children: {
          Query: {
            url: 'query.wsdl',
          },
          Edit: {
            url: 'edit.wsdl',
          },
        },
      },
      'WSDL'
    );

    this.Query = this.Base.extend(
      {
        url: Query.PATH,
        method: 'POST',
        headers: {
          'Content-Type': 'application/soap+xml',
        },
        then: (res: string) => DOM.Parser.dom(res),
        Children: {
          Nutrients: {
            requestData: this.queryTranslator('listnutrients', url, 'PageSize'),
          },
          Allergens: {
            requestData: this.queryTranslator('listallergens', url, 'PageSize'),
          },
          Units: {
            requestData: this.queryTranslator('listunits', url, 'PageSize'),
          },
          Foods: {
            requestData: this.queryTranslator('listfoods', url, 'PageSize'),
          },
          ByGroup: {
            requestData: this.queryTranslator(
              'searchbygroup',
              url,
              'GroupName'
            ),
          },
          ByModifiedDateRange: {
            requestData: this.queryTranslator('searchbymodifieddaterange', url),
          },
          ByName: {
            requestData: this.queryTranslator('searchbyname', url, 'FoodName'),
          },
        },
      },
      'Query'
    );
  }

  private queryTranslator(action: string, url: string, defaultName?: string) {
    return (data?: Params) => {
      if (defaultName && data instanceof Array) {
        const value = data;
        data = {};
        data[defaultName] = value.length > 1 ? value : value[0];
      }
      return new Query(action, url).params(data).toString();
    };
  }
}

export type ParamValue =
  | XML.Element
  | DOM.JSONObject
  | string
  | number
  | boolean;
export interface Params {
  [name: string]: ParamValue;
}

abstract class Request extends SOAP.Request {
  public static BODIES: { [action: string]: string } = {
    listnutrients: 'NutrientListRequest',
    listallergens: 'AllergenListRequest',
    listunits: 'UnitListRequest',
    listfoods: 'FoodsListRequest',
    searchbygroup: 'FoodsByGroupRequest',
    searchbymodifieddaterange: 'FoodsByModifiedDateRangeRequest',
    searchbyname: 'FoodsByNameRequest',
  };
  public request: SOAP.Element;

  constructor(public action: string, public url: string) {
    super(action, url, 'gen');
    this.request = new SOAP.Element('gen:' + Request.BODIES[action]);
    this.body.add(this.request);
  }

  public param(name: string, value?: ParamValue) {
    if (value !== null && value !== undefined) {
      const paramElement = new SOAP.Element('gen:' + name);
      if (value instanceof XML.Element || typeof value === 'string') {
        paramElement.add(value);
      } else if (typeof value === 'object') {
        XML.fromJSON(value, paramElement, 'gen:');
      } else {
        paramElement.add(JSON.stringify(value));
      }
      this.request.add(paramElement);
    }
    return this;
  }
  public params(params?: Params) {
    if (params) {
      for (const name in params) {
        this.param(name, params[name]);
      }
    }
    return this;
  }
}
class Query extends Request {
  public static PATH = 'soap/FoodQueryService.svc';

  constructor(public action: string, public server: string) {
    super(action, server + Query.PATH);
  }
}
class Edit extends Request {
  public static PATH = 'soap/FoodEditService.svc';

  constructor(public action: string, public server: string) {
    super(action, server + Edit.PATH);
  }
}

// Support console REPL w/flag
if (window && document.body.hasAttribute('debug')) {
  (window as any).Client = Client;
}
