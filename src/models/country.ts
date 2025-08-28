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
 * along with MyAwesomeProject. If not, see <https://www.gnu.org/licenses/>.
 *
 * @author Lukas Reiter
 * @copyright Copyright (C) 2024 Lukas Reiter
 * @license GPLv3
 */

import { NamedModelBase } from "./common";
import { URL_PATH_PREFIX, APP_API_URL } from "../util/consts/common";

// Country REST API endpoints
const URL_PATH_COUNTRIES_PREFIX = URL_PATH_PREFIX + "/countries";
export const URL_COUNTRIES_FLAG =
  APP_API_URL + URL_PATH_COUNTRIES_PREFIX + "/svg";
export const URL_COUNTRIES = URL_PATH_COUNTRIES_PREFIX;

export class CountryLookup {
  public id: string;
  public name: string;
  public country_code: string;

  constructor(userData: any) {
    this.id = userData.id;
    this.name = userData.name;
    this.country_code = userData.code;
  }
}

export class CountryRead extends NamedModelBase {
  public code: string;
  public phone: string;

  constructor(userData: any) {
    super(userData.name, userData.id);
    this.code = userData.code;
    this.phone = userData.phone;
  }
}
