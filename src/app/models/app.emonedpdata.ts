export class AppEmonEdpData {
  constructor(public traceName: string, public configuration: string,
              public metrics: Array<any> = ["CPI"], public sockets: Array<any> = [0], public cores: Array<any> = [0],
              public packages: Array<any> = [0]) {
    this.traceName = traceName;
    this.configuration = configuration;
    //this.metric = metric[0];
    this.metrics = metrics;
    this.sockets = sockets;
    this.cores = cores;
    this.packages = packages;
  }
}
