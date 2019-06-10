export function Bean (component?: Function | string)

export function Entity (name?: Function | string | TableNameSeperatorType)

export enum TableNameSeperatorType {
  underline
}

export type TransactionalOptions = {
  ignore?: boolean
}

export const CTOR_JWEB_FILE_KEY = '$__jweb__file'
export const CTOR_JWEB_PACKAGE_KEY = '$__jweb__package'

export function Autowired (name?: Function | string | any, options?: any)
export function Id (name?: any, options?: any)

export function ComponentScan (options?: string | object | Function, ext?: string)
export function registerScanner (scanner: Function): void

export function JBootApplication (target?: any, options?: any)
export function registerConfigParser (key: string, parser: Function): void
export function getApplicationConfigs (): object

export function Repository (name?: Function | string)
export function Service (name?: Function | string)
export function Type(type: string)

export function Transactional (transactionalOptions?: TransactionalOptions | Function | Object, method?: any)
export function getTransactionalMeta (target: Function | object, method?: string): TransactionalOptions | null 
export function checkSupportTransition (target: Function | object, method?: string): boolean
export function registerBegin (cb: Function): void
export function registerCommit (cb: Function): void
export function registerRollback (cb: Function): void
export function emitBegin (requestId: number): Promise<void>
export function emitCommit (requestId: number): Promise<void>
export function emitRollback (requestId: number): Promise<void>
