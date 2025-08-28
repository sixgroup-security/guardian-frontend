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

import { URL_PATH_PREFIX } from "../../util/consts/common";

// Country REST API endpoints
const URL_PATH_TAGS_PREFIX = URL_PATH_PREFIX + "/tags";
export const URL_TAGS = URL_PATH_TAGS_PREFIX;

export class TagLookup {
  public id: string;
  public name: string;

  constructor(userData: any) {
    this.id = userData.id;
    this.name = userData.name;
  }
}
