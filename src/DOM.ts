export class Parser {
  public static doc(xml: string): Document {
    return Parser.parser.parseFromString(xml, 'text/xml');
  }
  public static dom(xml: string): Wrapper {
    return new Wrapper(Parser.doc(xml));
  }
  private static parser = new DOMParser();
}

export class Wrapper {
  public document: Document;
  private nodeMap: { [name: string]: Wrapper[] } = {};
  private attrMap: { [name: string]: string } | null = null;

  constructor(public node: ParentNode, public parent?: Wrapper) {
    if (node instanceof Document) {
      this.document = node;
      if (node.children.length === 1) {
        this.node = node.children[0];
      }
    } else {
      // if this isn't a Document, adopt the parents or fake being one itself
      this.document = parent ? parent.document : Parser.doc(this.xml);
    }
    const kids = this.node.children;
    for (const kid of this.node.children as any) {
      const name = kid.id || kid.getAttribute('name') || kid.nodeName;
      if (name) {
        this.map(name, kid);
      }
    }
  }

  public query(selector: string): NodeList | Wrapper | undefined {
    if (this.node instanceof Element) {
      const nodes = this.node.querySelectorAll(selector);
      return nodes.length === 1 ? new Wrapper(nodes[0]) : nodes;
    } else {
      return undefined;
    }
  }

  public attr(name: string): string | null {
    return this.node instanceof Element ? this.node.getAttribute(name) : null;
  }

  public get targetNamespace(): string | null {
    let tns = this.attr('targetNamespace');
    if (!tns && this.parent) {
      tns = this.parent.targetNamespace;
    }
    return tns;
  }

  public get type() {
    return (this.node as any)['nodeName'] || this.attr('type');
  }

  public get xml() {
    return (this.node as any)['outerHTML'];
  }

  public get attributes() {
    if (this.node instanceof Element && this.attrMap === null) {
      this.attrMap = {};
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
      this.nodeMap[name] = new Array<Wrapper>();
    }
    if (addme) {
      this.nodeMap[name].push(new Wrapper(addme, this));
    }
  }
}
