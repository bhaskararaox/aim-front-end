/**********************************************************************************************************************
 * This class is to keep query error messages
 *********************************************************************************************************************/
export class SearchboxQueryErrorMessages {
  public static readonly QUERY_DATE_ERROR_MESSAGE: string = "Enter a date";
  public static readonly QUERY_ISA_PERCENTAGE_FILTER_AND_CONDITION_ERROR_MESSAGE: string = "Invalid Query! ISA Percentage filter should use <b> AND </b> condition";
  public static readonly QUERY_ISA_PERCENTAGE_FILTER_ISA_FILTER_ERROR_MESSAGE: string = "Invalid Query! ISA Percentage filter should be accompanied with ISA filter";
  public static readonly QUERY_ISA_ONLY_ONE_ERROR_MESSAGE: string = "Invalid Query! Only one ISA condition is allowed with ISA Percentage";
  public static readonly QUERY_CONTAINS_EMPTY_VALUES_ERROR_MESSAGE: string = "<b>Invalid Query!</b> Contains empty values set on fields";
  public static readonly QUERY_NUMBER_OF_THREADS_ONLY_ONE_VALUE_ERROR_MESSAGE: string = "Invalid Query. Attribute “Number of Threads” only supports one value"; // TRACING-1601
}
