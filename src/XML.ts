// Yes, a mutable global. Deal with it.
// While ns abbreviations are per xml document in reality,
// in practice we want them to be globally consistent.
const namespaceMap: { [abbr: string]: string } = {
  xsd: 'http://www.w3.org/2001/XMLSchema',
};
export function getURI(abbr: string) {
  return namespaceMap[abbr];
}
export function setURI(abbr: string, uri: string) {
  namespaceMap[abbr] = uri;
}
export function setURIs(uris: { [abbr: string]: string }) {
  for (const abbr in uris) {
    setURI(abbr, uris[abbr]);
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

export interface AttributeMap {
  [name: string]: string;
}

export class Element extends Node {
  public children: Array<Element | string> = [];
  public attributes: Attribute[] = [];

  constructor(public name: string, attrs: AttributeMap = {}) {
    super(name);
    for (const key in attrs) {
      // tslint:disable-line
      this.attr(key, attrs[key]);
    }
  }

  public attr(name: string, value: string) {
    this.attributes.push(new Attribute(name, value));
    return this;
  }

  public ns(name: string, uri: string) {
    return this.attr('xmlns:' + name, uri);
  }

  public add(...children: Array<Element | string>) {
    for (const child in children) {
      this.children.push(child);
    }
    return this;
  }

  public toString() {
    const name = this.name;
    let xml = '<' + name;
    for (const attr in this.attributes) {
      xml = ' ' + attr;
    }
    xml += '>';
    for (const child in this.children) {
      xml += '\n  ' + child;
    }
    xml += '</' + name + '>';
    return xml;
  }
}

export class Attribute extends Node {
  constructor(public name: string, public value: string) {
    super(name);
  }

  public toString() {
    return this.name + '="' + this.value + '"';
  }
}
