export class UserService {
  private users: {name: string, surname: string, email: string, password: string}[] =
    [{name: 'Tilen', surname: 'Venko', email: 'venkotilen@gmail.com', password: 'geslo1234'}];

  addUser(name: string, surname: string, email: string, password: string) {
    const user = <any>{};
    user.name = name;
    user.surname = surname;
    user.email = email;
    user.password = password;
    this.users.push(user);
  }

  getUsers() {
    return this.users;
  }

  getUserByEmail(email: string) {
    for (const user of this.users) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }
}
