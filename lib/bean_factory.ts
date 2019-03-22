
export type BeanTarget = {
  file?: string;
  clz?: Function;
  ins?: object;
  clzAnnos?: any;
  methodAnnos?: any;
  fieldAnnos?: any;
}

export default class BeanFactory {

  private static container = {}

  private static currentSourceFile: string;

  public static setCurrentSourceFile (sf: string): void {
    BeanFactory.currentSourceFile = sf;
  }

  public static getCurrentSourceFile (): string {
    return BeanFactory.currentSourceFile;
  }

  public static addBean (key: string, target: BeanTarget): void {
    if (!key) {
      return
    }
    key = key.toLowerCase()
    const target0 = BeanFactory.container[key] || {}
    for (let k in target) {
      target0[k] = target[k]
    }
    BeanFactory.container[key] = target0
    if (target0.clz) {
      const clz: any = target0.clz;
      target0.ins = new clz();
    }
  }

  public static getBean (key: string) {
    if (!key) {
      return null
    }
    const target = BeanFactory.container[key.toLowerCase()]
    if (!target || !target.ins) {
      return null
    }
    return target.ins
  }
}