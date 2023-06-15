export class SearchExportRequest {
  public searchQuery : string;
  public isInstructionsIncluded : boolean;
  public selectedAttributes: string;

  constructor(searchQuery : string, isInstructionsIncluded : boolean, selectedAttributes: string){
    this.searchQuery = searchQuery;
    this.isInstructionsIncluded = isInstructionsIncluded;
    this.selectedAttributes = selectedAttributes;
  }
}