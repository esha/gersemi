import * as XML from './XML';

export class Element extends XML.Element {
  constructor(name: string, ...namespaces: string[]) {
    super(name.indexOf(':') < 0 ? 'soap:' + name : name);

    for (const namespace of namespaces) {
      this.ns(namespace, XML.getURI(namespace));
    }
  }
}

export class Header extends Element {
  public actionElement: XML.Element;

  constructor(public action: string, public to: string) {
    super('Header', 'wsa');

    this.actionElement = new XML.Element('wsa:Action');
    this.add(this.actionElement);
    if (this.action.indexOf('http') !== 0) {
      this.action = XML.getURI(action);
    }
    this.actionElement.add(this.action);
    // service appears to tolerate any host to wsa:To element,
    // but not any path (like a path for proxy redirect).
    // so we should replace any localhost artifacts,
    // whether from proxy use or WSDL generation artifacts
    // TODO: proper use proper url parser to ensure path starts w/ '/soap'
    to = to.replace(/localhost:[0-9]+(\/api|\/proxy)?/, 'genesis.esha.com');
    this.add(new XML.Element('wsa:To').add(to));
  }
}
export class Request extends Element {
  public header: Element;
  public body: Element;

  constructor(
    public action: string,
    public to: string,
    ...namespaces: string[]
  ) {
    super('Envelope', 'soap', ...namespaces);
    this.header = new Header(action, to);
    this.body = new Element('Body');
    this.add(this.header);
    this.add(this.body);
  }
}
