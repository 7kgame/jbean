import { Autowired, JBootApplication } from '../lib'
import UserService from './user_service'
import Test from './test/test'

@JBootApplication
export default class App {

  @Autowired
  private userService: UserService;

  @Autowired
  private static prop;

  public func () {
    console.log(this.userService.getName())
    console.log(App.prop)
    const test = new Test()
    console.log(test.func1())
  }

  public static main (configs) {
    console.log('app start')
    console.log(configs)
    let app = new App()
    app.func()
  }

}