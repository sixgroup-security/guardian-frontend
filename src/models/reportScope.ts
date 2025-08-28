import {
  GridColInputControlProps,
  StateContentTypes,
  isValidString,
  getBoolean,
  isNotNullUndefined,
  ModelBase,
} from "./common";
import { URL_REPORTS } from "./report";
import {
  AssetType,
  AutoCompleteOption,
  EnvironmentType,
  getAutoCompleteOption,
  getAutoCompleteOptions,
  getEnumNames,
  ReportScopeView,
} from "./enums";
import { QueryKey } from "@tanstack/react-query";

// Query keys for scopes
export const queryKeyReportScopes: QueryKey = ["scope"];

export const URL_REPORTS_SCOPE_SUFFIX = "/scope";
const URL_PATH_REPORT_SCOPES_PREFIX =
  URL_REPORTS + "/{report_id}" + URL_REPORTS_SCOPE_SUFFIX;

export const URL_REPORT_SCOPES = URL_PATH_REPORT_SCOPES_PREFIX;
export const URL_REPORT_SCOPES_LOOKUP =
  URL_PATH_REPORT_SCOPES_PREFIX + "/lookup";

// Valid types are: export type GridNativeColTypes = 'string' | 'number' | 'date' | 'dateTime' | 'boolean' | 'singleSelect' | 'actions';

// Column Definitions
export const COLUMN_DEFINITION: GridColInputControlProps[] = [
  {
    field: "id",
    hideColumn: true,
    controlType: null,
  },
  {
    field: "view",
    headerName: "View",
    type: "singleSelect",
    valueOptions: getEnumNames(ReportScopeView),
    description: "Defines whether the asset is internal or external.",
    errorText: "This field is required and cannot be empty.",
    controlType: "Autocomplete",
    required: true,
    options: getAutoCompleteOptions(ReportScopeView), // Set the correct options array
    isValid(value: StateContentTypes) {
      return isNotNullUndefined(value);
    },
    getFinalValue(value: StateContentTypes) {
      return value.id;
    },
  },
  {
    field: "asset",
    headerName: "Asset",
    type: "string",
    description: "The asset associated with this scope.",
    errorText: "This field is required and cannot be empty.",
    controlType: "TextField",
    required: true,
    isValid(value: StateContentTypes) {
      return isValidString(value);
    },
  },
  {
    field: "type",
    headerName: "Asset Type",
    type: "singleSelect",
    valueOptions: getEnumNames(AssetType),
    description: "The type of asset.",
    errorText: "This field is required and cannot be empty.",
    controlType: "Autocomplete",
    required: true,
    options: getAutoCompleteOptions(AssetType), // Set the correct options array
    isValid(value: StateContentTypes) {
      return isNotNullUndefined(value);
    },
    getFinalValue(value: StateContentTypes) {
      return value.id;
    },
  },
  {
    field: "zone",
    headerName: "Zone",
    type: "string",
    description: "The network zone in which the asset is located.",
    errorText: "This field is required and cannot be empty.",
    controlType: "TextField",
    required: true,
    isValid(value: StateContentTypes) {
      return isValidString(value);
    },
  },
  {
    field: "strong_authentication",
    headerName: "MFA",
    type: "boolean",
    description:
      "Defines whether the asset implements Multi-Factor Authentication (MFA).",
    errorText: "The checkbox is currently undefined. Check or uncheck it.",
    headerAlign: "center",
    align: "center",
    controlType: "Checkbox",
    getFinalValue(value: StateContentTypes) {
      return getBoolean(value);
    },
  },
  {
    field: "environment",
    headerName: "Environment",
    type: "singleSelect",
    valueOptions: getEnumNames(EnvironmentType),
    description: "The environment associated with this scope.",
    errorText: "This field is required and cannot be empty.",
    controlType: "Autocomplete",
    required: true,
    options: getAutoCompleteOptions(EnvironmentType), // Set the correct options array
    isValid(value: StateContentTypes) {
      return isNotNullUndefined(value);
    },
    getFinalValue(value: StateContentTypes) {
      return value.id;
    },
  },
  {
    field: "description",
    headerName: "Description",
    type: "string",
    description: "A description of the scope.",
    errorText: "This field is required and cannot be empty.",
    controlType: "TextField",
    minRows: 4,
    maxRows: 4,
    required: true,
    isValid(value: StateContentTypes) {
      return isValidString(value);
    },
  },
  {
    field: "report_section",
    headerName: "Report Section",
    type: "string",
    description:
      "The report's section where the asset's vulnerabilities will be documented. This information will be used by automation to automatically place the vulnerability into the right report section.",
    errorText: "This field is required and cannot be empty.",
    controlType: "Autocomplete",
    apiEndpoint: "projects/{project_id}/reports/{report_id}/scope",
    queryKey: ["bla"],
    isValid(value: StateContentTypes) {
      return isNotNullUndefined(value);
    },
    getFinalValue(value: StateContentTypes) {
      return value.id;
    },
  },
];

// ReportScope Model
export class ReportScope extends ModelBase {
  public view: AutoCompleteOption | null;
  public asset: string;
  public type: AutoCompleteOption | null;
  public zone: string;
  public strong_authentication: boolean;
  public description: string;
  public environment: AutoCompleteOption | null;
  public report_section: AutoCompleteOption | null;

  constructor(userData: any) {
    super(userData.id);
    this.view = getAutoCompleteOption(ReportScopeView, userData.view);
    this.asset = userData.asset;
    this.type = getAutoCompleteOption(AssetType, userData.type);
    this.zone = userData.zone;
    this.strong_authentication = userData.strong_authentication;
    this.description = userData.description;
    this.environment = getAutoCompleteOption(
      EnvironmentType,
      userData.environment
    );
    this.report_section = userData.report_section;
  }
}
