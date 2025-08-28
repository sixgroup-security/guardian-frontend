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
  AutoCompleteEnumType,
  ProjectType,
  getAutoCompleteOption,
  getEnumNames,
} from "./enums";
import {
  NamedModelBase,
  GridColInputControlProps,
  StateContentTypes,
  isValidString,
  isNonEmptyArray,
  getArrayAutoCompleteEnumId,
  ModelBase,
} from "./common";
import { URL_PATH_PREFIX } from "../util/consts/common";
import { ReportTestingRead } from "./report";
import { URL_PATH_TAGS_PREFIX } from "./project";
import { TagLookup } from "./tagging/tag";

// Query keys for measures
export const queryKeyMeasures = ["measures"];
export const queryKeyMeasuresLookup = ["measures", "lookup"];

// Query keys for measure tags
export const queryKeyMeasureTagsGeneral = ["measure_tags", "general"];

// Measure REST API endpoints
const URL_PATH_MEASURES_PREFIX = URL_PATH_PREFIX + "/measures";
export const URL_MEASURES = URL_PATH_MEASURES_PREFIX;
export const URL_MEASURES_PENTEST_LOOKUP =
  URL_PATH_MEASURES_PREFIX + "/pentest/lookup";

// REST API endpoints for project tags
const URL_PATH_MEASURE_TAGS_GENERAL =
  URL_PATH_TAGS_PREFIX + "/measures/general";

// Valid types are: export type GridNativeColTypes = 'string' | 'number' | 'date' | 'dateTime' | 'boolean' | 'singleSelect' | 'actions';
export const COLUMN_DEFINITION: GridColInputControlProps[] = [
  {
    field: "id",
    hideColumn: true,
    controlType: null,
  },
  {
    field: "name",
    headerName: "Name",
    type: "string",
    description: "The name of the measure.",
    errorText: "This field is required and cannot be empty.",
    width: 350,
    controlType: "TextField",
    required: true,
    isValid(value: StateContentTypes) {
      return isValidString(value);
    },
  },
  {
    field: "project_types",
    headerName: "Type",
    type: "singleSelect",
    valueOptions: getEnumNames(ProjectType),
    description: "Specifies the type of the project's underlying test.",
    errorText: "This field is required and cannot be empty.",
    width: 350,
    controlType: "Autocomplete",
    required: true,
    multiSelect: true,
    isValid(value: StateContentTypes) {
      return isNonEmptyArray(value);
    },
    getFinalValue(value: StateContentTypes) {
      return getArrayAutoCompleteEnumId(value);
    },
  },
  {
    field: "recommendation",
    headerName: "Recommendation",
    type: "string",
    description: "The measure's recommendation.",
    errorText: "This field is required and cannot be empty.",
    width: 350,
    controlType: "MarkdownEditor",
    markdownMaxHeight: "500px",
    required: true,
    uploadUrl: undefined,
    // hideColumn: true,
    multiLanguage: true,
    isValid(value: StateContentTypes) {
      return isValidString(value);
    },
  },
  {
    field: "vulnerability_count",
    headerName: "No. Vulnerabilities",
    type: "number",
    description: "Number of vulnerabilities associated with this measure.",
    controlType: "TextField",
    width: 200,
  },
  {
    field: "general_tags",
    headerName: "Tags",
    type: "string",
    description: "General tags for the measure.",
    width: 350,
    controlType: "Autocomplete",
    apiEndpoint: URL_PATH_MEASURE_TAGS_GENERAL,
    queryKey: queryKeyMeasureTagsGeneral,
    freeSolo: true,
    multiSelect: true,
    getFinalValue(value: StateContentTypes) {
      return getArrayAutoCompleteEnumId(value);
    },
  },
];

export const COLUMN_DEFINITION_VULNERABILITY_MEASURE_LOOKUP: GridColInputControlProps[] =
  [
    {
      field: "id",
      hideColumn: true,
      controlType: null,
    },
    {
      field: "name",
      headerName: "Name",
      type: "string",
      description: "The name of the measure.",
      errorText: "This field is required and cannot be empty.",
      width: 350,
      controlType: "TextField",
      required: true,
      isValid(value: StateContentTypes) {
        return isValidString(value);
      },
    },
    {
      field: "recommendation",
      headerName: "Recommendation",
      type: "string",
      description: "The measure's recommendation.",
      errorText: "This field is required and cannot be empty.",
      width: 350,
      controlType: "MarkdownEditor",
      markdownMaxHeight: "500px",
      required: true,
      uploadUrl: undefined,
      isValid(value: StateContentTypes) {
        return isValidString(value);
      },
    },
  ];

export class MeasureLookup extends ModelBase {
  public name: string;
  public recommendation: string;

  constructor(userData: any) {
    super(userData.id);
    this.name = userData.name;
    this.recommendation = userData.recommendation;
  }
}

export class MeasureResolveLookup extends MeasureLookup {
  constructor(userData: MeasureRead, report: ReportTestingRead) {
    const name = userData.name;
    const recommendation =
      userData.recommendation[report.report_language?.language_code ?? ""] ??
      "";
    super({ id: userData.id, name, recommendation });
  }
}

export class VulnerabilityMeasureLookup extends ModelBase {
  public name: string;
  public description: string;

  constructor(userData: any) {
    super(userData.id);
    this.name = userData.name;
    this.description = userData.description;
  }
}

export class MeasureRead extends NamedModelBase {
  public project_types: AutoCompleteEnumType[];
  public general_tags: TagLookup[];
  public recommendation: { [key: string]: string };
  public vulnerability_count: number;

  constructor(userData: any) {
    super(userData.name, userData.id);
    if (
      Array.isArray(userData.project_types) &&
      userData.project_types.length > 0 &&
      typeof userData.project_types[0] === "number"
    ) {
      this.project_types = userData.project_types.map((x: number) =>
        getAutoCompleteOption(ProjectType, x)
      );
    } else {
      this.project_types = userData.project_types ?? [];
    }
    this.general_tags = userData.general_tags ?? [];
    this.recommendation = userData.recommendation;
    this.vulnerability_count = userData.vulnerability_count;
  }
}
