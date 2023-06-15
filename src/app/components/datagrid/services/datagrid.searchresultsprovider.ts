import {ResultsRaw} from "../models/datagrid.resultsraw";
import {AppPaginatedSearchRequest} from "../../../models/app.paginatedsearchrequest";
import {SearchExportRequest} from "../../../models/app.searchexportrequest";
import {TraceDataService} from "../../../services/app.tracedataservice";
import {TraceAttribute} from "../../..//models/app.traceattribute";
import {MessageService} from "../../../services/app.messageservice";
import {SearchData} from "../../../models/app.searchdata";
import {ConfirmationService, FilterMetadata} from "primeng/primeng";
//import {RuleSet} from "angular2-query-builder";
import {Rule, RuleSet} from "../../searchbox/models/searchbox.ruleset";
import {Query} from "../../searchbox/models/searchbox.query";
import {Subscription} from "../../../../../node_modules/rxjs";


export class SearchResultsProvider {
  private dataService: TraceDataService;
  private messageService: MessageService;
  private confirmationService: ConfirmationService;

  private cachedResults: ResultsRaw[] = [];
  private currentQuery: String = "";
  private currentSortOrder: number = 0;
  private currentSortField: string = "";
  private batchSize: number = 10000;
  public searchCurrentRecords: number = -1;
  public searchTotalRecords: number = -1;
  public searchTotalWorkloads: number = -1;
  public searchTotalComponents: number = -1;
  public data: ResultsRaw[] = [];
  private isDataReturned: boolean;
  public isDataEmailed: boolean;

  constructor(dataService: TraceDataService, messageService: MessageService, confirmationService: ConfirmationService) {
    this.dataService = dataService;
    this.messageService = messageService;
    this.confirmationService = confirmationService;
    this.isDataReturned = false;
    this.isDataEmailed = false;
  }

  public clearCache() {
    this.isDataReturned = false;
    this.isDataEmailed = false;
    this.cachedResults = [];
    this.currentQuery = "";
    this.currentSortOrder = 0;
    this.currentSortField = "";
    this.searchCurrentRecords = -1;
    this.searchTotalRecords = -1;
    this.searchTotalWorkloads = -1;
    this.searchTotalComponents = -1;
    this.data = [];
  }

  public fetchQueryResult(searchQuery: SearchData, page: number, pageSize: number, selectedAttributes: TraceAttribute[], isInstructionsIncluded: boolean,
                          filters: { [p: string]: FilterMetadata } | undefined, sortOrder: number, sortField: string) {
    let input = this.addFiltersToQuery(filters, searchQuery);
    let lastRecord = (page + 1) * pageSize;
    if (this.cachedResults.length == this.searchTotalRecords
      || (this.currentQuery == input
        && (this.currentSortField == sortField || (this.currentSortField == "" && sortField == undefined))
        && this.currentSortOrder == sortOrder
        && lastRecord <= this.cachedResults.length)) {
      this.sortAndFilterCachedResults(sortField, sortOrder, filters, page, pageSize);
    }
    else {
      this.fetchNewData(searchQuery, page, pageSize, selectedAttributes, isInstructionsIncluded, filters, sortOrder, sortField);
    }
  }

  private fetchNewData(searchQuery: SearchData, page: number, pageSize: number, selectedAttributes: TraceAttribute[], isInstructionsIncluded: boolean,
                       filters: { [p: string]: FilterMetadata } | undefined, sortOrder: number, sortField: string) {
    this.isDataEmailed = false;
    let input = searchQuery.input;
    if (this.currentQuery == input && this.searchTotalRecords / 2 <= this.cachedResults.length) {
      let requestPageSize = this.cachedResults.length;
      let requestPage = 1;
      this.loadTracesFromService(input, requestPage, requestPageSize, page, pageSize, selectedAttributes, isInstructionsIncluded,
        filters, this.currentSortOrder, this.currentSortField, sortOrder, sortField);
    }
    else {
      input = this.addFiltersToQuery(filters, searchQuery);

      this.cachedResults = [];
      this.currentQuery = input;
      this.currentSortField = sortField;
      this.currentSortOrder = sortOrder;
      let lastRecord = (page + 1) * pageSize;
      let requestPage = 0;
      let requestPageSize = Math.max(Math.ceil(lastRecord / this.batchSize), 1) * this.batchSize;
      this.loadTracesFromService(input, requestPage, requestPageSize, page, pageSize, selectedAttributes, isInstructionsIncluded, filters, sortOrder, sortField);
    }
  }

  private addFiltersToQuery(filters: { [p: string]: FilterMetadata } | undefined, searchQuery: SearchData) {
    let input = searchQuery.input;
    if (filters != undefined && Object.keys(filters).length != 0 && searchQuery.query !== undefined) {
      let filteredQuery = this.getQueryFiltered(filters, searchQuery.query.query);
      let query: Query = new Query(filteredQuery, searchQuery.query.keikoConfiguration);
      input = JSON.stringify(query.toSearchableQuery(searchQuery.traceAttributes));
    }
    return input;
  }

  private loadTracesFromService(input, requestPage, requestPageSize, page, pageSize, selectedAttributes, isInstructionsIncluded,
                                filters: { [p: string]: FilterMetadata } | undefined,
                                requestedSortOrder: number, requestedSortField: string,
                                sortOrder: number = null, sortField: string = null) {
    if (sortOrder === null) {
      sortOrder = requestedSortOrder;
    }

    if (sortField === null) {
      sortField = requestedSortField;
    }
    const timeOutId = setTimeout(() => {
      // Displays dialog that asks the user if she/he wants to wait – depending on flag
      this.displayTimeOutDialog(subscription, input, isInstructionsIncluded, JSON.stringify(selectedAttributes));
    }, 30000);
    const request = new AppPaginatedSearchRequest(input, requestPage, requestPageSize, requestedSortOrder, requestedSortField,
      this.searchTotalRecords, this.searchTotalWorkloads, this.searchTotalComponents);
    this.messageService.showSpinner();
    const subscription = this.dataService.paginatedSearch(request).subscribe(data => {
      clearTimeout(timeOutId);
      this.isDataReturned = true;
      this.loadPaginatedData(data.data);

      this.sortAndFilterCachedResults(sortField, sortOrder, filters, page, pageSize);
      if (filters == undefined || Object.keys(filters).length == 0) {
        this.messageService.searchCompleted(data);
        this.searchTotalRecords = data.totalElements;
        this.searchTotalWorkloads = data.totalDistinctWorkloads;
        this.searchTotalComponents = data.totalDistinctComponents;


        if (this.searchTotalRecords == 0) {
          this.searchTotalRecords = -1; // search will be triggered on avery filter change
        }
      }
      this.isDataEmailed = false;
      this.messageService.hideSpinner();

    });


  }

  private displayTimeOutDialog(subscription: Subscription, input: string, isInstructionsIncluded: boolean, selectedAttributes: string) {
    this.messageService.hideSpinner();
    this.confirmationService.confirm({
      message: "This query is taking longer than expected. Would you like to receive the AIMPACT query results by mail?",
      header: "Confirmation",
      icon: "fa fa-question-circle",
      accept: () => {
        this.messageService.showSpinner();
        this.searchTotalRecords = -1;
        subscription.unsubscribe();
        this.dataService.emailPaginatedSearch(new SearchExportRequest(input, isInstructionsIncluded, selectedAttributes)).subscribe();
        this.messageService.hideSpinner();
        this.isDataEmailed = true;
      },
      reject: () => {
        if (!this.isDataReturned) {
          this.messageService.showSpinner();
        }
      }
    });
  }

  private sortAndFilterCachedResults(sortField: string, sortOrder: number,
                                     filters: { [p: string]: FilterMetadata } | undefined,
                                     page: number, pageSize: number) {
    let results = this.cachedResults;
    if (sortField != undefined && sortField != "") {
      if (sortOrder >= 0) {
        results = results.sort(((a, b) => {
          let x = a[sortField];
          if (x === "<not available>") {
            x = -1;
          }
          let y = b[sortField];
          if (y === "<not available>") {
            y = -1;
          }
          return x < y ? -1 : x > y ? 1 : 0;
        }));
      } else {
        results = results.sort(((a, b) => {
          let x = a[sortField];
          if (x === "<not available>") {
            x = -1;
          }
          let y = b[sortField];
          if (y === "<not available>") {
            y = -1;
          }
          return x < y ? 1 : x > y ? -1 : 0;
        }));
      }
    }
    if (filters != undefined) {
      for (let columnName in filters) {
        let condition = filters[columnName].matchMode;
        let value = filters[columnName].value;
        if (condition == "contains") {
          results = results.filter(trace => {
            let columnValue = trace[columnName];
            return columnValue.includes(value);
          });
        } else {
          console.log("Unsupported match condition to do filter on column " + value + " condition used " + condition)
        }
      }
    }
    this.searchCurrentRecords = results.length;
    this.data = results.slice(page * pageSize, (page + 1) * pageSize)
  }

  private loadPaginatedData(data: any) {
    let temp: ResultsRaw[] = [];
    for (let trace of data) {
      temp.push(new ResultsRaw(trace));
    }
    this.cachedResults = this.cachedResults.concat(temp);
  }

  private getQueryFiltered(filters: { [p: string]: FilterMetadata } | undefined, query: RuleSet): RuleSet {

    let newRuleSet: RuleSet = {condition: "and", rules: [query]};

    for (let columnName in filters) {
      let condition = filters[columnName].matchMode;
      let value = filters[columnName].value;
      let rule: Rule = <Rule>{field: columnName, operator: condition, value: value};
      newRuleSet.rules.push(rule);
    }

    return newRuleSet;
  }
}
