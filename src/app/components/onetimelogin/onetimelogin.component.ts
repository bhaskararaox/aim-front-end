import {Component, OnInit, ViewEncapsulation, Output, EventEmitter} from '@angular/core';
import {TraceDataService} from "../../services/app.tracedataservice";
import {OneTimeLoginUser} from "../../models/app.onetimeloginuser";
import {Router} from "@angular/router";
import {MessageService} from "../../services/app.messageservice";

@Component({
  selector: 'app-onetimelogin',
  templateUrl: './onetimelogin.component.html',
  styleUrls: ['./onetimelogin.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class OnetimeloginComponent implements OnInit {
  @Output() updateFirstLogin = new EventEmitter();
  private dataService: TraceDataService;
  private router: Router;
  public showModal = false;
  public username: string = "";
  public password: string = "";
  public receiveEmails: string = "false";
  private messageService: MessageService;
  public theUser: OneTimeLoginUser;
  public submitBotton: boolean = true;
  public acceptBox: boolean = false;
  public signMeBox: boolean = false;
  public userAuthenticationFail: boolean = false;

  constructor(dataService: TraceDataService, messageService: MessageService, router: Router) {
    this.router = router;
    this.dataService = dataService;
    this.messageService = messageService;
    this.theUser = new OneTimeLoginUser();
  }

  ngOnInit() {
    this.hideSpinner();
  }

  showPrivacyNotice(state: boolean) {
    this.showModal = state;
  }

  changeAcceptBox(state: boolean) {
    this.acceptBox = state;
  }

  changeSignMeBox(state: boolean) {
    this.signMeBox = state;
  }

  acceptTerms() {
    this.acceptBox = true;
    this.showModal = false;
    this.submitBotton = false;
  }

  loginAction() {
    this.theUser.userName = this.username;
    this.theUser.password = this.password;
    this.dataService.getUserAuthenticated(this.theUser).subscribe(result => {
      if (result) {
        this.userAuthenticationFail = false;
        if (this.signMeBox) {
          this.receiveEmails = "true";
        }
        this.dataService.insertFirstTimeLogin(this.receiveEmails).subscribe();
        this.updateFirstLogin.emit(false);

        this.router.navigate(['/home']);
      } else {
        this.userAuthenticationFail = true;
      }
    });
  }

  private showSpinner() {
    this.messageService.showSpinner();
  }

  private hideSpinner() {
    this.messageService.hideSpinner();
  }
}
