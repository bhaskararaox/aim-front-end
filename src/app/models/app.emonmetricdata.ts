export class AppEmonMetricData {

  constructor(public metric: string, public coreValue: number, public packageValue: number,
              public socketValue: number, public sample: number, public timestamp: string,
              public value: number) {
    this.metric = metric;
    this.coreValue = coreValue;
    this.socketValue = socketValue;
    this.packageValue = packageValue;
    this.sample = sample;
    this.timestamp = timestamp;
    this.value = value;
  }
}
