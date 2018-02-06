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
  public Edit: Posterior.Requester & {
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
            requestData: queryTranslator('listnutrients', url, 'PageSize'),
          },
          Allergens: {
            requestData: queryTranslator('listallergens', url, 'PageSize'),
          },
          Units: {
            requestData: queryTranslator('listunits', url, 'PageSize'),
          },
          Foods: {
            requestData: queryTranslator('listfoods', url, 'PageSize'),
          },
          ByGroup: {
            requestData: queryTranslator('searchbygroup', url, 'GroupName'),
          },
          ByModifiedDateRange: {
            requestData: queryTranslator(
              'searchbymodifieddaterange',
              url,
              undefined,
              ['typ']
            ),
          },
          ByName: {
            requestData: queryTranslator('searchbyname', url, 'FoodName'),
          },
          ById: {
            requestData: queryTranslator('getfood', url, 'FoodId'),
          },
          ByUserCode: {
            requestData: queryTranslator('getfood', url, 'UserCode'),
          },
          Analysis: {
            requestData: queryTranslator('getanalysis', url),
          },
          UserCodes: {
            requestData: queryTranslator('listfoodusercodes', url, 'PageSize'),
          },
        },
      },
      'Query'
    );
    this.Edit = this.Base.extend(
      {
        url: Edit.PATH,
        method: 'POST',
        headers: {
          'Content-Type': 'application/soap+xml',
        },
        Children: {
          NewFood: {
            requestData: editTranslator('newfood', url),
          },
          UpdateFood: {
            requestData: editTranslator('updatefood', url),
          },
        },
      },
      'Edit'
    );
  }
}

export function editTranslator(
  action: string,
  url: string,
  defaultName?: string,
  namespaces?: string[]
) {
  return translator(() => new Edit(action, url, namespaces), defaultName);
}
export function queryTranslator(
  action: string,
  url: string,
  defaultName?: string,
  namespaces?: string[]
) {
  return translator(() => new Query(action, url, namespaces), defaultName);
}
export function translator(ctor: () => Request, defaultName?: string) {
  return (data?: Params) => {
    const request = ctor();
    if (data instanceof Array) {
      if (
        data.length === 1 &&
        typeof data[0] === 'string' &&
        lookslikeXML(data[0])
      ) {
        request.setRequestBody(data[0]);
      } else if (defaultName) {
        request.param(defaultName, data.length > 1 ? data : data[0]);
      }
      data = undefined; // already set the data, thanks
    }
    return request.params(data).toString();
  };
}

function lookslikeXML(s: string) {
  s = s.trim();
  return s.charAt(0) === '<' && s.charAt(s.length - 1) === '>';
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

export abstract class Request extends SOAP.Request {
  public static BODIES: { [action: string]: string } = {
    listnutrients: 'NutrientListRequest',
    listallergens: 'AllergenListRequest',
    listunits: 'UnitListRequest',
    listfoods: 'FoodsListRequest',
    searchbygroup: 'FoodsByGroupRequest',
    searchbymodifieddaterange: 'FoodsByModifiedDateRangeRequest',
    searchbyname: 'FoodsByNameRequest',
    getfood: 'FoodMetadataRequest',
    getanalysis: 'FoodAnalysisRequest',
    listfoodusercodes: 'FoodUserCodesListRequest',
    listgroups: 'GroupListRequest',
    getconversions: 'FoodConversionsRequest',
    search: 'FoodsRequest',
    searchbyproperty: 'FoodsByPropertyRequest',
    listrecommendationprofiles: 'RecommendationProfilesListRequest',
    listauthorities: 'AuthorityListRequest',
    newfood: 'NewFoodRequest',
    updatefood: 'UpdateFoodRequest',
  };
  public request: SOAP.Element;

  constructor(
    public action: string,
    public url: string,
    namespaces?: string[]
  ) {
    super(action, url, 'gen');
    if (namespaces) {
      namespaces.forEach(ns => {
        this.ns(ns, XML.getURI(ns));
      });
    }
    this.request = new SOAP.Element('gen:' + Request.BODIES[action]);
    this.body.add(this.request);
  }

  public setRequestBody(xml: string) {
    this.request.add(xml);
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

  constructor(
    public action: string,
    public server: string,
    public namespaces?: string[]
  ) {
    super(action, server + Query.PATH, namespaces);
  }
}
class Edit extends Request {
  public static PATH = 'soap/FoodEditService.svc';

  constructor(
    public action: string,
    public server: string,
    public namespaces?: string[]
  ) {
    super(action, server + Edit.PATH, namespaces);
  }
}

// Support console REPL w/flag
if (window && document.body.hasAttribute('debug')) {
  (window as any).Client = Client;
}
