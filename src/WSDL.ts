import * as DOM from './DOM';
import * as SOAP from './SOAP';
import * as XML from './XML';

export class Definitions extends DOM.Wrapper {
  public name: string;
  public namespaces: { [abbr: string]: string } = {};

  constructor(public source: string) {
    super(DOM.Parser.doc(source));

    this.name = this.attr('name') || 'rootDocument';
    this.namespaces = this.readNamespaces();
    XML.setURIs(this.namespaces);
  }

  public get targetNamespace(): string {
    return this.document.attributes.getNamedItem('targetNamespace').value;
  }

  private readNamespaces(): { [abbr: string]: string } {
    const attrs: { [name: string]: string } = this.attributes || {};
    const spaces: { [abbr: string]: string } = {};
    for (const name in attrs) {
      if (name.indexOf('xmlns:') >= 0) {
        spaces[name.substring(6)] = attrs[name];
      }
    }
    return spaces;
  }

  public get operations() {
    const nodes = this.document.querySelectorAll('operation[name]');
    const ops: { [name: string]: Operation } = {};
    for (const node of nodes as any) {
      const op = new Operation(node);
      ops[op.name] = op;
      if (op.name) {
        (this as any)[op.name] = op;
      }
    }
    return ops;
  }

  get messages() {
    const nodes = this.document.querySelectorAll('message');
    const msgs: { [name: string]: Message } = {};
    for (const node of nodes as any) {
      const msg = new Message(node);
      msgs[msg.name] = msg;
      (this as any)[msg.name] = msg;
    }
    return msgs;
  }
}

export class Operation extends DOM.Wrapper {
  public name: string;
  constructor(public node: Element) {
    super(node);
    this.name = this.attr('name') || '';
  }

  get input(): Element | null {
    return this.node.querySelector('input');
  }
  get output(): Element | null {
    return this.node.querySelector('output');
  }
}

export class Message extends DOM.Wrapper {
  public name: string;
  constructor(public node: Element) {
    super(node);
    this.name = this.attr('name') || '';
  }
}

export class Type extends DOM.Wrapper {
  public name: string;

  constructor(node: Element, parent?: DOM.Wrapper) {
    super(node, parent);

    const nameAttr = this.attr('name');
    if (nameAttr === null) {
      throw new Error('Type elements must have a name');
    }
    this.name = nameAttr;
  }
}
