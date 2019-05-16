
export default class BusinessException {

  public err: any
  public data: any
  public code: any

  constructor(err: any, code?: any, data?: any) {
    this.err = err
    this.code = code || -1
    this.data = data
  }

}