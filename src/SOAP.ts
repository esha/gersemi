import * as XML from './XML';

export class Element extends XML.Element {
  constructor(name: string, ...namespaces: string[]) {
    super(name.indexOf(':') < 0 ? 'soap:' + name : name);

    for (const namespace of namespaces) {
      this.ns(namespace, XML.getURI(namespace));
    }
  }
}

const host = window.location.host || 'localhost(:[0-9]+)?';
const rootRE = new RegExp(host + '(\\/api|\\/proxy)?');

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
    // so we will replace host and proxy artifacts both
    // for sanitization and aesthetics
    to = to.replace(rootRE, 'genesis.esha.com');
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
