import Posterior from 'posterior';
import store from 'store2';
import WSDL from './WSDL';

const defaultConfig = {
  rest: false,
  url: 'http://eshademo.cloudapp.net',
};
const config = store.get('demo.config', defaultConfig);
export class GenesisClient {
  public Base: Posterior.Requester;
  public Service: Posterior.Requester;
  public config: Posterior.InputConfig;

  constructor(baseConfig: { [key: string]: any }) {
    this.config = store.get('demo.config', defaultConfig);
    if (baseConfig) {
      for (const key in baseConfig) {
        // tslinst:disable-line
        (this.config as any)[key] = baseConfig[key];
      }
    }
    this.configure('method', config.rest ? 'GET' : 'POST', false);
    this.configure('json', config.rest, false);
    this.configure(
      'headers',
      config.rest
        ? {}
        : {
            'Content-Type': 'text/xml',
          },
      false
    );
    this.Base = Posterior(this.config);

    this.Service = this.Base.extend(
      {
        method: { root: true, value: 'GET' },
        auto: true,
        singleton: true,
        then: function(xml: any) {
          const wsdl = new WSDL(xml);
          (window as any)[this._fn.cfg.name.toLowerCase()] = wsdl;
          return wsdl;
        },
        Children: {
          Query: {
            url: 'query.wsdl',
          },
          Edit: {
            url: 'edit.wsdl',
          },
        },
      },
      'Service'
    );
  }

  private configure(key: string, value: any, override: boolean = true) {
    if (override === true || !(key in this.config)) {
      (this.config as any)[key] = value;
    }
  }
}

// Support console REPL w/flag
if (window && document.body.hasAttribute('debug')) {
  (window as any).GenesisClient = GenesisClient;
  (window as any).store = store;
}
