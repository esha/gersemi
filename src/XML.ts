import * as DOM from './DOM';

// While ns abbreviations are per xml document in reality,
// in practice we want them to be globally consistent.
// for now, that means we'll put common ones here
const namespaceMap: { [abbr: string]: string } = {
  xsd: 'http://www.w3.org/2001/XMLSchema',
  soap: 'http://www.w3.org/2003/05/soap-envelope',
  wsa: 'http://www.w3.org/2005/08/addressing',
  gen: 'http://ns.esha.com/2013/genesisapi',
  exlx: 'http://ns.esha.com/2013/exlx',
  typ: 'http://ns.esha.com/2013/types',
};
export function getAbbr(uri: string) {
  for (const abbr in namespaceMap) {
    if (namespaceMap[abbr] === uri) {
      return abbr;
    }
  }
}
export function getURI(abbr: string) {
  return namespaceMap[abbr] || 'http://ns.esha.com/2013/genesisapi/' + abbr;
}
export function setURI(abbr: string, uri: string) {
  namespaceMap[abbr] = uri;
}
export function setURIs(uris: { [abbr: string]: string }) {
  for (const abbr in uris) {
    // only accept overrides via explicit, singular setURI call
    if (!(abbr in namespaceMap)) {
      setURI(abbr, uris[abbr]);
    }
  }
}

export abstract class Node {
  public namespace: string;
  public type: string;

  constructor(public name: string) {
    const colon = name.indexOf(':');
    if (colon < 0) {
      this.namespace = '';
      this.type = name;
    } else {
      this.namespace = name.substring(0, colon);
      this.type = name.substring(colon + 1);
    }
  }

  public abstract toString(): string;
}

export type content = string | number | boolean;

export interface AttributeMap {
  [name: string]: content;
}

export function fromJSON(
  json: DOM.JSONObject,
  root = new Element('root')
): Element {
  for (const name in json) {
    if (name !== '_attributes' && name !== '_value') {
      const el = new Element(name); // TODO: , json.attributes);
      root.add(el);
      let value = json[name];
      const isObject = value && typeof value === 'object';
      const attrs = isObject && value && (value as any)['_attributes'];
      if (value instanceof Array) {
        for (const val of value) {
          fromJSON(val as DOM.JSONObject, el);
        }
      } else if (isObject && !(value as any)['_value']) {
        fromJSON(value as DOM.JSONObject, el);
      } else {
        if (attrs) {
          value = (value as any)['_value'];
        }
        el.add(typeof value !== 'string' ? JSON.stringify(value) : value);
      }
      if (attrs) {
        for (const attrName in attrs) {
          el.attr(attrName, attrs[attrName]);
        }
      }
    }
  }
  return root.children.length === 1 ? root.children[0] as Element : root;
}

export class Element extends Node {
  public children: Array<Element | content> = [];
  public attributes: Attribute[] = [];

  constructor(public name: string, attrs: AttributeMap = {}) {
    super(name);
    for (const key in attrs) {
      // tslint:disable-line
      this.attr(key, attrs[key]);
    }
  }

  public attr(name: string, value: content) {
    this.attributes.push(new Attribute(name, value));
    return this;
  }

  public ns(name: string, uri: string) {
    return this.attr('xmlns:' + name, uri);
  }

  public add(...children: Array<Element | content>) {
    for (const child of children) {
      this.children.push(child);
    }
    return this;
  }

  public render(tab: string | 0) {
    const name = this.name;
    let newline = '\n';
    const pretty = tab !== 0;
    if (!pretty) {
      tab = '';
      newline = '';
    }

    let xml = tab + '<' + name;
    for (const attr of this.attributes) {
      xml += ' ' + attr.toString();
    }
    xml += '>';

    let tabbed = pretty && this.children.length > 1;
    for (const child of this.children) {
      if (pretty && child instanceof Element) {
        tabbed = true;
        xml += newline + child.render(tab + '  ');
      } else if (tabbed) {
        xml += newline + tab + '  ' + child.toString();
      } else {
        xml += child.toString();
      }
    }

    if (tabbed) {
      xml += newline + tab;
    }
    xml += '</' + name + '>';
    return xml;
  }

  public toString() {
    return this.render(0);
  }

  public toNiceString() {
    return this.render('');
  }
}

export class Attribute extends Node {
  constructor(public name: string, public value: content) {
    super(name);
  }

  public toString() {
    return this.name + '="' + this.value + '"';
  }
}
