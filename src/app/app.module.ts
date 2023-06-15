import { BrowserModule } from "@angular/platform-browser";
import {ErrorHandler, NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { HttpModule } from "@angular/http";
import { AppComponent } from "./app.component";
import { AlertModule } from "ngx-bootstrap";
import { PaginatorModule } from "primeng/primeng";
import {TabViewModule} from "primeng/primeng";
import {CommonModule} from "@angular/common";
import { ChartsModule } from "ng2-charts";
import { HeaderComponent } from "./components/header/header.component";
import { SearchBoxComponent } from "./components/searchbox/searchbox.component";
import { SearchFilterPipe } from "./components/searchbox/searchfilerpipe";
import { PythonApiExporter } from "./components/pythonapiexporter/pythonapiexporter.component";
import { DataGridComponent } from "./components/datagrid/datagrid.component";
import { TraceDataService } from "./services/app.tracedataservice";
import { MessageService } from "./services/app.messageservice";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { ComponentDialogComponent } from "./components/componentdialog/componentdialog.component";
import { ModalModule } from "angular2-modal";
import { BootstrapModalModule } from "angular2-modal/plugins/bootstrap";
import { DetailsDialogComponent } from "./components/detailsdialog/detailsdialog.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { OnetimeloginComponent } from "./components/onetimelogin/onetimelogin.component";
import { DropdownModule, GrowlModule, ConfirmDialogModule, MultiSelectModule, PanelModule, AutoCompleteModule,
  ContextMenuModule, DataTableModule, DialogModule, TreeTableModule, SelectButtonModule,
  AccordionModule, BlockUIModule} from "primeng/primeng";
import { QueryBuilderModule} from "angular2-query-builder";
import {ClipboardModule} from "ngx-clipboard";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { GooglePieChartService } from "./services/google-pie-chart.service";
import { GoogleScatterChartService } from "./services/google-scatter-chart.service";
import { GoogleLineChartService } from "./services/google-line-chart.service";
import { ChartsComponent } from "./components/dashboard/charts/charts.component";
import { EdpsamplechartComponent } from "./components/edpsamplechart/edpsamplechart.component";
import { GooglechartsComponent } from "./components/edpsamplechart/googlecharts/googlecharts.component";
import { AppRoutingModule } from "./app-routing.module";
import { ErrorPageComponent } from "./components/error-page/error-page.component";
import { PageNotFoundComponent } from "./components/page-not-found/page-not-found.component";
import { GlobalErrorHandlerService } from "./error-handler.service";
import { HomeComponent } from "./components/home/home.component";
import { HelpComponent } from "./components/help/help.component";
import {AuthGuard} from "./auth-guard.service";
import {LoginGuard} from "./login-guard.service";
import {AdminGuard} from "./admin-guard.service";
import {RouteReuseStrategy} from "@angular/router";
import {CustomReuseStrategy} from "./reuse-strategy";
import { EdpDashboardComponent } from "./components/edp-dashboard/edp-dashboard.component";
import { EdpMetricsTableComponent } from "./components/edp-metrics-table/edp-metrics-table.component";
import { ReportComponent } from "./components/report/report.component";
import { TraceSummaryComponent } from "./components/TracingSummaryReport/tracesummary.component";
import { EdpCustomChartsComponent } from "./components/edp-custom-charts/edp-custom-charts.component";
import { FeedbackFormComponent } from "./components/feedback-form/feedback-form.component";
import { LcatChartDialogComponent } from "./components/lcatchartdialog/lcatchartdialog.component";
import {IsaExtensionDialogComponent} from "./components/isaextensiondialog/isaextensiondialog.component";

@NgModule({
  declarations: [
    ChartsComponent,
    AppComponent,
    HeaderComponent,
    SearchBoxComponent,
    SearchFilterPipe,
    PythonApiExporter,
    DataGridComponent,
    DashboardComponent,
    DetailsDialogComponent,
    OnetimeloginComponent,
    ComponentDialogComponent,
    GooglechartsComponent,
    ErrorPageComponent,
    PageNotFoundComponent,
    HomeComponent,
    ReportComponent,
    TraceSummaryComponent,
    HelpComponent,
    EdpCustomChartsComponent,
    EdpDashboardComponent,
    EdpMetricsTableComponent,
    EdpsamplechartComponent,
    FeedbackFormComponent,
    LcatChartDialogComponent,
    IsaExtensionDialogComponent
  ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        CommonModule,
        DataTableModule,
        ContextMenuModule,
        PaginatorModule,
        ChartsModule,
        AutoCompleteModule,
        ModalModule.forRoot(),
        BootstrapModalModule,
        AlertModule.forRoot(),
        BrowserAnimationsModule,
        DialogModule,
        QueryBuilderModule,
        ClipboardModule,
        BsDropdownModule.forRoot(),
        TreeTableModule,
        PanelModule,
        TabViewModule,
        MultiSelectModule,
        ConfirmDialogModule,
        GrowlModule,
        BlockUIModule,
        DropdownModule,
        SelectButtonModule,
        AccordionModule,
        AppRoutingModule,
        ReactiveFormsModule
    ],
  entryComponents: [DetailsDialogComponent, ComponentDialogComponent, FeedbackFormComponent, LcatChartDialogComponent,
    IsaExtensionDialogComponent],
  providers: [TraceDataService, MessageService, GooglePieChartService,
    GoogleScatterChartService, GoogleLineChartService,
    { provide: ErrorHandler, useClass: GlobalErrorHandlerService }, AuthGuard, LoginGuard, AdminGuard,
    {provide: RouteReuseStrategy, useClass: CustomReuseStrategy}],
  bootstrap: [AppComponent]
})
export class AppModule { }

