import {ErrorHandler, Injectable, Injector} from "@angular/core";
import {Router} from "@angular/router";

import {BAD_REQUEST, FORBIDDEN, INTERNAL_SERVER_ERROR, SERVICE_UNAVAILABLE, UNAUTHORIZED} from "http-status-codes";
import {ResponseType} from "@angular/http";

@Injectable()
export class GlobalErrorHandlerService implements ErrorHandler {

  constructor(private injector: Injector){}

  public handleError(error: any) {
    let router = this.injector.get(Router);
    if (error.hasOwnProperty('status')) {
      let httpErrorCode = error.status;
      switch (httpErrorCode) {
        case UNAUTHORIZED:
          router.navigate(['/error', {error_code: 401}]);
          break;
        case FORBIDDEN:
          router.navigate(['/login']);
          break;
        case BAD_REQUEST:
          //TODO: show toastr message
          router.navigate(['/error', {error_code: 400}]);
          break;
        case INTERNAL_SERVER_ERROR:
          router.navigate(['/error', {error_code: 500}]);
          break;
        case SERVICE_UNAVAILABLE:
          //show error page
          router.navigate(['/error', {error_code: 503}]);
          break;
        default:
          //log error
          console.error(">>> Got this error and don't know what to do...: " + error.toString());
      }
    }
    else{
      console.error(">>> Global error handler: " + error);
    }
  }

}
