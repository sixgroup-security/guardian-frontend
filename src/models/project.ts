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
  AutoCompleteOption,
  ProjectState,
  ProjectType,
  getAutoCompleteOption,
  getAutoCompleteOptions,
  getEnumNames,
} from "./enums";
import {
  NamedModelBase,
  GridColInputControlProps,
  StateContentTypes,
  isValidString,
  isValidDate,
  isNotNullUndefined,
  getSingleAutoCompleteEnumId,
  getArrayAutoCompleteEnumId,
} from "./common";
import { Comment } from "./comment";
import { ReportLookup } from "./report";
import {
  URL_PATH_PREFIX,
  CUSTOMER_TITLE_NAME,
  MANAGER_ROLE_NAME,
} from "../util/consts/common";
import {
  ApplicationLookup,
  URL_APPLICATIONS_LOOKUP,
  queryKeyApplicationsLookup,
} from "./application/application";
import { URL_MANAGERS, UserLookup, queryKeyManagers } from "./user";
import { EntityLookup } from "./entity/entity";
import { TagLookup } from "./tagging/tag";
import { URL_COUNTRIES, URL_COUNTRIES_FLAG } from "./reportLanguage";
import { URL_CUSTOMERS, queryKeyCustomers } from "./entity/customer";
import { URL_PROVIDERS, queryKeyProviders } from "./entity/provider";
import { CountryLookup } from "./country";

// Query keys for projects
export const queryKeyProjects = ["projects"];
export const queryKeyProjectYears = [...queryKeyProjects, "years"];

// Query keys for project tags
export const queryKeyProjectTagsReasons = ["project_tags", "reason"];
export const queryKeyProjectTagsGeneral = ["project_tags", "general"];
export const queryKeyProjectTagsClassifications = [
  "project_tags",
  "classifications",
];
export const queryKeyProjectTagsEnvironments = ["project_tags", "environment"];

// REST API endpoints for projects
const URL_PATH_PROJECTS_PREFIX = URL_PATH_PREFIX + "/projects";
export const URL_PROJECTS = URL_PATH_PROJECTS_PREFIX;
export const URL_PROJECT_YEARS = URL_PATH_PROJECTS_PREFIX + "/years";
export const URL_PROJECT_REPORTS = URL_PATH_PROJECTS_PREFIX + "/reports";
export const URL_PROJECT_COMMENTS =
  URL_PATH_PROJECTS_PREFIX + "/{project_id}/comments";

// REST API endpoints for project tags
export const URL_PATH_TAGS_PREFIX = URL_PATH_PREFIX + "/tags";
const URL_PATH_PROJECT_TAGS_PREFIX = URL_PATH_TAGS_PREFIX + "/projects";
export const URL_PROJECT_TAGS_GENERAL =
  URL_PATH_PROJECT_TAGS_PREFIX + "/general";
export const URL_PROJECT_TAGS_REASONS =
  URL_PATH_PROJECT_TAGS_PREFIX + "/reasons";
export const URL_PROJECT_TAGS_ENVIRONMENTS =
  URL_PATH_PROJECT_TAGS_PREFIX + "/environments";
export const URL_PROJECT_TAGS_CLASSIFICATIONS =
  URL_PATH_PROJECT_TAGS_PREFIX + "/classifications";

// Valid types are: export type GridNativeColTypes = 'string' | 'number' | 'date' | 'dateTime' | 'boolean' | 'singleSelect' | 'actions';
export const COLUMN_DEFINITION: GridColInputControlProps[] = [
  {
    field: "id",
    hideColumn: true,
    controlType: null,
  },
  {
    field: "project_id",
    headerName: "ID",
    type: "string",
    description: "ID that uniquely identifies the project.",
    errorText: "This field is required and cannot be empty.",
    width: 160,
    controlType: "TextField",
    readonly: true,
    required: false,
  },
  {
    field: "name",
    headerName: "Name",
    type: "string",
    description: "The name of the project.",
    errorText: "This field is required and cannot be empty.",
    width: 250,
    controlType: "TextField",
    required: true,
    isValid(value: StateContentTypes) {
      return isValidString(value);
    },
  },
  {
    field: "project_type",
    headerName: "Type",
    type: "singleSelect",
    valueOptions: getEnumNames(ProjectType),
    description: "Specifies the type of the project's underlying test.",
    errorText: "This field is required and cannot be empty.",
    headerAlign: "center",
    align: "center",
    width: 160,
    controlType: "Autocomplete",
    options: getAutoCompleteOptions(ProjectType),
    required: true,
    isValid(value: StateContentTypes) {
      return isNotNullUndefined(value);
    },
    getFinalValue(value: StateContentTypes) {
      return getSingleAutoCompleteEnumId(value);
    },
  },
  {
    field: "state",
    headerName: "State",
    type: "singleSelect",
    valueOptions: getEnumNames(ProjectState),
    description: "The project's current status.",
    errorText: "This field is required and cannot be empty.",
    headerAlign: "center",
    align: "center",
    width: 150,
    controlType: "Autocomplete",
    options: getAutoCompleteOptions(ProjectState),
    required: true,
    isValid(value: StateContentTypes) {
      return isNotNullUndefined(value);
    },
    getFinalValue(value: StateContentTypes) {
      return getSingleAutoCompleteEnumId(value);
    },
  },
  {
    field: "location",
    headerName: "Location",
    type: "string",
    description: "The project's main execution location.",
    errorText: "This field is required and cannot be empty.",
    headerAlign: "center",
    align: "center",
    width: 90,
    controlType: "CountrySelect",
    apiEndpoint: URL_COUNTRIES,
    imageApiEndpoint: URL_COUNTRIES_FLAG,
    getOptionLabel(option) {
      return option?.name ?? "";
    },
    required: true,
    isValid(value: StateContentTypes) {
      return isNotNullUndefined(value);
    },
    getFinalValue(value: StateContentTypes) {
      return getSingleAutoCompleteEnumId(value);
    },
  },
  {
    field: "applications",
    headerName: "Applications",
    type: "string",
    description: "Applications in scope of the project.",
    width: 250,
    controlType: "Autocomplete",
    apiEndpoint: URL_APPLICATIONS_LOOKUP,
    queryKey: queryKeyApplicationsLookup,
    isOptionEqualToValue: (
      option: StateContentTypes,
      value: StateContentTypes
    ) => option.id === value.id,
    multiSelect: true,
    getFinalValue(value: StateContentTypes) {
      return getArrayAutoCompleteEnumId(value);
    },
  },
  {
    field: "manager",
    headerName: MANAGER_ROLE_NAME,
    type: "string",
    description: "The person responsible for the project.",
    width: 150,
    controlType: "Autocomplete",
    apiEndpoint: URL_MANAGERS,
    queryKey: queryKeyManagers,
    getFinalValue(value: StateContentTypes) {
      return getSingleAutoCompleteEnumId(value);
    },
  },
  {
    field: "customer",
    headerName: CUSTOMER_TITLE_NAME,
    type: "string",
    description: `${CUSTOMER_TITLE_NAME} for which the project is executed.`,
    errorText: "This field is required and cannot be empty.",
    width: 150,
    controlType: "Autocomplete",
    apiEndpoint: URL_CUSTOMERS,
    queryKey: queryKeyCustomers,
    getOptionLabel(option) {
      return option?.name ?? "";
    },
    required: false,
    getFinalValue(value: StateContentTypes) {
      return getSingleAutoCompleteEnumId(value);
    },
  },
  {
    field: "provider",
    headerName: "Provider",
    type: "string",
    description: "The service provider executing the project.",
    width: 150,
    controlType: "Autocomplete",
    apiEndpoint: URL_PROVIDERS,
    queryKey: queryKeyProviders,
    getOptionLabel(option) {
      return option?.name ?? "";
    },
    getFinalValue(value: StateContentTypes) {
      return getSingleAutoCompleteEnumId(value);
    },
  },
  {
    field: "lead_tester",
    headerName: "Lead Tester",
    type: "string",
    hideColumn: false,
    description: "The tester in charge of executing the project.",
    errorText: "This field is required and cannot be empty.",
    width: 200,
    controlType: "Autocomplete",
    required: false,
    /*isValid(value: StateContentTypes) {
      return isNotNullUndefined(value);
    },*/
    getFinalValue(value: StateContentTypes) {
      return getSingleAutoCompleteEnumId(value);
    },
  },
  {
    field: "testers",
    hideColumn: true,
    headerName: "Additional Testers",
    type: "string",
    description: "Additional testers assigned to the project.",
    controlType: "Autocomplete",
    multiSelect: true,
    getFinalValue(value: StateContentTypes) {
      return getArrayAutoCompleteEnumId(value);
    },
  },
  {
    field: "start_date",
    headerName: "Start Date",
    type: "date",
    description: "The project's scheduled start date.",
    errorText: "This field is required and must contain a valid date.",
    controlType: "DatePicker",
    required: true,
    isValid(value: StateContentTypes) {
      return isValidDate(value);
    },
  },
  {
    field: "end_date",
    headerName: "End Date",
    type: "date",
    description: "The project's scheduled end date.",
    controlType: "DatePicker",
  },
  {
    field: "completion_date",
    headerName: "Completion Date",
    type: "date",
    description: "The project's actual completion date.",
    controlType: "DatePicker",
  },
  {
    field: "classifications",
    headerName: "Classifications",
    type: "string",
    description: "The applications' classification at the time of the project.",
    controlType: "Autocomplete",
    apiEndpoint: URL_PROJECT_TAGS_CLASSIFICATIONS,
    queryKey: queryKeyProjectTagsClassifications,
    freeSolo: true,
    multiSelect: true,
    getFinalValue(value: StateContentTypes) {
      return getArrayAutoCompleteEnumId(value);
    },
  },
  {
    field: "reasons",
    headerName: "Test Reasons",
    type: "string",
    description: "The reasons (e.g. PCI-DSS) for testing the application.",
    controlType: "Autocomplete",
    apiEndpoint: URL_PROJECT_TAGS_REASONS,
    queryKey: queryKeyProjectTagsReasons,
    freeSolo: true,
    multiSelect: true,
    getFinalValue(value: StateContentTypes) {
      return getArrayAutoCompleteEnumId(value);
    },
  },
  {
    field: "environments",
    headerName: "Environments",
    type: "string",
    description:
      "The environments (e.g., Production) on which the test is executed.",
    controlType: "Autocomplete",
    apiEndpoint: URL_PROJECT_TAGS_ENVIRONMENTS,
    queryKey: queryKeyProjectTagsEnvironments,
    freeSolo: true,
    multiSelect: true,
    getFinalValue(value: StateContentTypes) {
      return getArrayAutoCompleteEnumId(value);
    },
  },
  {
    field: "tags",
    headerName: "Tags",
    type: "string",
    description: "General tags for the project.",
    controlType: "Autocomplete",
    apiEndpoint: URL_PROJECT_TAGS_GENERAL,
    queryKey: queryKeyProjectTagsGeneral,
    freeSolo: true,
    multiSelect: true,
    getFinalValue(value: StateContentTypes) {
      return getArrayAutoCompleteEnumId(value);
    },
  },
  {
    field: "reports",
    hideColumn: true,
    controlType: null,
  },
  {
    field: "comment",
    headerName: "Changelog comment",
    hideColumn: true,
    type: "string",
    description: "Leave a comment to describe your change.",
    errorText: "This field is required and cannot be empty.",
    width: 250,
    controlType: "MarkdownEditor",
    required: true,
    uploadUrl: undefined,
    markdownEditorMode: "Plain",
    isValid(value: StateContentTypes) {
      return isValidString(value);
    },
  },
  {
    field: "comments",
    required: false,
    hideColumn: true,
    controlType: null,
  },
];

export class ProjectLookup {
  public id: string;
  public label: string;
  public project_id: string;

  constructor(userData: any) {
    this.id = userData.id;
    this.label = userData.label;
    this.project_id = userData.app_id;
  }
}

export class ProjectRead extends NamedModelBase {
  public project_id: string;
  public project_type: AutoCompleteOption | null;
  public state: AutoCompleteOption | null;
  public applications: ApplicationLookup[];
  public manager?: UserLookup;
  public customer?: UserLookup;
  public provider?: EntityLookup;
  public start_date: Date;
  public end_date?: Date;
  public completion_date?: Date;
  public reasons?: TagLookup[];
  public environments?: TagLookup[];
  public classifications?: TagLookup[];
  public tags?: TagLookup[];
  public reports: ReportLookup[];
  public lead_tester: UserLookup;
  public testers: UserLookup[];
  public location?: CountryLookup;
  public comment: string;
  public comments: Comment[];

  constructor(userData: any) {
    super(userData.name, userData.id);
    this.project_id = userData.project_id;
    this.project_type = getAutoCompleteOption(
      ProjectType,
      userData.project_type
    );
    this.state = getAutoCompleteOption(ProjectState, userData.state);
    this.applications = userData.applications;
    this.manager = userData.manager;
    this.customer = userData.customer;
    this.provider = userData.provider;
    this.start_date = userData.start_date;
    this.end_date = userData.end_date;
    this.completion_date = userData.completion_date;
    this.reasons = userData.reasons;
    this.environments = userData.environments;
    this.classifications = userData.classifications;
    this.tags = userData.tags;
    this.reports = userData.reports ? [...userData.reports] : [];
    this.location = userData.location;
    this.lead_tester = userData.lead_tester;
    this.testers = userData.testers;
    this.comment = "";
    this.comments = userData.comments.map((item: any) => new Comment(item));
  }

  public getQueryId(): string {
    return this.project_id;
  }
}
