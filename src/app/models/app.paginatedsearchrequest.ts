export class AppPaginatedSearchRequest {
  public input : string;
  public pageNumber : number;
  public pageSize : number;
  public sortOrder : number;
  public sortField : string;
  public totalQueryElements : number;
  public totalWorkloads : number;
  public totalComponents : number;

  constructor(input : string, pageNumber : number, pageSize : number, sortOrder : number, sortField : string,
              totalQueryElements : number, totalWorkloads : number, totalComponents : number){
    this.pageSize = pageSize;
    this.pageNumber = pageNumber;
    this.sortOrder = sortOrder;
    this.sortField = sortField;
    this.input = input;
    this.totalWorkloads = totalWorkloads;
    this.totalComponents = totalComponents;
    this.totalQueryElements = totalQueryElements;
  }
}
