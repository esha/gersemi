import Posterior from 'posterior';
import store from 'store2';
import * as xml2js from 'xml2js';

const defaultConfig = {
  soap: true,
  baseURL: 'http://eshademo.cloudapp.net',
};
const config = store.get('demo.config', defaultConfig);
export const Genesis = Posterior({
  url: config.baseURL,
  method: config.soap ? 'POST' : 'GET',
  json: !config.soap,
  headers: config.soap
    ? {
        'Content-Type': 'text/xml',
      }
    : {},
  Children: {
    Query: {
      url: '/query',
    },
    Edit: {},
  },
});

// Support console REPL w/flag
if (window && document.body.hasAttribute('debug')) {
  (window as any).Genesis = Genesis;
  (window as any).store = store;
  (window as any).xml2js = xml2js;
}
