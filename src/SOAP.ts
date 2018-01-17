import * as XML from './XML';

XML.setURIs({
  soap: 'http://www.w3.org/2003/05/soap-envelope',
  gen: 'http://ns.esha.com/2013/genesisapi',
  exlx: 'http://ns.esha.com/2013/exlx',
  typ: 'http://ns.esha.com/2013/types',
  wsa: 'http://www.w3.org/2005/08/addressing',
});

export class Element extends XML.Element {
  constructor(name: string, ...namespaces: string[]) {
    super(name.indexOf(':') < 0 ? 'soap:' + name : name);

    for (const namespace in namespaces) {
      this.ns(namespace, XML.getURI(namespace));
    }
  }
}

export class ActionHeader extends Element {
  public actionElement: XML.Element;

  constructor(public action: string) {
    super('Header', 'wsa');

    this.actionElement = new XML.Element('wsa:Action');
    this.add(this.actionElement);
    this.actionElement.add(action);
  }
}
export class Request extends Element {
  public header: Element;
  public body: Element;

  constructor(public action: string, ...namespaces: string[]) {
    super('Envelope', ...namespaces);
    this.header = new ActionHeader(action);
    this.body = new Element('Body');
    this.add(this.header);
    this.add(this.body);
  }
}
