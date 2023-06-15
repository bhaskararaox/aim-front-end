import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {MessageService} from "../../services/app.messageservice";

@Component({
  selector: 'app-error-page',
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.css']
})
export class ErrorPageComponent implements OnInit {

  public error_code: number;

  constructor(private route: ActivatedRoute, private messageService: MessageService) { }

  ngOnInit() {
    this.messageService.removeSpinner();
    this.error_code = 500;
    if (this.route.params) {
      this.route.params.subscribe( params => {
        if (params['error_code']) {
          this.error_code = params['error_code'];
        }
      });
    }
  }

}
