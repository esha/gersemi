import Posterior from 'posterior';
import store from 'store2';
import * as xml2js from 'xml2js';

const defaultConfig = { soap: true, mock: false };
const config = store.get('demo.config', defaultConfig);
const GenesisService = Posterior({
  url: config.mock
    ? 'http://localhost:8000'
    : 'http://eshademo.cloudapp.net/soap/FoodQueryService.svc',
  json: !config.soap,
  headers: config.soap
    ? {
        'Content-Type': 'text/xml',
      }
    : {},
});

// Support console REPL w/flag
if (window && document.body.hasAttribute('debug')) {
  (window as any).GenesisService = GenesisService;
  (window as any).store = store;
  (window as any).xml2js = xml2js;
}

export default GenesisService;
