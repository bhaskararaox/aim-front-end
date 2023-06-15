import {Rule, RuleSet} from "angular2-query-builder/dist/components/query-builder/query-builder.interfaces";
import {Option} from "./searchbox.option";
import {isUndefined} from "util";

export class Field {
  category: string;
  name: string;
  value?: string;
  type: string;
  nullable?: boolean;
  options?: Option[];
  operators?: string[];
  defaultValue?: any;
  defaultOperator?: any;
  validator?: (rule: Rule, parent: RuleSet) => any | null;
  autocompleteValues: string[];
  public static autoCompleteValidator: string;

  constructor() {
    this.category = "";
    this.name = "";
    this.value = "";
    this.type = "";
    this.operators = [];
    this.defaultOperator = "";
    this.options = [];
    this.autocompleteValues = [];
    Field.autoCompleteValidator = "";
  }

  public filterAutocompleteValuesForMultiple(event, rule, options) {
    let value: string = event.query;
    let newAutocompleteValues: string[] = options.map(o => o.value);

    if (value.trim().endsWith(",")) {
      value = value.trim().substring(0, value.length - 1);
    }

    newAutocompleteValues = [];
    for (let option of options) {
      if (option.value.toUpperCase().includes(value.toUpperCase())) {
        newAutocompleteValues.push(option.value);
      }
    }

    this.autocompleteValues = newAutocompleteValues;
  }

  public onAutoCompleteSelectedValue(event, rule) {
    rule.value = rule.values.join(",");
    Field.autoCompleteValidator = "";
    this.autocompleteValues = [];
  }

  public onAutoCompleteUnSelectedValue(event, rule) {
    const value = event;
    const index = rule.values.indexOf(value);
    if (index !== -1) {
      rule.values.splice(index, 1);
    }
    rule.value = rule.values.join(",");
    Field.autoCompleteValidator = "";
  }

  public onAutoCompleteClear(rule) {
    Field.autoCompleteValidator = "";
    this.autocompleteValues = [];
    rule.value = "";
    rule.values = [];
  }

  public assignRuleValue(rule) {
    if (isUndefined(rule.values)) {
      rule.values = [];
    }
    rule.value = rule.values.join(",");
  }

  /*
  private defineRuleValues(rule) {
    if (isUndefined(rule.values)) {
      const stringArray: string[] = [];
      rule.values = stringArray;
    }
    else {
      Field.autoCompleteValidator = "";
    }
  }

  public onAutoCompleteSelectedValue(rule) {
    this.validateAutoComplete(rule);
  }

  public onAutoCompleteUnSelectedValue(event, rule) {
    const value = event;
    const index = rule.values.indexOf(value);
    if (index !== -1) {
      rule.values.splice(index, 1);
    }
    if(Field.autoCompleteValidator == "") {
      this.validateAutoComplete(rule);
    }
  }

  public assignRuleValue(rule) {
    this.defineRuleValues(rule);
    rule.value = rule.values.join(",");
  }

  public filterAutocomplteValuesForMultiple(event, rule, options) {
    this.defineRuleValues(rule);
    let value: string = event.query;
    let newAutocompleteValues: string[] = options.map(o => o.value);
    this.autocompleteValues = newAutocompleteValues;

    if (event.originalEvent.inputType == "insertFromPaste") {
      this.pasteMultipleValues(value, rule, newAutocompleteValues);
      event.originalEvent.path[0].value = "";
    }

    let endOfSequence: boolean = false;
    if (value.trim().endsWith(",")) {
      value = value.trim().substring(0, value.length - 1);
      endOfSequence = true;
    }
    newAutocompleteValues = [];
    for (let option of options) {
      if (option.value.toUpperCase().includes(value.toUpperCase())) {
        newAutocompleteValues.push(option.value);
        if (endOfSequence && option.value.toUpperCase() == value.toUpperCase()) {
          rule.values.push(option.value);
          this.assignRuleValue(rule);
          event.originalEvent.path[0].value = "";
          newAutocompleteValues = [];
          break;
        }
      }
    }
    this.autocompleteValues = newAutocompleteValues;
    if (!endOfSequence) {
      let optionAdded: boolean = false;
      let potentialValidValue: boolean = false;
      this.assignRuleValue(rule);
      if (rule.value != null && rule.value.length > 0) {
        rule.value += ",";
      }
      for (let option of this.autocompleteValues) {
        if (option.toUpperCase() == value.toUpperCase()) {
          // rule.value += option;
          optionAdded = true;
          Field.autoCompleteValidator = "Please select suggested option: " + value;
          break;
        }
        if (option.toUpperCase().includes(value.toUpperCase())) {
          potentialValidValue = true;
          Field.autoCompleteValidator = "Incomplete input " + value;
        }
      }
      if (!optionAdded && !potentialValidValue) {
        Field.autoCompleteValidator = "Invalid option " + value;
        rule.value = "";
      }
    }
  }

  private pasteMultipleValues(value: string, rule, autocompleteValues) {
    let inputs: string[] = value.includes(",") ? value.split(",") : [value];
    for (let input of inputs) {
      for (let option of autocompleteValues) {
        if (option.toUpperCase() == input.toUpperCase().trim()) {
          rule.values.push(option);
        }
      }
    }
    this.assignRuleValue(rule);
  }

  public validateAutoComplete(rule) {
    Field.autoCompleteValidator = "";
    this.assignRuleValue(rule);
  }
  */
}
