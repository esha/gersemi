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
    constructor(url, cfg) {
        this.url = url;
        this.cfg = cfg;
        if (!cfg) {
            cfg = {};
        }
        cfg.url = url;
        cfg.json = false;
        this.config = cfg;
        this.Base = Posterior(cfg, 'Client');
        this.WSDL = this.Base.extend({
            headers: { 'Content-Type': 'text/xml' },
            singleton: true,
            then: (xml) => new WSDL.Definitions(xml),
            Children: {
                Query: {
                    auto: cfg.fetchWSDLs,
                    url: 'query.wsdl',
                },
                Edit: {
                    auto: cfg.fetchWSDLs,
                    url: 'edit.wsdl',
                },
            },
        }, 'WSDL');
        this.Endpoints = this.Base.extend({
            method: 'POST',
            headers: {
                'Content-Type': 'application/soap+xml',
            },
            then: (res) => DOM.Parser.dom(res),
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
            },
        }, 'Endpoints');
    }
    listRequester(action, url) {
        return (data) => {
            return new Query(action, url)
                .params(typeof data === 'number' ? { StartIndex: data } : data)
                .toString();
        };
    }
}
export class Request extends SOAP.Request {
    constructor(action, url) {
        super(action, url, 'gen');
        this.action = action;
        this.url = url;
        this.body.add(new SOAP.Element('gen:' + Request.BODIES[action]));
    }
    param(name, value) {
        if (value !== null && value !== undefined) {
            this.body.add(new SOAP.Element('gen:' + name).add(value));
        }
        return this;
    }
    params(params) {
        if (params) {
            for (const name in params) {
                this.param(name, params[name]);
            }
        }
        return this;
    }
}
Request.BODIES = {
    listnutrients: 'NutrientListRequest',
    listallergens: 'AllergenListRequest',
    listunits: 'UnitListRequest',
};
export class Query extends Request {
    constructor(action, server) {
        super(action, server + Query.PATH);
        this.action = action;
        this.server = server;
    }
}
Query.PATH = 'soap/FoodQueryService.svc';
export class SOAPEdit extends Request {
    constructor(action, server) {
        super(action, server + SOAPEdit.PATH);
        this.action = action;
        this.server = server;
    }
}
SOAPEdit.PATH = 'soap/FoodEditService.svc';
if (window && document.body.hasAttribute('debug')) {
    window.Client = Client;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXNpcy1iYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2dlbmVzaXMtYmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQUssU0FBUyxNQUFNLFdBQVcsQ0FBQztBQUN2QyxPQUFPLEtBQUssR0FBRyxNQUFNLE9BQU8sQ0FBQztBQUM3QixPQUFPLEtBQUssSUFBSSxNQUFNLFFBQVEsQ0FBQztBQUMvQixPQUFPLEtBQUssSUFBSSxNQUFNLFFBQVEsQ0FBQztBQUMvQixPQUFPLEtBQUssR0FBRyxNQUFNLE9BQU8sQ0FBQztBQUU3QixHQUFHLENBQUMsT0FBTyxDQUFDO0lBQ1YsR0FBRyxFQUFFLG9DQUFvQztJQUN6QyxJQUFJLEVBQUUsOEJBQThCO0lBQ3BDLEdBQUcsRUFBRSwrQkFBK0I7Q0FDckMsQ0FBQyxDQUFDO0FBS0gsTUFBTTtJQVVKLFlBQW1CLEdBQVcsRUFBUyxHQUFZO1FBQWhDLFFBQUcsR0FBSCxHQUFHLENBQVE7UUFBUyxRQUFHLEdBQUgsR0FBRyxDQUFTO1FBQ2pELEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNULEdBQUcsR0FBRyxFQUFFLENBQUM7UUFDWCxDQUFDO1FBQ0QsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZCxHQUFHLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQztRQUNqQixJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztRQUNsQixJQUFJLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFckMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FDMUI7WUFDRSxPQUFPLEVBQUUsRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFO1lBQ3ZDLFNBQVMsRUFBRSxJQUFJO1lBQ2YsSUFBSSxFQUFFLENBQUMsR0FBUSxFQUFFLEVBQUUsQ0FBQyxJQUFJ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