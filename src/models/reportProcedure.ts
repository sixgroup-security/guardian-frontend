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
  StateContentTypes,
  NamedModelBase,
  isNotNullUndefined,
  getSingleAutoCompleteEnumId,
  GridColInputControlProps,
} from "./common";
import {
  AutoCompleteEnumType,
  getAutoCompleteOption,
  getEnumNames,
} from "./enums";
import { ProcedureStatus } from "./enums";

export const queryKeyReportProcedure = ["reportprocedure"];

export const COLUMN_DEFINITION: GridColInputControlProps[] = [
  {
    field: "id",
    hideColumn: true,
    controlType: null,
  },
  {
    field: "source_template_id",
    hideColumn: true,
    controlType: null,
  },
  {
    field: "name",
    hideColumn: true,
    controlType: null,
  },
  {
    field: "status",
    headerName: "Status",
    type: "singleSelect",
    valueOptions: getEnumNames(ProcedureStatus),
    description: "The procedures's testing status.",
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
    field: "objective",
    headerName: "Objective",
    type: "string",
    description: "The procedure's test objective.",
    controlType: "TextField",
    minRows: 5,
    maxRows: 5,
  },
  {
    field: "internal_documentation",
    headerName: "Internal Documentation",
    type: "string",
    description: "Can be used to take notes and document test results.",
    controlType: "MarkdownEditor",
    markdownEditorMode: "Popout",
    markdownMaxHeight: "300px",
  },
  {
    field: "hints",
    headerName: "Testing Guidelines",
    type: "string",
    description: "The procedure's testing guidelines.",
    controlType: "MarkdownField",
  },
];

export class ReportProcedureRead extends NamedModelBase {
  public status: AutoCompleteEnumType;
  public hints: string;
  public objective: string;
  public internal_documentation?: string;

  constructor(userData: any) {
    super(userData.name, userData.id);
    this.status =
      typeof userData.status === "number"
        ? getAutoCompleteOption(ProcedureStatus, userData.status)
        : userData.status;
    this.hints = userData.hints ?? "";
    this.objective = userData.objective ?? "";
    this.internal_documentation = userData.internal_documentation ?? "";
  }
}
