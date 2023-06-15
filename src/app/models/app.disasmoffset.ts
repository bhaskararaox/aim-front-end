export class DisasmOffset {
  private fileName : string;
  private startOffset : number;
  private endOffset : number;

  constructor(fileName: string, startOffset: number, endOffset: number) {
    this.fileName = fileName;
    this.startOffset = startOffset;
    this.endOffset = endOffset;
  }
}
