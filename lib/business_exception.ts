
export default class BusinessException {
  public err: any
  public data: any
  constructor(err: any, data?: any) {
    this.err = err
    this.data = data
  }
}