import {Component, OnInit, ViewEncapsulation} from "@angular/core";
import {AvailableFieldsController} from "./controllers/searchbox.availablefieldscontroller";
import {TraceDataService} from "../../services/app.tracedataservice";
import {TraceAttributes} from "../../models/app.traceattributes";
import {SearchData} from "../../models/app.searchdata";
import {MessageService} from "../../services/app.messageservice";
import {Subscription} from "rxjs/Subscription";
import {AppInitData} from "../../models/app.initdata";
//import {RuleSet, Rule} from "angular2-query-builder";
import {QueryController} from "./controllers/searchbox.querycontroller";
import {Query} from "./models/searchbox.query";
import {AppUtilities} from "../../app.utilities";
import {QueryAttributeValues} from "./models/searchbox.queryattributevalues";
import {User} from "../../models/app.user";
import {isUndefined} from "util";
import {Router} from "@angular/router";
import {RuleSet, Rule} from "./models/searchbox.ruleset";

@Component({
  selector: "searchbox",
  templateUrl: "./searchbox.component.html",
  styleUrls: ["../../app.component.css", "searchbox.component.css"],
  encapsulation: ViewEncapsulation.None,
  host: {"(window:keydown)": "displayNestedQuery($event)"}
})

export class SearchBoxComponent implements OnInit {
  public availableFields: AvailableFieldsController;
  public aimpactQueryController: QueryController;
  public favouriteQueries: Query[];
  public topQueries: Query[];
  public appInitData: AppInitData;
  private dataService: TraceDataService;
  private messageService: MessageService;
  private gotInitDataSubscription: Subscription;
  private gotUserSubscription: Subscription;
  private switchUserViewSubscription: Subscription;
  private loadSharedQuerySubscription: Subscription;
  private searchQuery: SearchData = null;
  private queryShareId: string = null;

  public isSelectAllIndeterminate = false;
  public listQuery: boolean;
  public nestedQuery: boolean;
  public nestedQueryVisible: boolean;
  public user: User;


  constructor(dataService: TraceDataService, messageService: MessageService) {
    this.user = new User();
    this.availableFields = new AvailableFieldsController();
    this.aimpactQueryController = new QueryController(this.availableFields);
    this.topQueries = this.aimpactQueryController.getTopQueries();
    this.dataService = dataService;
    this.messageService = messageService;
    this.gotInitDataSubscription = messageService.getGotInitData().subscribe(appIniData => this.onGotInitData(appIniData));
    this.gotUserSubscription = messageService.getGotUser().subscribe(user => this.onGotUserData(user));
    this.switchUserViewSubscription = messageService.getSwitchUserView().subscribe(() => this.onSwitchUserView());
    this.listQuery = true;
    this.nestedQuery = false;
    this.nestedQueryVisible = false;
    this.availableFields.selectAllCheckBox = false;
    this.loadSharedQuerySubscription = this.messageService.getSharedQueryLoadedCompleted()
      .subscribe(queryShareId => this.loadSharedQuery(queryShareId));
  }

  ngOnInit() {

  }

  private loadSharedQuery(sharedQueryId: string) {
    if (sharedQueryId) {
      this.dataService.getSharedQuery(sharedQueryId).subscribe( data => {
        console.log(">>> Loading Shared Query");
        const query: Query = this.createQueryObject(data);
        query.fixOperators();
        this.loadFavouriteQuery(query);
        this.search();
      });
    }
  }

  public displayNestedQuery(event) {
    if (event.shiftKey && event.ctrlKey && event.key.toLowerCase() == "h") {
      event.cancelBubble = true;
      this.nestedQueryVisible = !this.nestedQueryVisible;
      if (!this.nestedQueryVisible) {
        this.showListQuery();
      } else {
        this.showNestedQuery();
      }
    }
  }

  public loadFavouriteQuery(query: Query) {
    const ruleSet: RuleSet = AppUtilities.clone<RuleSet>(query.query);
    const clonedQuery: Query = new Query(ruleSet, query.keikoConfiguration);
    this.availableFields.selectAllCheckBox = false;
    this.aimpactQueryController.setAimpactQuery(clonedQuery);
    this.queryShareId = query.shareId; // get shareId and saved in a class variable
    if (query.id) {
      this.dataService.updateFavouriteQueryUsage(query.id).subscribe(data => {
        // do nothing. Silently update the favourite query usage
      }, error => {
        alert(error);
      });
    }
  }

  public onFocusOut(event, rule) {
    this.availableFields.checkAttribute(TraceAttributes.getTraceAttribute(rule.field), this.user.isAdmin());
    this.aimpactQueryController.onRuleFieldChange(rule);
  }

  private loadFavouriteQueries() {
    console.log(">>> Loading Favorite Queries");
    this.messageService.showSpinner();
    this.dataService.getUserFavouriteQueries().subscribe(data => {
      this.favouriteQueries = this.getQueriesToDisplay(data);
      this.messageService.hideSpinner();
    });
  }

  private onGotUserData(user: User) {
    this.user = user;
  }

  private onGotInitData(appInitData: AppInitData) {
    this.appInitData = appInitData;
    this.loadFavouriteQueries();
    this.aimpactQueryController.initialize(this.appInitData);
    // this.topQueries = this.getTopQueries();
  }

  private onSwitchUserView() {
    if (!this.user.isAdmin()) {
      this.aimpactQueryController.removeAdminFields();
    } else {
      if (this.availableFields.selectAllCheckBox) {
        this.aimpactQueryController.selectAdminFields();
      }
    }
  }

  /*private getTopQueries(): Query[] {
    const data = this.appInitData.topQueries.map(q => ({query: q, id: 0}));
    return this.getQueriesToDisplay(data);
  }*/

  private getQueriesToDisplay(data): Query[] {
    const queries: Query[] = [];
    for (const dataItem of data) {
      const aimpactQuery = this.createQueryObject(dataItem);
      aimpactQuery.fixOperators();
      queries.push(aimpactQuery);
    }

    return queries;
  }

  private createQueryObject(dataItem): Query {
    let strquery: string = dataItem.query;
    strquery = strquery.replace(new RegExp("attribute", "g"), "field");
    const query = JSON.parse(strquery);
    let queryConditions: RuleSet = {condition: "and", rules: []};
    if (query.conditions.length > 0) {
      if ("condition" in query.conditions[0]) {
        queryConditions = query.conditions[0];
      } else if ("field" in query.conditions[0]) {
        queryConditions.rules = query.conditions;
      }
    }
    const aimpactQuery: Query = new Query(queryConditions, query.keikoConfiguration, dataItem.id, dataItem.share_id);
    return aimpactQuery;
  }

  public search() {
    const fields = this.availableFields.getSelectedAttributes();
    const ruleSet: RuleSet = this.formatQuery(AppUtilities.clone<RuleSet>(this.aimpactQueryController.aimpactQuery.query));
    const query: Query = new Query(ruleSet, this.aimpactQueryController.aimpactQuery.keikoConfiguration);
    const input = JSON.stringify(query.toSearchableQuery(this.availableFields.getSelectedAttributes()));
    this.messageService.hideEmonEdpWindow(true);

    const searchData = new SearchData(
      input,
      fields,
      this.aimpactQueryController.aimpactQuery.getSequenceConditionValue(),
      query,
      this.availableFields.availableFields,
      this.queryShareId ? this.queryShareId : null);

    const searchDataStr = JSON.stringify(searchData);
    const searchQueryStr = JSON.stringify(this.searchQuery);

    if (searchDataStr != searchQueryStr) {
      this.searchQuery = searchData;
      this.messageService.queryBroadcasted(searchData);
    } else {
      this.messageService.toggleSearchBox();
    }
  }
  private formatQuery(segmentQuery: RuleSet): RuleSet {
    var rulesLength = segmentQuery.rules.length;
    for (var i = 0; i < rulesLength; ++i) {
      var ruleData = JSON.parse(JSON.stringify(segmentQuery.rules[i]));
      if (ruleData.field === QueryAttributeValues.SEGMENT) {
        segmentQuery.rules[i] = (<Rule>{
          id: ruleData.id,
          field: ruleData.field,
          operator: ruleData.operator,
          value: String(ruleData.value.toLowerCase())
        });
      }
      if (ruleData.field === QueryAttributeValues.TRACE_NAME) {
        segmentQuery.rules[i] = (<Rule>{
          id: ruleData.id,
          field: ruleData.field,
          operator: ruleData.operator,
          value: String(ruleData.value.toLowerCase())
        });
      }
      if (ruleData.field === QueryAttributeValues.INVALID_FIELDS) {
        segmentQuery.rules[i] = (<Rule>{
          id: ruleData.id,
          field: ruleData.field,
          operator: ruleData.operator,
          value: String(ruleData.value.toLowerCase())
        });
      }
    }
    return segmentQuery;
  }

  public save() {
    const query = JSON.stringify(this.aimpactQueryController.aimpactQuery.toSearchableQuery(this.availableFields.getSelectedAttributes()));
    this.messageService.showSpinner();
    this.dataService.saveFavouriteQuery(query).subscribe(data => {
      this.setSavedSharedId(data); // get shareId and saved in a class variable
      this.favouriteQueries = this.getQueriesToDisplay(data);
      this.messageService.hideSpinner();
      this.messageService.showSuccessMessage("Query Saved!", "Your new query was successfully saved!");
      this.messageService.showInfoMessage("New Share Query Capability", "Notice that you can share " +
        "your favorite queries by coping the URL resulting after saving a query and clicking Search");
    });
  }

  public setSavedSharedId(data) {
    if (data && data.length > 0) {
      this.queryShareId = data[data.length - 1].share_id;
    }
  }

  public removeQuery(query: Query) {
    // TODO: check if saved shared id corresponds to query to be deleted and send message to home component
    if (query.id) {
      this.messageService.showSpinner();
      this.dataService.removeFavouriteQuery(query.id).subscribe(data => {
        this.favouriteQueries = this.getQueriesToDisplay(data);
        this.messageService.hideSpinner();
        this.messageService.showSuccessMessage("Query Deleted!", "Your query was successfully deleted!");
      });
    }
  }

  public copyQueryToClipboard(query: Query) {
     var copyElement = document.createElement("textarea");
     copyElement.style.position = 'fixed';
     copyElement.style.opacity = '0';
     copyElement.textContent =  window.location.href+"?query="+query.shareId;
     var body = document.getElementsByTagName('body')[0];
     body.appendChild(copyElement);
     copyElement.select();
     document.execCommand('copy');
     body.removeChild(copyElement);
     this.messageService.showInfoMessage("", "Query URL copied to clipboard");

  }

  public getKeikoConfigurationSuggestions(): string[] {
    const array = [Query.DefaultKeikoConfigurationValue];
    for (const conf of this.appInitData.keikoConfigurations) {
      array.push(conf);
    }
    return array;
  }

  public hasKeikoData(): boolean {
    /*
    for(let condition of this.currentQuery.conditions){
      if (TraceAttribute.getAttributeGroup(condition.getModel().attribute.value) == TraceAttributeGroup.Keiko){
        return true;
      }
    }
    */
    return false;
  }

  public clear() {
    this.aimpactQueryController.clear();
    this.availableFields.clearSelectAll();
    this.availableFields.selectAllCheckBox = false;
    this.availableFields.isSelectAllIndeterminate = false;
  }

  public showListQuery() {
    this.aimpactQueryController.queryExpressionController.initialize(this.aimpactQueryController.aimpactQuery);
    this.listQuery = true;
    this.nestedQuery = false;
  }

  public showNestedQuery() {
    this.listQuery = false;
    this.nestedQuery = true;
  }
}