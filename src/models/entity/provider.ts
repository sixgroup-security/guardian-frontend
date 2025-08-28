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

import { GridColInputControlProps } from "../common";
import {
  URL_ENTITIES,
  COLUMN_DEFINITION,
  queryKeyEntities,
  EntityRead,
} from "./entity";

export const URL_PROVIDERS = URL_ENTITIES + "/providers";
export const URL_PROVIDER_TESTERS = URL_PROVIDERS + "/{providerId}/testers";
export const queryKeyProviders = [...queryKeyEntities, "providers"];

export const COLUMN_PROVIDER_DEFINITION: GridColInputControlProps[] = [
  ...COLUMN_DEFINITION,
];

export class ProviderRead extends EntityRead {
  constructor(userData: any) {
    super(userData);
  }
}
