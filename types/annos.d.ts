export function Bean (component?: Function | string)

export function Autowired (name?: Function | string | any, options?: any)

export function ComponentScan (options?: string | object | Function, ext?: string)
export function registerScanner (scanner: Function): void

export function JBootApplication (target?: any, options?: any)
export function registerConfigParser (key: string, parser: Function): void
export function getApplicationConfigs (): object

export function Repository (name?: Function | string)
export function Service (name?: Function | string)
export function Type(type: string)
