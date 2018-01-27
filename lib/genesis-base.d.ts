import * as Posterior from 'posterior';
import * as SOAP from './SOAP';
import * as XML from './XML';
export declare type Config = Posterior.InputConfig & {
    fetchWSDLs?: boolean;
};
export declare class Client {
    url: string;
    cfg: Config | undefined;
    Base: Posterior.Requester;
    WSDL: Posterior.Requester & {
        [Sub: string]: Posterior.Requester;
    };
    Endpoints: Posterior.Requester & {
        [Sub: string]: Posterior.Requester;
    };
    config: Config;
    constructor(url: string, cfg?: Config | undefined);
    private listRequester(action, url);
}
export declare abstract class Request extends SOAP.Request {
    action: string;
    url: string;
    static BODIES: {
        [action: string]: string;
    };
    constructor(action: string, url: string);
    param(name: string, value?: XML.Element | string | boolean | number): this;
    params(params?: {
        [name: string]: XML.Element | string | boolean | number | undefined;
    }): this;
}
export declare class Query extends Request {
    action: string;
    server: string;
    static PATH: string;
    constructor(action: string, server: string);
}
export declare class SOAPEdit extends Request {
    action: string;
    server: string;
    static PATH: string;
    constructor(action: string, server: string);
}
