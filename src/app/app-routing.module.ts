import { NgModule } from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {ErrorPageComponent} from "./components/error-page/error-page.component";
import {PageNotFoundComponent} from "./components/page-not-found/page-not-found.component";
import {HomeComponent} from "./components/home/home.component";
import {HelpComponent} from "./components/help/help.component";
import {AuthGuard} from "./auth-guard.service";
import {LoginGuard} from "./login-guard.service";
import {AdminGuard} from "./admin-guard.service";
import {OnetimeloginComponent} from "./components/onetimelogin/onetimelogin.component";
import {EdpDashboardComponent} from "./components/edp-dashboard/edp-dashboard.component";
import {ReportComponent} from "./components/report/report.component";
import {TraceSummaryComponent} from "./components/TracingSummaryReport/tracesummary.component";

const routes: Routes = [
  {
    path: "home",
    component: HomeComponent,
    canActivate: [AuthGuard, LoginGuard]
  },
  {
    path: "",
    redirectTo: "/home",
    pathMatch: "full"
  },
  {
    path: "login",
    component: OnetimeloginComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "error",
    component: ErrorPageComponent
  },
  {
    path: "404",
    component: PageNotFoundComponent
  },
  {
    path: "faq",
    component: HelpComponent,
    canActivate: [AuthGuard, LoginGuard]
  },
  {
    path: "edpdashboard",
    component: EdpDashboardComponent,
    canActivate: [AuthGuard, LoginGuard]
  },
  {
    path: "report",
    component: ReportComponent,
    canActivate: [AuthGuard, LoginGuard, AdminGuard]
  },

  {
    path: "tracesummary",
    component: TraceSummaryComponent,
    canActivate: [AuthGuard, LoginGuard]
  },
  {
    path: "**",
    redirectTo: "/404"
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {useHash: true})
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {
}
