import {IHashMap} from "./models/app.hashmap";
import {NameValue} from "./models/app.namevalue";


export class AppUtilities{
  public static downloadFile(fileName: string, fileContent : String){
    var blob = new Blob([fileContent], {type: 'text/csv'});

    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      //save file for IE
      window.navigator.msSaveOrOpenBlob(blob, fileName);
    } else {
      let objectUrl = URL.createObjectURL(blob);
      let a = document.createElement('a');
      a.href = objectUrl ;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  public static clone<T>(obj : T) : T{
    return JSON.parse(JSON.stringify(obj));
  }

  public static getTable(data : IHashMap) : NameValue[]{
    let keys : string[] = Object.keys(data);
    let result : NameValue[] = [];
    for (let key of keys){
      result.push(new NameValue(key, data[key]));
    }
    return result;
  }

  public static createGuid() : string {
    let d = new Date().getTime();
    if (window.performance && typeof window.performance.now === "function") {
      d += performance.now();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      let r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d/16);
      return (c=='x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  public static getBrowserName() : string{
    var userAgent = window.navigator.userAgent;
    var browsers = ["chrome", "safari", "firefox", "internet explorer"];

    for(let browser of browsers){
      if (userAgent.toLowerCase().includes(browser)){
        return browser;
      }
    }

    return 'unknown';

  }


}
