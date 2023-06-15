export class User {
  public admin: boolean;
  public authorized: boolean;
  public name: string;

  constructor(admin: boolean = false, authorized: boolean = false, name: string = "") {
    this.admin = admin;
    this.authorized = authorized;
    this.name = name;
  }

  public isAdmin(): boolean {
    return this.admin;
  }

  public isAuthorized(): boolean {
    return this.authorized;
  }

}
