import {Injectable} from "@angular/core";
import {CanActivate, Router} from "@angular/router";
import {TraceDataService} from "./services/app.tracedataservice";
import {Observable} from "rxjs";

  @Injectable()
export class AdminGuard implements CanActivate {

  constructor(private dataService: TraceDataService, private router: Router) {}

  canActivate() {
        console.log("AdminGuard#canActivate called");
        return this.admin().map(e => {
            if (e) {
                return true;
              }

              this.router.navigate(["/error", {error_code: 403}]);
            return false;
          });
      }

  admin(): Observable<boolean> {
        return this.dataService.isUserAuthorized().map(data => {
            if (data.user.admin) {
                return true;
              }
            return false;
          });
      }

}
