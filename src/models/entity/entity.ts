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
  isNotNullUndefined,
  getSingleAutoCompleteEnumId,
} from "../common";
import { URL_PATH_PREFIX } from "../../util/consts/common";

// Query keys for entities
export const queryKeyEntities = ["entities"];

// Entity REST API endpoints
const URL_PATH_ENTITIES_PREFIX = URL_PATH_PREFIX + "/entities";
export const URL_ENTITIES = URL_PATH_ENTITIES_PREFIX;

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
    description: "The name of the entity.",
    errorText: "This field is required and cannot be empty.",
    width: 250,
    controlType: "TextField",
    required: true,
    isValid(value: StateContentTypes) {
      return isValidString(value);
    },
  },
  {
    field: "abbreviation",
    headerName: "Abbreviation",
    type: "string",
    description: "The entity's abbreviation.",
    width: 100,
    controlType: "TextField",
  },
  {
    field: "location",
    headerName: "Location",
    type: "string",
    description: "The entity's location.",
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
  {
    field: "address",
    headerName: "Address",
    type: "string",
    description: "The entity's address.",
    width: 250,
    controlType: "TextField",
  },
];

export class EntityLookup {
  public id: string;
  public name: string;
  constructor(userData: any) {
    this.id = userData.id;
    this.name = userData.name;
  }
}

export class EntityRead extends NamedModelBase {
  address: string;
  abbreviation: string;
  location: string;
  constructor(userData: any) {
    super(userData.name, userData.id);
    this.address = userData.address;
    this.abbreviation = userData.abbreviation;
    this.location = userData.location;
  }
}
