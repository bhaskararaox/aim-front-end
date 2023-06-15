export class InstructionRow {
  public Instruction : string;
  public frequency : number;
  public percentage : string;

  constructor(instruction: string, frequency: number, percentage: string) {
    this.Instruction = instruction;
    this.frequency = frequency;
    this.percentage = percentage;
  }
}

