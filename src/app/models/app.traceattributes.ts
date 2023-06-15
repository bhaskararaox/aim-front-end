import {TraceAttribute} from "./app.traceattribute";


export class TraceAttributes {

  public static getAllAttributes() : TraceAttribute[]{
    return [
      new TraceAttribute("Trace", "trace"),
      new TraceAttribute("Date", "date"),
      //new TraceAttribute("Path Length", "pathlength"),
      new TraceAttribute("Segment", "segment"),
      //new TraceAttribute("Tags", "tags"),
      new TraceAttribute("Trace Classification", "classification"),
      new TraceAttribute("Trace Weight", "instruction_weight"),
      new TraceAttribute("Study List", "study_list"),
      new TraceAttribute("Trace List", "trace_list"),
      new TraceAttribute("Number of Threads", "num_cpus"),
      new TraceAttribute("Application", "application"),
      new TraceAttribute("User Instructions Ratio", "user_percent"),
      new TraceAttribute("Kernel Instructions Ratio", "kernel_percent"),
      new TraceAttribute("Total Instructions", "total_instructions"),
      new TraceAttribute("Instructions Represented", "instructionsrepresented"),
      new TraceAttribute("Cycles Represented", "cyclesrepresented"),
      // new TraceAttribute("Cycles Weight", "cyclesWeight"),

      new TraceAttribute("Keiko CPI", "keiko_cpi"),
      new TraceAttribute("Keiko L1MPI", "keiko_l1mpi"),
      new TraceAttribute("Keiko L2MPI", "keiko_l2mpi"),
      new TraceAttribute("Keiko LLCMPI", "keiko_llcmpi"),
      new TraceAttribute("Keiko ICACHE MISSES", "keiko_icache_miss"),
      new TraceAttribute("Keiko JECLEAR", "keiko_jeclear"),

      new TraceAttribute("EMON/EDP", "edp_emon", false),
      //new TraceAttribute("Emon CPI", "emon_cpi"),
      //new TraceAttribute("Emon L1MPI", "emon_l1mpi"),
      //new TraceAttribute("Emon L2MPI", "emon_l2mpi"),
      //new TraceAttribute("Emon LLCMPI", "emon_llcmpi"),

      new TraceAttribute("Instruction", "instruction"),
      new TraceAttribute("ISA", "isa"),
      new TraceAttribute("ISA Set", "isaset"),
      new TraceAttribute("ISA Percentage", "isaPercentage",true,false),
      new TraceAttribute("Category", "category"),
      new TraceAttribute("IForm", "iform"),

      new TraceAttribute("Code Footprint (kB)", "func_code-footprint-kb"),
      new TraceAttribute("CPL Transitions", "func_cpl-trans"),
      new TraceAttribute("CR3 Updates", "func_cr3-trans"),
      new TraceAttribute("Data Footprint (kB)", "func_data-footprint-kb"),
      new TraceAttribute("IRQS", "func_irqs"),
      new TraceAttribute("Page Faults", "func_page-faults"),
      new TraceAttribute("OS","operating_system"),
      new TraceAttribute("Compiler","compiler"),
      new TraceAttribute("Invalid Fields","invalidfields"),
      new TraceAttribute("Is Published","ispublished"),
      new TraceAttribute("Is Preproduction","ispreproduction"),
      new TraceAttribute("LCAT impact", "lcatimpact", true, false),
      new TraceAttribute("LCAT", "lcatdata", false),
      new TraceAttribute("Is CR3 Shared Among Threads", "iscr3sharedamongthreads", true, false),
      new TraceAttribute("CR3 Shared Data", "cr3shareddata", false),
      new TraceAttribute("Has Lock Instructions", "haslockinstructions", true, false),
      new TraceAttribute("Lock Instructions", "lockinstructions", false)
    ];
  }

  public static getTraceAttribute(value : string) : TraceAttribute{
    let attributes = TraceAttributes.getAllAttributes();
    let filtered = attributes.filter(a => a.value == value);
    if (filtered != null && filtered.length > 0)
      return  filtered[0];
    return null;
  }

}
