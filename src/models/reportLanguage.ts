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
  NamedModelBase,
  GridColInputControlProps,
  StateContentTypes,
  isValidString,
  isValidBoolean,
  getBoolean,
  isNotNullUndefined,
  getSingleAutoCompleteEnumId,
} from "./common";
import { URL_PATH_PREFIX, APP_API_URL } from "../util/consts/common";

// Query keys for languages
export const queryKeyReportLanguages = ["languages"];

const URL_PATH_REPORT_LANGUAGES_PREFIX = URL_PATH_PREFIX + "/languages";
export const URL_REPORT_LANGUAGES = URL_PATH_REPORT_LANGUAGES_PREFIX;
export const URL_REPORT_LANGUAGES_LOOKUP =
  URL_PATH_REPORT_LANGUAGES_PREFIX + "/lookup";

// Country REST API endpoints
const URL_PATH_COUNTRIES_PREFIX = URL_PATH_PREFIX + "/countries";
export const URL_COUNTRIES_FLAG =
  APP_API_URL + URL_PATH_COUNTRIES_PREFIX + "/svg";
export const URL_COUNTRIES = URL_PATH_COUNTRIES_PREFIX;

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
    description: "The name of the report language.",
    errorText: "This field is required and cannot be empty.",
    width: 300,
    controlType: "TextField",
    required: true,
    isValid(value: StateContentTypes) {
      return isValidString(value);
    },
  },
  {
    field: "language_code",
    headerName: "Code",
    type: "string",
    description: "The code of the report language.",
    errorText: "This field is required and cannot be empty.",
    headerAlign: "center",
    align: "center",
    width: 100,
    controlType: "TextField",
    required: true,
    isValid(value: StateContentTypes) {
      return isValidString(value);
    },
  },
  {
    field: "is_default",
    headerName: "Main Language",
    type: "boolean",
    description: "The main language used.",
    errorText: "The checkbox is currently undefined. Check or uncheck it.",
    headerAlign: "center",
    align: "center",
    width: 150,
    controlType: "Checkbox",
    required: true,
    isValid(value: StateContentTypes) {
      return isValidBoolean(value);
    },
    getFinalValue(value: StateContentTypes) {
      return getBoolean(value);
    },
  },
  {
    field: "country",
    headerName: "Country",
    type: "string",
    description: "The language's country.",
    errorText: "This field is required and cannot be empty.",
    headerAlign: "center",
    align: "center",
    width: 90,
    controlType: "CountrySelect",
    required: true,
    isValid(value: StateContentTypes) {
      return isNotNullUndefined(value);
    },
    getFinalValue(value: StateContentTypes) {
      return getSingleAutoCompleteEnumId(value);
    },
  },
];

export class ReportLanguageLookup {
  id: string;
  name: string;
  is_default: boolean;
  language_code: string;
  country_code: string;

  constructor(userData: any) {
    this.id = userData.id;
    this.name = userData.name;
    this.is_default = userData.is_default;
    this.language_code = userData.language_code;
    this.country_code = userData.country_code;
  }
}

export class ReportLanguage extends NamedModelBase {
  public language_code: string;
  public is_default: boolean;
  public country: string;

  constructor(userData: any) {
    super(userData.name, userData.id);
    this.language_code = userData.language_code;
    this.is_default = userData.is_default;
    this.country = userData.country;
  }
}
