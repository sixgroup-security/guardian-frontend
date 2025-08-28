/**
 * This file is part of Guardian.
 *
 * Guardian is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Guardian is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Guardian. If not, see <https://www.gnu.org/licenses/>.
 *
 * @author Lukas Reiter
 * @copyright Copyright (C) 2024 Lukas Reiter
 * @license GPLv3
 */

import {
  ApplicationAssessmentThisYearType,
  ApplicationState,
  AutoCompleteOption,
  OverdueType,
  PeriodicityParameterType,
  getAutoCompleteOption,
  getAutoCompleteOptions,
  getEnumNames,
} from "../enums";
import {
  NamedModelBase,
  GridColInputControlProps,
  StateContentTypes,
  isValidNumber,
  getNumber,
  getSingleAutoCompleteEnumId,
  getArrayAutoCompleteEnumId,
  getBoolean,
  isValidString,
  isNotNullUndefined,
} from "../common";
import { CUSTOMER_TITLE_NAME, URL_PATH_PREFIX } from "../../util/consts/common";
import { IPageManagerState } from "../../util/hooks/usePageManager";
import { TagLookup } from "../../models/tagging/tag";
import { URL_CUSTOMERS, queryKeyCustomers } from "../entity/customer";

// Query keys for applications
export const queryKeyApplications = ["applications"];
export const queryKeyApplicationsLookup = ["applications", "lookup"];

// Application REST API endpoints
const URL_PATH_APPLICATIONS_PREFIX = URL_PATH_PREFIX + "/applications";
export const URL_APPLICATIONS = URL_PATH_APPLICATIONS_PREFIX;
export const URL_APPLICATION_PROJECTS = URL_APPLICATIONS + "/{id}/projects";
export const URL_APPLICATIONS_LOOKUP = URL_PATH_APPLICATIONS_PREFIX + "/lookup";

// Query keys for project tags
export const queryKeyApplicationTagsGeneral = ["application_tags", "general"];
export const queryKeyApplicationTagsInventory = [
  "application_tags",
  "inventory",
];
export const queryKeyApplicationTagsClassification = [
  "application_tags",
  "classification",
];
export const queryKeyApplicationTagsDeploymentModel = [
  "application_tags",
  "deployment_model",
];

// REST API endpoints for application tags
const URL_PATH_TAGS_PREFIX = URL_PATH_PREFIX + "/tags";
const URL_PATH_APPLICATION_TAGS_PREFIX = URL_PATH_TAGS_PREFIX + "/applications";
export const URL_APPLICATION_TAGS_GENERAL =
  URL_PATH_APPLICATION_TAGS_PREFIX + "/general";
export const URL_APPLICATION_TAGS_CLASSIFICATION =
  URL_PATH_APPLICATION_TAGS_PREFIX + "/classification";
export const URL_APPLICATION_TAGS_INVENTORY =
  URL_PATH_APPLICATION_TAGS_PREFIX + "/inventory";
export const URL_APPLICATION_TAGS_DEPLOYMENT_MODEL =
  URL_PATH_APPLICATION_TAGS_PREFIX + "/deployment-model";

// Valid types are: export type GridNativeColTypes = 'string' | 'number' | 'date' | 'dateTime' | 'boolean' | 'singleSelect' | 'actions';
export const COLUMN_DEFINITION: GridColInputControlProps[] = [
  {
    field: "id",
    hideColumn: true,
    controlType: null,
  },
  {
    field: "application_id",
    headerName: "ID",
    type: "string",
    description: "ID that uniquely identifies the application.",
    errorText: "This field is required and cannot be empty.",
    width: 100,
    controlType: "TextField",
    required: true,
    isValid(value: StateContentTypes) {
      return isValidString(value);
    },
  },
  {
    field: "name",
    headerName: "Name",
    type: "string",
    description: "The name of the application.",
    errorText: "This field is required and cannot be empty.",
    width: 250,
    controlType: "TextField",
    required: true,
    isValid(value: StateContentTypes) {
      return isValidString(value);
    },
  },
  {
    field: "state",
    headerName: "State",
    type: "singleSelect",
    valueOptions: getEnumNames(ApplicationState),
    description: "The application's current status.",
    errorText: "This field is required and cannot be empty.",
    headerAlign: "center",
    align: "center",
    width: 170,
    controlType: "Autocomplete",
    options: getAutoCompleteOptions(ApplicationState),
    required: true,
    isValid(value: StateContentTypes) {
      return isNotNullUndefined(value);
    },
    getFinalValue(value: StateContentTypes) {
      return getSingleAutoCompleteEnumId(value);
    },
  },
  {
    field: "owner",
    headerName: CUSTOMER_TITLE_NAME,
    type: "string",
    description: `${CUSTOMER_TITLE_NAME} responsible for the application.`,
    errorText: "This field is required and cannot be empty.",
    width: 150,
    controlType: "Autocomplete",
    apiEndpoint: URL_CUSTOMERS,
    getOptionLabel: (option) => option?.name ?? "",
    queryKey: queryKeyCustomers,
    getFinalValue(value: StateContentTypes) {
      return getSingleAutoCompleteEnumId(value);
    },
  },
  {
    field: "manager",
    headerName: "Manager",
    type: "string",
    description: `${CUSTOMER_TITLE_NAME} managing the application.`,
    errorText: "This field is required and cannot be empty.",
    width: 150,
    controlType: "Autocomplete",
    apiEndpoint: URL_CUSTOMERS,
    getOptionLabel: (option) => option?.name ?? "",
    queryKey: queryKeyCustomers,
    getFinalValue(value: StateContentTypes) {
      return getSingleAutoCompleteEnumId(value);
    },
  },
  {
    field: "overdue",
    headerName: "Overdue Status",
    type: "singleSelect",
    valueOptions: getEnumNames(OverdueType),
    description: "Describes the compliance status of the application.",
    headerAlign: "center",
    align: "center",
    controlType: "Autocomplete",
    readonly: true,
    options: getAutoCompleteOptions(OverdueType),
    getFinalValue(value: StateContentTypes) {
      return getSingleAutoCompleteEnumId(value);
    },
    noSubmit: true,
  },
  {
    field: "last_pentest",
    headerName: "Last PT",
    type: "date",
    description:
      "The completion date of the latest penetration test executed on this application.",
    controlType: "DatePicker",
    readonly: true,
    noSubmit: true,
  },
  {
    field: "next_pentest",
    headerName: "Next PT",
    type: "date",
    description:
      "The completion date of the next penetration test for this application.",
    controlType: "DatePicker",
    readonly: true,
    noSubmit: true,
  },
  {
    field: "pentest_periodicity",
    headerName: "PT Periodicity",
    type: "number",
    description:
      "Defines the maximum amount of months between two penetration tests.",
    errorText: "This field can be empty or must be a number.",
    headerAlign: "center",
    align: "center",
    width: 120,
    controlType: "TextField",
    readonly: true,
    isValid(value: StateContentTypes) {
      return value === null || value === undefined || isValidNumber(value);
    },
    getFinalValue(value: StateContentTypes) {
      return getNumber(value);
    },
  },
  {
    field: "pentest_this_year",
    headerName: `PT ${new Date(Date.now()).getFullYear()}`,
    type: "singleSelect",
    valueOptions: getEnumNames(ApplicationAssessmentThisYearType),
    description: "Penetration test status for this year.",
    headerAlign: "center",
    align: "center",
    controlType: "Autocomplete",
    readonly: true,
    options: getAutoCompleteOptions(ApplicationAssessmentThisYearType),
    noSubmit: true,
  },
  {
    field: "periodicity_parameter",
    headerName: "Parameter",
    type: "singleSelect",
    valueOptions: getEnumNames(PeriodicityParameterType),
    description: "Specifies how the testing periodicity was calculated.",
    headerAlign: "center",
    align: "center",
    width: 170,
    controlType: "Autocomplete",
    options: getAutoCompleteOptions(PeriodicityParameterType),
    readonly: true,
    noSubmit: true,
  },
  {
    field: "in_scoped",
    headerName: "In Scope",
    type: "boolean",
    description:
      "Specifies whether periodicity calculation applies to this application.",
    headerAlign: "center",
    align: "center",
    width: 170,
    controlType: "Switch",
    getFinalValue(value: StateContentTypes) {
      return getBoolean(value);
    },
  },
  {
    field: "manual_pentest_periodicity",
    headerName: "Manual PT Periodicity",
    type: "singleSelect",
    description: "Defines a manual penetration test periodicity.",
    width: 170,
    controlType: "TextField",
    isValid(value: StateContentTypes) {
      return value === null || value === undefined || isValidNumber(value);
    },
    getFinalValue(value: StateContentTypes) {
      return getNumber(value);
    },
  },
  {
    field: "periodicity_details",
    headerName: "Periodicity Details",
    type: "string",
    description:
      "A general description about the defined periodicity configuration.",
    errorText:
      "This field is required when field 'Manual PT Periodicity' is set.",
    width: 250,
    controlType: "TextField",
    minRows: 4,
    maxRows: 4,
    isValid(value: StateContentTypes, state: IPageManagerState) {
      const result =
        state.content.manual_pentest_periodicity &&
        (value ?? "").trim().length === 0;
      return !result;
    },
  },
  {
    field: "description",
    hideColumn: true,
    headerName: "Description",
    type: "string",
    description: "A general description about the application.",
    errorText: "This field is required and cannot be empty.",
    width: 250,
    controlType: "TextField",
    minRows: 4,
    maxRows: 4,
  },
  {
    field: "inventory_tags",
    headerName: "Categorization",
    type: "string",
    description: "List of tags provided by the inventory application.",
    width: 250,
    controlType: "Autocomplete",
    apiEndpoint: URL_APPLICATION_TAGS_INVENTORY,
    queryKey: queryKeyApplicationTagsInventory,
    freeSolo: true,
    multiSelect: true,
    getFinalValue(value: StateContentTypes) {
      return getArrayAutoCompleteEnumId(value);
    },
  },
  {
    field: "classification_tags",
    headerName: "Classifications",
    type: "string",
    description: "Defines how the application is classified.",
    width: 250,
    controlType: "Autocomplete",
    apiEndpoint: URL_APPLICATION_TAGS_CLASSIFICATION,
    queryKey: queryKeyApplicationTagsClassification,
    freeSolo: true,
    multiSelect: true,
    getFinalValue(value: StateContentTypes) {
      return getArrayAutoCompleteEnumId(value);
    },
  },
  {
    field: "deployment_model_tags",
    headerName: "Deployment Model",
    type: "string",
    description: "Defines how/where the application is operated.",
    width: 250,
    controlType: "Autocomplete",
    apiEndpoint: URL_APPLICATION_TAGS_DEPLOYMENT_MODEL,
    queryKey: queryKeyApplicationTagsDeploymentModel,
    freeSolo: true,
    multiSelect: true,
    getFinalValue(value: StateContentTypes) {
      return getArrayAutoCompleteEnumId(value);
    },
  },
  {
    field: "general_tags",
    headerName: "General Tags",
    type: "string",
    description: "General tags that can be defined by users.",
    width: 250,
    controlType: "Autocomplete",
    apiEndpoint: URL_APPLICATION_TAGS_GENERAL,
    queryKey: queryKeyApplicationTagsGeneral,
    freeSolo: true,
    multiSelect: true,
    getFinalValue(value: StateContentTypes) {
      return getArrayAutoCompleteEnumId(value);
    },
  },
];

export class ApplicationLookup {
  public id: string;
  public label: string;
  public app_id: string;

  constructor(userData: any) {
    this.id = userData.id;
    this.label = userData.label;
    this.app_id = userData.app_id;
  }
}

export class ApplicationRead extends NamedModelBase {
  public application_id: string;
  public state: AutoCompleteOption | null;
  public pentest_periodicity: number | null;
  public description: string;
  public last_pentest: Date | null;
  public next_pentest: Date | null;
  public overdue: AutoCompleteOption | null;
  public owner: { id: string; name: string };
  public manager: { id: string; name: string };
  public general_tags: TagLookup[];
  public inventory_tags: TagLookup[];
  public classification_tags: TagLookup[];
  public deployment_model_tags: TagLookup[];
  public in_scoped: boolean;
  public manual_pentest_periodicity: AutoCompleteOption | null;
  public periodicity_parameter: AutoCompleteOption | null;
  public periodicity_details: string | null;
  public pentest_this_year: ApplicationAssessmentThisYearType;

  constructor(userData: any) {
    super(userData.name, userData.id);
    this.application_id = userData.application_id;
    this.state = getAutoCompleteOption(ApplicationState, userData.state);
    this.pentest_periodicity = userData.pentest_periodicity;
    this.description = userData.description;
    this.owner = userData.owner;
    this.manager = userData.manager;
    this.last_pentest = userData.last_pentest;
    this.next_pentest = userData.next_pentest;
    this.overdue = getAutoCompleteOption(OverdueType, userData.overdue);
    this.general_tags = userData.general_tags;
    this.inventory_tags = userData.inventory_tags;
    this.classification_tags = userData.classification_tags;
    this.deployment_model_tags = userData.deployment_model_tags;
    this.in_scoped = userData.in_scope;
    this.manual_pentest_periodicity = userData.manual_pentest_periodicity;
    this.periodicity_parameter = getAutoCompleteOption(
      PeriodicityParameterType,
      userData.periodicity_parameter
    );
    this.periodicity_details = userData.periodicity_details;
    this.pentest_this_year = getAutoCompleteOption(
      ApplicationAssessmentThisYearType,
      userData.pentest_this_year ?? 0
    );
  }

  getQueryId() {
    return this.application_id;
  }
}
