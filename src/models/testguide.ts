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
} from "./common";
import { URL_PATH_PREFIX } from "../util/consts/common";

// Query keys for test guides
export const queryKeyPenTestTestGuides = ["playbooks", "pentest"];

// REST API endpoints for test guides
const URL_PATH_TEST_GUIDES_PREFIX = URL_PATH_PREFIX + "/playbooks";
export const URL_PENTEST_TEST_GUIDES = URL_PATH_TEST_GUIDES_PREFIX + "/pentest";
export const URL_PENTEST_TEST_GUIDES_LOOKUP =
  URL_PENTEST_TEST_GUIDES + "/lookup";

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
    description: "The name of the test guide.",
    errorText: "This field is required and cannot be empty.",
    width: 400,
    controlType: "TextField",
    required: true,
    isValid(value: StateContentTypes) {
      return isValidString(value);
    },
  },
  {
    field: "test_procedure_count",
    headerName: "No. Procedures",
    type: "number",
    description: "Number of test procedures associated with this playbook.",
    controlType: "TextField",
    width: 200,
  },
  {
    field: "structure",
    hideColumn: true,
    controlType: null,
  },
];

export const SECTION_ATTRIBUTES: GridColInputControlProps[] = [
  {
    field: "id",
    hideColumn: true,
    controlType: null,
  },
  {
    field: "title",
    headerName: "Section title",
    type: "string",
    description: "The title of the test guide section.",
    errorText: "This field is required and cannot be empty.",
    controlType: "TextField",
    required: true,
    multiLanguage: true,
    isValid(value: StateContentTypes) {
      return isValidString(value);
    },
  },
  {
    field: "description",
    headerName: "Description",
    type: "string",
    description: "Description for the section.",
    errorText: "This field is required and cannot be empty.",
    controlType: "TextField",
    required: false,
    multiLanguage: true,
    minRows: 4,
    maxRows: 4,
  },
];

export class TestGuideRead extends NamedModelBase {
  public structure: any[];
  public test_procedure_count: number;

  constructor(userData: any) {
    super(userData.name, userData.id);
    this.test_procedure_count = userData.test_procedure_count;
    this.structure = userData.structure;
  }
}

export class TestGuideLookup extends NamedModelBase {
  constructor(userData: any) {
    super(userData.name, userData.id);
  }
}
