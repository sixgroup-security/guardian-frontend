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

import { GridRowSelectionModel } from "@mui/x-data-grid";
import {
  GridColInputControlProps,
  StateContentTypes,
  isNonEmptyArray,
  isNotNullUndefined,
  isValidDate,
  getSingleAutoCompleteEnumId,
} from "../common";
import dayjs from "dayjs";
import { ProjectType, getEnumNames, getEnumObject } from "../enums";
import { URL_APPLICATIONS } from "../application/application";
import { CountryLookup } from "../country";

export const URL_CREATE_PROJECTS = URL_APPLICATIONS + "/projects/create";

// Valid types are: export type GridNativeColTypes = 'string' | 'number' | 'date' | 'dateTime' | 'boolean' | 'singleSelect' | 'actions';
export const COLUMN_DEFINITION: GridColInputControlProps[] = [
  {
    field: "applications",
    headerName: "Applications",
    type: "string",
    description: "List of applications for which a projects shall be created.",
    controlType: "TextField",
    required: true,
    isValid(value: StateContentTypes) {
      return isNonEmptyArray(value);
    },
  },
  {
    field: "type",
    headerName: "Type",
    type: "singleSelect",
    valueOptions: getEnumNames(ProjectType),
    description: "Specifies the type of the projects' underlying test.",
    errorText: "This field is required and cannot be empty.",
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
    field: "start",
    headerName: "Start Date",
    type: "date",
    description: "The project's start date.",
    errorText: "This field is required and must contain a valid date.",
    controlType: "DatePicker",
    required: true,
    isValid(value: StateContentTypes) {
      return isValidDate(value);
    },
  },
  {
    field: "location",
    headerName: "Location",
    type: "string",
    description: "The projects' default execution location.",
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
];

export class ProjectCreation {
  public applications: GridRowSelectionModel;
  public type: {
    [x: string]: string | number;
    id: number;
  };
  public start: dayjs.Dayjs;
  public location: CountryLookup | null;

  constructor(
    applications: GridRowSelectionModel,
    type: ProjectType,
    start: string,
    location?: CountryLookup
  ) {
    this.applications = applications;
    this.type = getEnumObject(ProjectType, type, "label");
    this.start = dayjs(start);
    this.location = location ?? null;
  }
}

export class ProjectSubmittion {
  public applications: string[];
  public type: number;
  public start: dayjs.Dayjs;
  public location: string;

  constructor(batch: ProjectCreation) {
    if (!batch.location) throw new Error("Location is required.");
    this.applications = batch.applications.map((app) => app as string);
    this.type = batch.type.id;
    // Unfortunately, the date picker returns the date in UTC format and we need to convert it to the local time zone.
    this.start = batch.start.add(1, "day");
    this.location = batch.location.id;
  }
}
