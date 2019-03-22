import { Autowired, ComponentScan, JBootApplication } from '../../lib'
import UserService from '../user_service'

export default class Test1 {

  @Autowired
  private userService: UserService;

  public func1 (): string {
    console.log('this is test1.func')
    return this.userService.getName();
  }
}