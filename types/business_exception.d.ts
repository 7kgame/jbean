export class BusinessException {
  public err: any
  public code: any
  public data: any

  constructor(err: any, code?: any, data?: any)
}