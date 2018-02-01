import * as DOM from './DOM';
import * as SOAP from './SOAP';
import * as XML from './XML';

export class Definitions extends DOM.Wrap {
  public namespaces: { [abbr: string]: string } = {};

  constructor(public source: string) {
    super(DOM.Parser.doc(source).documentElement);

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
    const elements = this.document.querySelectorAll('operation[name]');
    const ops: { [name: string]: Operation } = {};
    for (const element of elements as any) {
      const op = new Operation(element);
      ops[op.name] = op;
      if (op.name) {
        (this as any)[op.name] = op;
      }
    }
    return ops;
  }

  get messages() {
    const elements = this.document.querySelectorAll('message');
    const msgs: { [name: string]: Message } = {};
    for (const element of elements as any) {
      const msg = new Message(element);
      msgs[msg.name] = msg;
      (this as any)[msg.name] = msg;
    }
    return msgs;
  }
}

export class Operation extends DOM.Wrap {
  public name: string;
  constructor(public element: Element) {
    super(element);
    this.name = this.attr('name') || '';
  }

  get input(): Element | null {
    return this.element.querySelector('input');
  }
  get output(): Element | null {
    return this.element.querySelector('output');
  }
}

export class Message extends DOM.Wrap {
  public name: string;
  constructor(public element: Element) {
    super(element);
    this.name = this.attr('name') || '';
  }
}

export class Type extends DOM.Wrap {
  public name: string;

  constructor(element: Element) {
    super(element);

    const nameAttr = this.attr('name');
    if (nameAttr === null) {
      throw new Error('Type elements must have a name');
    }
    this.name = nameAttr;
  }
}
