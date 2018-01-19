import * as Posterior from 'posterior';
import * as store from 'store2';
import WSDL from './WSDL';

export type GenesisConfig = Posterior.InputConfig & {
  rest: boolean
};
export class GenesisClient {
  public Base: Posterior.Requester;
  public Service: Posterior.Requester;
  public cfg: GenesisConfig;

  constructor(config?: { [key: string]: any }) {
    // start with any stored defaults
    this.cfg = store.get('Genesis.config', {});

    // copy over any manual config
    if (config) {
      for (const key in config) {
        // tslinst:disable-line
        (this.cfg as any)[key] = config[key];
      }
    }

    // fill in some smart defaults (no overridding!!)
    this.configure('url', 'http://eshademo.cloudapp.net', false);
    this.configure('method', this.cfg.rest ? 'GET' : 'POST', false);
    this.configure('json', this.cfg.rest, false);
    this.configure(
      'headers',
      this.cfg.rest ? {} : {
        'Content-Type': 'text/xml',
      },
      false
    );

    // create the APIs
    this.Base = Posterior(this.cfg);
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
    if (override === true || !(key in this.cfg)) {
      (this.cfg as any)[key] = value;
    }
  }
}

// Support console REPL w/flag
if (window && document.body.hasAttribute('debug')) {
  (window as any).GenesisClient = GenesisClient;
  (window as any).store = store;
}
