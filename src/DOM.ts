export type JSON = boolean | number | string | null | JSONArray | JSONObject;
export interface JSONObject {
  [key: string]: JSON;
}
export interface JSONArray extends Array<JSON> {}

export class Parser {
  public static doc(xml: string): Document {
    return Parser.parser.parseFromString(xml, 'text/xml');
  }
  public static dom(xml: string): Wrap {
    return new Wrap(Parser.doc(xml).documentElement);
  }
  public static json(xml: string): JSON {
    return Parser.dom(xml).json();
  }
  private static parser = new DOMParser();
}

export class Wrap {
  public static list(elements: HTMLCollection | NodeList | Node[]): Wrap[] {
    const wrapped: Wrap[] = [];
    for (const element of elements as any) {
      if ('children' in element) {
        wrapped.push(new Wrap(element));
      }
    }
    return wrapped;
  }
  public static map(list: Wrap[]) {
    const map: { [name: string]: Wrap[] } = {};
    for (const wrap of list) {
      const name = wrap.name;
      if (!(name in map)) {
        map[name] = [];
      }
      map[name].push(wrap);
    }
    return map;
  }

  public kids: Wrap[] | null = null;
  public kidMap: { [name: string]: Wrap[] } | null = null;
  private attrs: { [name: string]: string } | null = null;

  constructor(public element: Element) {}

  public query(selector: string): Wrap | Wrap[] | undefined {
    const elements = this.element.querySelectorAll(selector);
    return elements.length === 1 ? new Wrap(elements[0]) : Wrap.list(elements);
  }

  public attr(name: string): string | null {
    return this.element.getAttribute(name);
  }

  public get attributes(): { [name: string]: string } {
    if (this.attrs === null) {
      this.attrs = {};
      const attrs = this.element.attributes;
      for (let i = 0; i < attrs.length; i++) {
        const attr = attrs.item(i);
        this.attrs[attr.name] = attr.value;
      }
    }
    return this.attrs;
  }

  public get children(): Wrap[] {
    if (this.kids === null) {
      this.kids = Wrap.list(this.element.children);
    }
    return this.kids;
  }

  public get childMap(): { [name: string]: Wrap[] } {
    if (this.kidMap === null) {
      this.kidMap = Wrap.map(this.children);
    }
    return this.kidMap;
  }

  public prop(name: string): any {
    const val = (this.element as any)[name];
    if (val instanceof Element) {
      return new Wrap(val);
    }
    return val;
  }

  public each(fn: (kid: Wrap) => boolean | void) {
    for (const child of this.children) {
      const ret = fn(child);
      if (ret === false) {
        break;
      }
    }
    return this;
  }

  public get targetNamespace(): string | null {
    let tns = this.attr('targetNamespace');
    if (!tns && this.parent) {
      tns = (this.parent as any)['targetNamespace'];
    }
    return tns;
  }

  public isParent() {
    return this.children.length > 0;
  }

  public get parent() {
    const parent = this.element.parentElement;
    return parent === null ? null : new Wrap(parent);
  }

  public get document() {
    return this.element.ownerDocument;
  }

  public get name() {
    return this.element.id || this.attr('name') || this.type;
  }

  public get type() {
    return this.attr('type') || this.element.nodeName;
  }

  public get text(): string {
    return this.element.textContent || '';
  }

  public get value(): JSON {
    return this.isParent() ? ToJSON.any(this) : this.parsed;
  }

  private get parsed(): JSON {
    return ToJSON.string(this.text);
  }

  public json(): JSON {
    return ToJSON.root(this);
  }
}

export class ToJSON {
  public static string(s: string): JSON {
    try {
      return JSON.parse(s);
    } catch (e) {
      return s;
    }
  }

  public static root(wrap: Wrap): JSON {
    const root: JSON = {};
    root[wrap.name] = ToJSON.any(wrap);
    return root;
  }

  public static any(wrap: Wrap): JSON {
    return wrap.isParent()
      ? ToJSON.isArrayLike(wrap)
        ? ToJSON.array(wrap.children)
        : ToJSON.object(wrap)
      : ToJSON.string(wrap.text);
  }

  public static array(list: Wrap[]): JSONArray {
    const arr: JSONArray = [];
    for (const wrap of list) {
      arr.push(ToJSON.root(wrap)); // array members should be like roots
    }
    return arr;
  }

  public static object(wrap: Wrap): JSONObject {
    const obj: JSONObject = {};
    for (const name in wrap.childMap) {
      const wraps = wrap.childMap[name];
      obj[name] = wraps.length > 1 ? ToJSON.array(wraps) : ToJSON.any(wraps[0]);
    }
    return obj;
  }

  private static isArrayLike(wrap: Wrap): boolean {
    return (
      (wrap.children.length > 1 && Object.keys(wrap.childMap).length === 1) ||
      (wrap.children.length <= 1 && wrap.name.endsWith('s'))
    );
  }
}
