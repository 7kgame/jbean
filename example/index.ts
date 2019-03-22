import { Autowired, ComponentScan, JBootApplication } from '../lib'
import UserService from './user_service'
import Test from './test/test'

@ComponentScan
@JBootApplication
export default class App {

  @Autowired
  private userService: UserService;

  @Autowired()
  private static prop;

  public func () {
    console.log(this.userService.getName())
    console.log(App.prop)
    const test = new Test()
    console.log(test.func1())
  }

  public static main () {
    console.log('app start')
    let app = new App()
    app.func()
  }

}