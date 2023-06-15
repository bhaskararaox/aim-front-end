import {Component, OnInit} from "@angular/core";
//import {RuleSet} from "angular2-query-builder";
import {Query} from "../searchbox/models/searchbox.query";
import {TraceAttribute} from "../../models/app.traceattribute";
import {TraceDataService} from "../../services/app.tracedataservice";
import {MessageService} from "../../services/app.messageservice";
import {forkJoin} from "rxjs/observable/forkJoin";
import {Message} from "primeng/primeng";
import {RuleSet} from "../searchbox/models/searchbox.ruleset";

@Component({
  selector: "app-report",
  templateUrl: "./report.component.html",
  styleUrls: ["./report.component.css"]
})

export class ReportComponent implements OnInit {
  public messages: Message[] = [];
  public ruleSet: RuleSet;
  public query: Query;
  public field: TraceAttribute;
  public fields: TraceAttribute[];
  public fromDate: string;
  public toDate: string;
  public showSummary: boolean;
  private dataService: TraceDataService;
  public messageService: MessageService;
  public justToday: any;
  public todayForWW: any;
  public listWW: Array<[string, string]>;
  public totalSummary: Map<string, string>;
  public usageSummary: Array<[string, number]>;
  public distributionWorkload: Array<[string, number]>;
  public distributionClassification: Array<[string, number]>;
  public distributionSegment: Array<[string, number]>;
  public usageDepartments: Array<[string, number]>;

  constructor(dataService: TraceDataService, messageService: MessageService) {
    this.dataService = dataService;
    this.messageService = messageService;
    this.totalSummary = new Map();
    this.usageSummary = [];
    this.distributionWorkload = [];
    this.distributionClassification = [];
    this.distributionSegment = [];
    this.usageDepartments = [];
    this.listWW = [];
    this.fields = [];
    this.field = new TraceAttribute("Date", "date");
    this.fields.push(this.field);
    this.showSummary = false;
    this.justToday = new Date();
    this.todayForWW = new Date();
    const currentWW: any = this.getWeekNumber();
    this.getList10WW(currentWW);
  }

  ngOnInit() {
  }

  private getWeekNumber(): any {
    const dayNum = this.todayForWW.getUTCDay() || 7;
    this.todayForWW.setUTCDate(this.todayForWW.getUTCDate() + 4 - dayNum);
    const yearStart: any = new Date(Date.UTC(this.todayForWW.getUTCFullYear(), 0, 1));
    return Math.ceil((((this.todayForWW - yearStart) / 86400000) + 1) / 7)
  }

  private getList10WW(currentWW: any) {
    const currentYear = this.todayForWW.getUTCFullYear();
    for (let i = 0; i < 10; i++) {
      if ((currentWW - i) > 0) {
        this.listWW.push(["WW" + (currentWW - i), String(currentYear)]);
      } else {
        for (let j = 0; j < 10 - i; j++) {
          this.listWW.push(["WW" + (52 - j), String(currentYear - 1)]);
        }
        break;
      }
    }
  }

  private getDatesFromWW(week: number, year: number): [Date, Date] {
    const dayTo = (1 + (week - 1) * 7); // 1st of January + 7 days for each week
    let dayFrom = dayTo - 90; // 3 months to the past
    let yearFrom = year;

    if (dayFrom < 0) {
      dayFrom = 365 + dayFrom;
      yearFrom = year - 1;
    }

    return [new Date(yearFrom, 0, dayFrom), new Date(year, 0, dayTo)];
  }

  public fillDates(week: string, year: string) {
    week = week.substring(2);
    const dates = this.getDatesFromWW(+week, +year);
    this.fromDate = dates[0].getFullYear() + "-" + this.twoDigits(dates[0].getMonth() + 1) + "-" + this.twoDigits(dates[0].getDate());
    this.toDate = dates[1].getFullYear() + "-" + this.twoDigits(dates[1].getMonth() + 1) + "-" + this.twoDigits(dates[1].getDate());
    this.search();
  }

  private twoDigits(oneDigit: number): string {
    if (oneDigit < 10) {
      return String("0" + oneDigit);
    } else {
      return String(oneDigit);
    }
  }

  public currentYear() {
    const currentYear = this.justToday.getUTCFullYear();
    this.fromDate = String(currentYear) + "-01-01";
    this.toDate =
      this.justToday.getFullYear() + "-" +
      this.twoDigits(this.justToday.getMonth() + 1) + "-" +
      this.twoDigits(this.justToday.getDate());
    this.search();
  }

  public getErrorMessage(msg: string) {
    this.messages = [{
      severity: "error",
      summary: "Invalid fields",
      detail: msg
    }];
    return true;
  }

  public search() {
    if ((/^\d{4}-\d{1,2}-\d{1,2}$/.test(this.fromDate)) && (/^\d{4}-\d{1,2}-\d{1,2}$/.test(this.toDate))) {
      this.showSummary = false;
      this.totalSummary = new Map();
      this.usageSummary = [];
      this.distributionWorkload = [];
      this.distributionClassification = [];
      this.distributionSegment = [];
      this.usageDepartments = [];

      this.ruleSet = {
        condition: "and",
        rules: [
          {field: "date", operator: "greater_equal_than", value: this.fromDate},
          {field: "date", operator: "less_equal_than", value: this.toDate}]
      };
      this.query = new Query(this.ruleSet, "default");
      const input = JSON.stringify(this.query.toSearchableQuery(this.fields));

      this.messageService.showSpinner();
      forkJoin(
        this.dataService.getSearchResultsSummary(input),
        this.dataService.getSummaryByWorkload(input),
        this.dataService.getSummaryByClassification(input),
        this.dataService.getSummaryBySegment(input),
        this.dataService.getUsersUsage(this.fromDate, this.toDate)).subscribe(([resultSummary, resultWorkload,
                                                                                 resultClassification, resultSegment,
                                                                                 resultUsage]) => {
        // -----------------------------------------------------------------------------------------------
        this.totalSummary.set("Workload", resultSummary.data.totalWorkloads);
        this.totalSummary.set("Component", resultSummary.data.totalComponents);
        this.totalSummary.set("TotalTraces", resultSummary.data.totalResults);
        // -----------------------------------------------------------------------------------------------
        for (const row of resultWorkload.data) {
          let name: string;
          if (row.data.workload === "") {
            name = "Not Available"
          } else {
            name = row.data.workload
          }
          this.distributionWorkload.push([name, row.data.numTraces]);
        }
        this.distributionWorkload.sort((n1, n2) => n1[0].localeCompare(n2[0]));
        // -----------------------------------------------------------------------------------------------
        for (const row of resultClassification.data) {
          let name: string;
          if (row.classificationName === "") {
            name = "Not Available"
          } else {
            name = row.classificationName
          }
          this.distributionClassification.push([name, row.numberOfTraces]);
        }
        this.distributionClassification.sort((n1, n2) => n1[0].localeCompare(n2[0]));
        // -----------------------------------------------------------------------------------------------
        for (const row of resultSegment.data) {
          let name: string;
          if (row.segmentName === "") {
            name = "Not Available"
          } else {
            name = row.segmentName
          }
          this.distributionSegment.push([name, row.numberOfTraces]);
        }
        this.distributionSegment.sort((n1, n2) => n1[0].localeCompare(n2[0]));
        // -----------------------------------------------------------------------------------------------
        this.usageSummary.push(["API searches", resultUsage.data[0].apiSearchesCount]);
        this.usageSummary.push(["API users", resultUsage.data[0].apiUsersCount]);
        this.usageSummary.push(["Front-end searches", resultUsage.data[0].frontEndSearchesCount]);
        this.usageSummary.push(["Front-end users", resultUsage.data[0].frontEndUsersCount]);

        const userStr = JSON.stringify(resultUsage.data[0].departments);
        JSON.parse(userStr, (key, value) => {
          if (typeof key === "string" && typeof value === "number") {
            this.usageDepartments.push([key, value]);
          }
        });

        // -----------------------------------------------------------------------------------------------
        this.messageService.hideSpinner();
        this.showSummary = true;
      });
    } else {
      return this.getErrorMessage("Please input valid From and To dates");
    }
  }
}
