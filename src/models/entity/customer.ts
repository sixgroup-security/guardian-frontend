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
  GridColInputControlProps,
  StateContentTypes,
  isNotNullUndefined,
  getSingleAutoCompleteEnumId,
} from "../common";
import {
  URL_ENTITIES,
  COLUMN_DEFINITION,
  queryKeyEntities,
  EntityRead,
} from "./entity";
import { MANAGER_ROLE_NAME } from "../../util/consts/common";

export const URL_CUSTOMERS = URL_ENTITIES + "/customers";
export const queryKeyCustomers = [...queryKeyEntities, "customers"];

export const COLUMN_CUSTOMER_DEFINITION: GridColInputControlProps[] = [
  ...COLUMN_DEFINITION,
  {
    field: "manager",
    headerName: MANAGER_ROLE_NAME,
    type: "string",
    description: `The ${MANAGER_ROLE_NAME} responsible for the customer.`,
    errorText: "This field is required and cannot be empty.",
    width: 200,
    controlType: "Autocomplete",
    required: true,
    isValid(value: StateContentTypes) {
      return isNotNullUndefined(value);
    },
    getFinalValue(value: StateContentTypes) {
      return getSingleAutoCompleteEnumId(value);
    },
  },
];

export class CustomerRead extends EntityRead {
  public manager: { id: string; label: string };
  constructor(userData: any) {
    super(userData);
    this.manager = userData.manager;
  }
}
