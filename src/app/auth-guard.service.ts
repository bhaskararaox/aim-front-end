import { Injectable }     from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {TraceDataService} from "./services/app.tracedataservice";
import {Observable} from "rxjs";
import 'rxjs/add/operator/first';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private dataService : TraceDataService, private router: Router){}

  canActivate() {
    console.log('AuthGuard#canActivate called');
    return this.authorized().map(e => {
      if(e){
        return true;
      }

      this.router.navigate(['/error', {error_code: 401}]);
      return false;
    });
  }

  authorized(): Observable<boolean> {
    return this.dataService.isUserAuthorized().map(data => {
      if(data.user.authorized){
        return true;
      }
      return false;
    });
  }
}
