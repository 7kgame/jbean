import { Autowired, Bean } from '../lib'

@Bean
export default class UserService {
  public getName (): string {
    return 'i am user'
  }
}