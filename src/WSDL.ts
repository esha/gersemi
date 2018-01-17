const parser = new DOMParser();

export class NodeWrapper {
  private nodeMap: { [name: string]: NodeWrapper[] } = {};
  private attrMap: { [name: string]: string } = {};

  constructor(public node: ParentNode, public parent?: NodeWrapper) {
    const kids = node.children;
    for (const kid of node.children as any) {
      const name = kid.id || kid.getAttribute('name') || kid.nodeName;
      if (name) {
        this.map(name, kid);
      }
    }
  }

  public query(selector: string): NodeList | NodeWrapper | undefined {
    if (this.node instanceof Element) {
      const nodes = this.node.querySelectorAll(selector);
      return nodes.length === 1 ? new NodeWrapper(nodes[0]) : nodes;
    } else {
      return undefined;
    }
  }

  public attr(name: string): string | null {
    return this.node instanceof Element ? this.node.getAttribute(name) : null;
  }

  public get type() {
    return (this.node as any)['nodeName'] || this.attr('type');
  }

  public get xml() {
    return (this.node as any)['outerHTML'];
  }

  public get attributes() {
    if (this.node instanceof Element) {
      const attrs = this.node.attributes;
      for (let i = 0; i < attrs.length; i++) {
        const attr = attrs.item(i);
        this.attrMap[attr.name] = attr.value;
      }
    }
    return this.attrMap;
  }

  private map(name: string, addme: Element) {
    if (!(name in this)) {
      Object.defineProperty(this, name, {
        get: () => {
          const nodes = this.nodeMap[name];
          return nodes.length === 1 ? nodes[0] : nodes;
        },
      });
      this.nodeMap[name] = new Array<NodeWrapper>();
    }
    if (addme) {
      this.nodeMap[name].push(new NodeWrapper(addme, this));
    }
  }
}

export default class WSDL extends NodeWrapper {
  public document: Document;

  constructor(public source: string) {
    super(parser.parseFromString(source, 'text/xml'));
    this.document = this.node as Document;
  }

  get operations() {
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

export class Operation extends NodeWrapper {
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

export class Message extends NodeWrapper {
  public name: string;
  constructor(public node: Element) {
    super(node);
    this.name = this.attr('name') || '';
  }
}
