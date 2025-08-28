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
  getArrayAutoCompleteEnumId,
} from "./common";
import { URL_PATH_PREFIX } from "../util/consts/common";
import { URL_PATH_TAGS_PREFIX } from "./project";
import { TagLookup } from "./tagging/tag";

// Query keys for test procedures
export const queryKeyTestProcedures = ["test-procedures"];
// Query keys for test procedures tags
export const queryKeyTestProcedureTagsGeneral = ["measure_tags", "general"];

// Test procedures REST API endpoints
const URL_PATH_TEST_PROCEDURES_PREFIX = URL_PATH_PREFIX + "/test-procedures";
export const URL_TEST_PROCEDURES_PREFIX = URL_PATH_TEST_PROCEDURES_PREFIX;
export const URL_VULNERABILITY_TEMPLATES_PREFIX =
  URL_PATH_TEST_PROCEDURES_PREFIX + "/{procedure_id}/vulnerability-templates";
export const URL_TEST_PROCEDURE_FILES =
  URL_TEST_PROCEDURES_PREFIX + "/{template_id}/files";

// REST API endpoints for test procedures tags
const URL_PATH_TEST_PROCEDURE_TAGS_PREFIX =
  URL_PATH_TAGS_PREFIX + "/test-procedure";
export const URL_PATH_TEST_PROCEDURE_TAGS_GENERAL =
  URL_PATH_TEST_PROCEDURE_TAGS_PREFIX + "/general";
export const URL_TEST_PROCEDURES = URL_PATH_TEST_PROCEDURES_PREFIX;

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
    description: "The title of the procedure.",
    errorText: "This field is required and cannot be empty.",
    width: 300,
    controlType: "TextField",
    required: true,
    isValid(value: StateContentTypes) {
      return isValidString(value);
    },
  },
  {
    field: "hints",
    headerName: "Testing Hints",
    hideColumn: true,
    description: "Hints for testing the procedure.",
    controlType: "MarkdownEditor",
    required: false,
  },
  // Multi-language fields
  {
    field: "objective",
    headerName: "Objective",
    hideColumn: true,
    type: "string",
    description: "Description of this test procedure's test objective.",
    errorText: "This field is required and cannot be empty.",
    controlType: "MarkdownEditor",
    markdownMaxHeight: "200px",
    uploadUrl: undefined,
    multiLanguage: true,
  },
  {
    field: "playbook_count",
    headerName: "No. Playbooks",
    width: 200,
    type: "number",
    description: "Number of playbooks using this test procedure.",
    controlType: "TextField",
  },
  {
    field: "vulnerability_count",
    headerName: "No. Vulnerability Templates",
    width: 200,
    type: "number",
    description:
      "Number of vulnerability templates associated with this test procedure.",
    controlType: "TextField",
  },
  {
    field: "general_tags",
    headerName: "Tags",
    type: "string",
    description: "General tags for the measure.",
    width: 350,
    controlType: "Autocomplete",
    apiEndpoint: URL_PATH_TEST_PROCEDURE_TAGS_GENERAL,
    queryKey: queryKeyTestProcedureTagsGeneral,
    freeSolo: true,
    multiSelect: true,
    getFinalValue(value: StateContentTypes) {
      return getArrayAutoCompleteEnumId(value);
    },
  },
];

export class TestProcedureRead extends NamedModelBase {
  public hints: string;
  public playbook_count: number;
  public vulnerability_count: number;
  public objective: { [key: string]: string };
  public general_tags: TagLookup[];

  constructor(userData: any) {
    super(userData.name, userData.id);
    this.hints = userData.hints;
    this.objective = userData.objective;
    this.playbook_count = userData.playbook_count;
    this.vulnerability_count = userData.vulnerability_count;
    this.general_tags = userData.general_tags ?? [];
  }
}
