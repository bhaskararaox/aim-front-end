import {Component, Input, ViewEncapsulation} from "@angular/core";
import {Query} from "../searchbox/models/searchbox.query";
//import {RuleSet} from "angular2-query-builder";
//import {Rule} from "angular2-query-builder/dist/components/query-builder/query-builder.interfaces";
import {AvailableField} from "../searchbox/models/searchbox.availablefield";
import {AppUtilities} from "../../app.utilities";
import {Rule, RuleSet} from "../searchbox/models/searchbox.ruleset";

@Component({
  selector: "python-api-exporter",
  templateUrl: "./pythonapiexporter.component.html",
  //styleUrls: ['../../app.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class PythonApiExporter {
  _aimpactQuery: Query;
  _availableFields: AvailableField[];

  @Input()
  set aimpactQuery(query: Query) {
    this._aimpactQuery = query;
  }

  get aimpactQuery() {
    if (!this._aimpactQuery) {
      return null;
    }
    return this._aimpactQuery.toQueryWithTransformedOperators();
  }

  @Input()
  set availableFields(values: AvailableField[]) {
    this._availableFields = values;
  }

  get availableFields() {
    return this._availableFields;
  }

  constructor() {

  }

  public downloadPythonScript() {
    if (this.aimpactQuery != null) {
      let content: string = this.getPythonScript();
      AppUtilities.downloadFile("query.py", content);
    }
  }

  public getPythonScript(): string {
    if (this.aimpactQuery == null) {
      return "";
    }
    let pythonQuery: string = this.toPythonQuery();
    let template: string =
      "# To execute this script is required to have AIM-PACT API installed from https://github.intel.com/STO-PAC/aim-pact-api/releases\n" +
      "# Required version >= 1.0.0a6\n" +
      "import pandas as pd\n" +
      "import logging\n" +
      "from aimpact.models import console_colorer\n" +
      "from aimpact.context import AimPactContext\n" +
      "\n\n" +
      "logging.basicConfig(\n" +
      "            level=logging.INFO,\n" +
      "            format='%(levelname)8s --- %(message)s',\n" +
      "            datefmt='%Y-%m-%d %H:%M:%S')\n" +
      "\n\n" +
      "ctx = AimPactContext()\n" +
      "try:\n" +
      "    ctx.connect()\n" +
      "except ConnectionError as e:\n" +
      "    logging.error(str(e))\n" +
      "    exit(-1)\n" +
      "\n" +
      "try:\n" +
      `    query = ${pythonQuery}\n` +
      "    # Below data_frame variable is a Pandas Data Frame\n" +
      "    data_frame = ctx.search_by_query(query)\n" +
      "except (ConnectionError, AttributeError) as e:\n" +
      "    logging.error(str(e))\n" +
      "    exit(-1)\n" +
      "\n\n" +
      "# At this point, data_frame holds the query result. Common Data Frame operations can follow\n" +
      "print(\"Query returned %d results.\" % len(data_frame))\n" +
      "print(\"Query Results\")\n" +
      "print(data_frame)\n" +
      "# data_frame = data_frame.head(top) # Where top is an integer of the amount of rows to keep\n" +
      "# data_frame = data_frame[column_list] # Where column_list is a list of column names to keep\n";
    return template;
  }

  public toPythonQuery(): string {
    let pythonQuery: string = this.toPythonQueryRulset(this.aimpactQuery.query);
    return pythonQuery;
  }

  private toPythonQueryRulset(query: RuleSet): string {
    let condition: string = query.condition;
    switch (condition) {
      case "and":
        condition = "&";
        break;
      case "or":
        condition = "|";
        break;
    }

    let parts: string[] = [];

    for (let rule of query.rules) {
      if ("condition" in rule) {
        let ruleSet: RuleSet = <RuleSet>rule;
        parts.push(this.toPythonQueryRulset(ruleSet));
      } else if ("field" in rule) {
        let fieldRule: Rule = <Rule>rule;
        parts.push(this.toPythonQueryField(fieldRule));
      }
    }

    if (parts.length == 0) {
      return "";
    } else if (parts.length == 1) {
      return parts[0];
    } else {
      let result: string = parts.join(" " + condition + " ");
      return "(" + result + ")";
    }
  }

  private toPythonQueryField(rule: Rule): string {
    let value: string = rule.value;
    let fields: AvailableField[] = [];
    if (this.availableFields != null)
      fields = this.availableFields.filter(a => a.traceAttribute.value == rule.field);
    if (fields.length == 1) {
      let field: AvailableField = fields[0];
      switch (field.getType()) {
        case "string":
        case "date":
        case "impact":
          value = "\"" + value + "\"";
          if (value.includes(",")) {
            value = value.split(",").join("\",\"");
          }
          break;
        case "boolean":
          switch (value) {
            case "true":
            case "True":
            case "1":
              value = "True";
              break;
            default:
              value = "False";
          }
          break;
      }
    }

    let operator: string = rule.operator;
    if (operator == "in" || operator == "not_in") {
      operator += "_f";
    }

    return "ctx.fl." + rule.field.toLowerCase().replace(new RegExp("-", "g"), "_")
      + "." + operator + "(" + value + ")";
  }
}
