import { Autowired, Bean } from '../lib'

@Bean
export default class UserService {

  private name: string = 'jack'

  public postInit() {
    console.log('user service post init', this.name)
  }

  public getName (): string {
    return 'I\'m ' + this.name
  }
}