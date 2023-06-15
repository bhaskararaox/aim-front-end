export class EDPSampleModel {
  data: any[];
  config: any;
  elementId: string;

  constructor(data: any[], config: any, elementId: string) {
    this.data = data;
    this.config = config;
    this.elementId = elementId;
  }
}
