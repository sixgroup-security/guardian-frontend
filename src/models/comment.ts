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
  isValidString,
  ModelBase,
} from "./common";

// Valid types are: export type GridNativeColTypes = 'string' | 'number' | 'date' | 'dateTime' | 'boolean' | 'singleSelect' | 'actions';
export const COLUMN_DEFINITION: GridColInputControlProps[] = [
  {
    field: "id",
    hideColumn: true,
    controlType: null,
  },
  {
    field: "comment",
    headerName: "Comment",
    type: "string",
    description: "A comment documenting the changes.",
    errorText: "This field is required and cannot be empty.",
    width: 250,
    controlType: "TextField",
    required: true,
    isValid(value: StateContentTypes) {
      return isValidString(value);
    },
  },
];

export class CommentUpdate extends ModelBase {
  public comment: string;

  constructor(comment: Comment) {
    super(comment.id);
    this.comment = comment.comment;
  }
}

export class Comment extends ModelBase {
  public user: { id: string; label: string };
  public comment: string;
  public createdAt: Date;

  constructor(userData: any) {
    super(userData.id);
    const createdAt = userData.created_at.replace(/(\.\d{3})\d*/, "$1") + "Z";
    this.user = userData.user;
    this.comment = userData.comment;
    this.createdAt = new Date(createdAt);
  }
}
