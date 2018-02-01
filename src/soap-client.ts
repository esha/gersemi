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
  public Endpoints: Posterior.Requester & {
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

    this.Endpoints = this.Base.extend(
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/soap+xml',
        },
        then: (res: string) => DOM.Parser.dom(res),
        Children: {
          Nutrients: {
            url: Query.PATH,
            requestData: this.listRequester('listnutrients', url),
          },
          Allergens: {
            url: Query.PATH,
            requestData: this.listRequester('listallergens', url),
          },
          Units: {
            url: Query.PATH,
            requestData: this.listRequester('listunits', url),
          },
          Foods: {
            url: Query.PATH,
            requestData: this.listRequester('listfoods', url),
          },
        },
      },
      'Endpoints'
    );
  }

  private listRequester(action: string, url: string) {
    return (data?: number | { StartIndex?: number; PageSize?: number }) => {
      return new Query(action, url)
        .params(typeof data === 'number' ? { StartIndex: data } : data)
        .toString();
    };
  }
}

abstract class Request extends SOAP.Request {
  public static BODIES: { [action: string]: string } = {
    listnutrients: 'NutrientListRequest',
    listallergens: 'AllergenListRequest',
    listunits: 'UnitListRequest',
    listfoods: 'FoodsListRequest',
  };

  constructor(public action: string, public url: string) {
    super(action, url, 'gen');
    this.body.add(new SOAP.Element('gen:' + Request.BODIES[action]));
  }

  public param(name: string, value?: XML.Element | string | boolean | number) {
    if (value !== null && value !== undefined) {
      this.body.add(new SOAP.Element('gen:' + name).add(value));
    }
    return this;
  }
  public params(params?: {
    [name: string]: XML.Element | string | boolean | number | undefined;
  }) {
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
