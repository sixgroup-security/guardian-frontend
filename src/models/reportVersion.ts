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

import { URL_REPORTS } from "./report";
import {
  ReportCreationStatus,
  ReportVersionStatus,
  getAutoCompleteOption,
  getEnumNames,
} from "./enums";
import {
  ModelBase,
  GridColInputControlProps,
  StateContentTypes,
  isValidString,
  isNotNullUndefined,
  getSingleAutoCompleteEnumId,
  getNumber,
  isValidNumber,
} from "./common";

// Query keys for projects
export const queryKeyReportVersions = ["report_version"];
export const URL_REPORT_VERSIONS = URL_REPORTS + "/{project_id}/versions";

// Valid types are: export type GridNativeColTypes = 'string' | 'number' | 'date' | 'dateTime' | 'boolean' | 'singleSeleact' | 'actions';
export const COLUMN_DEFINITION: GridColInputControlProps[] = [
  {
    field: "id",
    hideColumn: true,
    controlType: null,
  },
  {
    field: "user",
    hideColumn: true,
    controlType: null,
    noSubmit: true,
  },
  {
    field: "has_pdf",
    hideColumn: true,
    controlType: null,
    noSubmit: true,
  },
  {
    field: "has_xlsx",
    hideColumn: true,
    controlType: null,
    noSubmit: true,
  },
  {
    field: "has_pdf_log",
    hideColumn: true,
    controlType: null,
    noSubmit: true,
  },
  {
    field: "has_tex",
    hideColumn: true,
    controlType: null,
    noSubmit: true,
  },
  {
    field: "version",
    headerName: "Version",
    type: "number",
    description: "The current version number.",
    errorText: "This field is optional and numeric.",
    headerAlign: "center",
    align: "center",
    width: 120,
    controlType: "TextField",
    required: true,
    isValid(value: StateContentTypes) {
      return value === null || value === undefined || isValidNumber(value);
    },
    getFinalValue(value: StateContentTypes) {
      return getNumber(value);
    },
  },
  {
    field: "report_date",
    headerName: "Date",
    type: "date",
    description: "The date the version was created.",
    errorText: "This field is required and must contain a valid date.",
    controlType: "DatePicker",
  },
  {
    field: "status",
    headerName: "Status",
    type: "singleSelect",
    valueOptions: getEnumNames(ReportVersionStatus),
    description: "The report version's status.",
    errorText: "This field is required and cannot be empty.",
    headerAlign: "center",
    align: "center",
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
    field: "creation_status",
    headerName: "Report Creation",
    type: "singleSelect",
    valueOptions: getEnumNames(ReportCreationStatus),
    description: "The report creation status.",
    headerAlign: "center",
    align: "center",
    width: 120,
    controlType: null,
  },
  {
    field: "comment",
    headerName: "Description",
    type: "string",
    description: "Details about the version.",
    errorText: "This field is required and cannot be empty.",
    controlType: "TextField",
    required: true,
    width: 200,
    isValid(value: StateContentTypes) {
      return isValidString(value);
    },
  },
  {
    field: "username",
    headerName: "Reviewer",
    type: "string",
    description: "The creator/reviewer of the version.",
    errorText: "This field is required and cannot be empty.",
    controlType: "TextField",
    required: true,
    width: 200,
    isValid(value: StateContentTypes) {
      return isValidString(value);
    },
  },
];

export class ReportVersionRead extends ModelBase {
  public comment: string;
  public version: number;
  public username: string;
  public user: { id: string; label: string };
  public status: { id: ReportVersionStatus; label: string };
  public creation_status: { id: ReportCreationStatus; label: string };
  public report_date: Date;
  public has_pdf: boolean;
  public has_xlsx: boolean;
  public has_pdf_log: boolean;
  public has_tex: boolean;

  constructor(userData: any) {
    super(userData.id);
    this.comment = userData.comment;
    this.version = userData.version;
    this.username = userData.username;
    this.user = userData.user;
    this.report_date = new Date(userData.report_date);
    this.status =
      typeof userData.status === "number"
        ? getAutoCompleteOption(ReportVersionStatus, userData.status)
        : userData.status;
    this.creation_status =
      typeof userData.status === "number"
        ? getAutoCompleteOption(ReportCreationStatus, userData.creation_status)
        : userData.creation_status;
    this.has_pdf = userData.has_pdf;
    this.has_xlsx = userData.has_xlsx;
    this.has_pdf_log = userData.has_pdf_log;
    this.has_tex = userData.has_tex;
  }
}
