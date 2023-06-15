import { Injectable }     from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {TraceDataService} from "./services/app.tracedataservice";
import {Observable} from "rxjs";

@Injectable()
export class LoginGuard implements CanActivate {

  constructor(private dataService : TraceDataService, private router: Router){}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    console.log('LoginGuard#canActivate called');
    let url: string = state.url; //original URL
    return this.loggedin().map(e => {
      if(!e){
        return true;
      }
      this.router.navigate(['/login']);
      return false;
    });
  }

  loggedin(): Observable<boolean> {
    return this.dataService.hasUserLoggedIn().map(data =>{
      if(data.firstTimeLogin){
        return true;
      }
      return false;
    });
  }

}
