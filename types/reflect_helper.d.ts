export class ReflectHelper {
  public static getMethods (ctor: Function, checkBeforeAfterCaller?: boolean): string[]
  public static getParentMethods (ctor: Function, checkBeforeAfterCaller?: boolean): string[] | null
  public static methodExist (ctor: Function, method: string, loopCnt?: number, checkBeforeAfterCaller?: boolean): boolean

  public static resetMethod (ctor: Function, method: string, classAnnos?: any[], methodsAnnos?: any[]): void
  public static resetClass (ctor: Function): void

}