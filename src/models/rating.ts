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

import { SeverityType, getAutoCompleteOption, getEnumNames } from "./enums";
import {
  NamedModelBase,
  GridColInputControlProps,
  StateContentTypes,
  isValidString,
  isValidNumber,
  isNotNullUndefined,
  isValidCvss,
  getNumber,
  getSingleAutoCompleteEnumId,
} from "./common";
import { URL_VULNERABILITY_TEMPLATES_PREFIX } from "./vulnerabilityTemplate";

// Query keys for ratings
export const queryKeyRatings = ["ratings"];

const URL_PATH_RATINGS_PREFIX =
  URL_VULNERABILITY_TEMPLATES_PREFIX + "/:id/ratings";
export const URL_RATINGS = URL_PATH_RATINGS_PREFIX;

// Valid types are: export type GridNativeColTypes = 'string' | 'number' | 'date' | 'dateTime' | 'boolean' | 'singleSelect' | 'actions';
const COLUMN_DEFINITION_BASE: GridColInputControlProps[] = [
  {
    field: "id",
    hideColumn: true,
    controlType: null,
  },
  {
    field: "procedure_id",
    hideColumn: true,
    controlType: null,
  },
  {
    field: "name",
    headerName: "Name",
    type: "string",
    description: "The unique name of the rating.",
    errorText: "This field is required and cannot be empty.",
    width: 300,
    controlType: "TextField",
    required: true,
    isValid(value: StateContentTypes) {
      return isValidString(value);
    },
  },
  {
    field: "severity",
    headerName: "Severity",
    type: "singleSelect",
    valueOptions: getEnumNames(SeverityType),
    description: "The vulnerability's severity.",
    errorText: "This field is required and cannot be empty.",
    width: 100,
    controlType: "Autocomplete",
    required: true,
    isValid(value: StateContentTypes) {
      return isNotNullUndefined(value);
    },
    getFinalValue(value: StateContentTypes) {
      return getSingleAutoCompleteEnumId(value);
    },
  },
  {
    field: "cvss_score",
    headerName: "CVSS Score",
    type: "number",
    description: "The vulnerability's CVSS Score.",
    errorText: "This field can be empty or must be a number.",
    headerAlign: "center",
    align: "center",
    width: 100,
    controlType: "TextField",
    required: false,
    isValid(value: StateContentTypes) {
      return (
        (value === null || value === undefined || isValidNumber(value)) &&
        value >= 0 &&
        value <= 10
      );
    },
    getFinalValue(value: StateContentTypes) {
      return getNumber(value);
    },
  },
  {
    field: "cvss_vector",
    headerName: "CVSSv3.1 Vector",
    type: "string",
    description: "The vulnerability's CVSS vector string.",
    errorText: "This is not a valid CVSS 3.1 vector string.",
    width: 300,
    controlType: "TextField",
    isValid(value: StateContentTypes) {
      return isValidCvss(value);
    },
  },
  {
    field: "comment",
    headerName: "Comment",
    hideColumn: true,
    type: "string",
    description: "Background information for rating.",
    controlType: "MarkdownEditor",
    markdownMaxHeight: "200px",
    required: false,
    uploadUrl: undefined,
    multiLanguage: true,
  },
];

export const COLUMN_DEFINITION: GridColInputControlProps[] = [
  ...COLUMN_DEFINITION_BASE,
  {
    field: "comment",
    headerName: "Comment",
    hideColumn: true,
    type: "string",
    description: "Background information for rating.",
    controlType: "MarkdownEditor",
    markdownMaxHeight: "200px",
    required: false,
    uploadUrl: undefined,
    multiLanguage: true,
  },
];

export const COLUMN_DEFINITION_FOR_VULNERABILITIES: GridColInputControlProps[] =
  [
    ...COLUMN_DEFINITION_BASE,
    {
      field: "comment",
      headerName: "Comment",
      type: "string",
      description: "Background information for rating.",
      width: 300,
      controlType: "MarkdownEditor",
      markdownMaxHeight: "200px",
      required: false,
    },
  ];

export class RatingRead extends NamedModelBase {
  public procedure_id: string;
  public severity: { id: SeverityType; label: string } | null;
  public cvss_score: number;
  public cvss_vector: string;
  public comment: string;

  constructor(userData: any) {
    super(userData.name, userData.id);
    this.procedure_id = userData.procedure_id;
    this.severity =
      typeof userData.severity === "number"
        ? getAutoCompleteOption(SeverityType, userData.severity)
        : userData.severity;
    this.cvss_score = userData.cvss_score;
    this.cvss_vector = userData.cvss_vector;
    this.comment = userData.comment;
  }
}
