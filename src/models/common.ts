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

import dayjs from "dayjs";
import {
  AlertColor,
  SvgIconPropsColorOverrides,
  SvgIconTypeMap,
} from "@mui/material";
import { OverridableStringUnion } from "@mui/types";
import { GridColDef, GridRowId } from "@mui/x-data-grid";
import { AutoCompleteEnumType, AutoCompleteOption } from "./enums";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { QueryKey } from "@tanstack/react-query";
import { MarkdownEditorMode } from "../components/inputs/MarkdownEditor";
import { IPageManagerState } from "../util/hooks/usePageManager";

export type CellValueFnType = (params: GridColDef) => any;

export type ChipColorType =
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning";

export type ControlTypeTypes =
  | "TextField"
  | "Checkbox"
  | "Switch"
  | "DatePicker"
  | "Autocomplete"
  | "DataGridAutocomplete"
  | "CountrySelect"
  | "MarkdownField"
  | "MarkdownEditor";

export type SubmissionType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "dateTime"
  | "number[]"
  | "boolean[]"
  | "string[]";

export type StateContentTypes = any;

export type ColorType = OverridableStringUnion<
  | "disabled"
  | "action"
  | "inherit"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning",
  SvgIconPropsColorOverrides
>;

/*
 * Used by InputControlWrapper to populate all data for the DataGridAutocomplete component.
 */
export interface DataGridAutocompleteExtendedProps {
  // Set of columns of type GridColDef[].
  columns: GridColInputControlProps[];
  // Function that allows filtering for the pinned rows that shall be pinned.
  filterFn: (row: any, uuids: GridRowId[]) => boolean;
  // Conversion method to convert the response data to the desired format.
  convertFn?: (data: any[]) => any[];
  // Function to get the initial value for the DataGridAutocomplete component.
  getInitialValueFn?: (value?: any) => any;
  // Function to obtain the correct value for a cell.
  getCellValueFn?: CellValueFnType;
  // Function to correctly render all cells.
  renderCellFn?: CellValueFnType;
  apiEndpoint: string;
  queryKey: QueryKey;
  // The height of the DataGrid
  height: string;
}

export interface InputControlWrapperProps {
  // Instructs the control input to visually indicate that the field is required.
  required?: boolean;
  // If set to true, then the column will not be displayed in the grid.
  hideColumn?: boolean;
  // The type of control that should be rendered for this field.
  controlType: ControlTypeTypes | null;
  // Specifies whether the Autocomplete control should allow multiple selections.
  multiSelect?: boolean;
  // The text that will be displayed in case of invalid input.
  errorText?: string;
  // The function that will be called to validate the field's value.
  isValid?: (value: StateContentTypes, state: IPageManagerState) => boolean;
  // The function that will be called to get the final value before submitting the form.
  getFinalValue?: (value: StateContentTypes) => StateContentTypes;
  // If false, then the ReactMarkdown component will not be displayed in the MarkdownEditor component.
  markdownEditorMode?: MarkdownEditorMode;
  markdownMaxHeight?: string;
  // Settings specific to the MarkdownEditor control.
  minRows?: number;
  maxRows?: number;
  uploadUrl?: string;
  multiLanguage?: boolean;
  // Used by the AutoComplete component to display static options.
  options?: AutoCompleteOption[];
  freeSolo?: boolean;
  // Used by the AutoComplete component to resolve the label from the given option object.
  getOptionLabel?: (option: any) => string;
  // Used by the AutoComplete component to resolve the value from the given option object.
  isOptionEqualToValue?: (
    option: StateContentTypes,
    value: StateContentTypes
  ) => boolean;
  // Used by the AutoComplete/CountrySelect components to display options.
  apiEndpoint?: string;
  // Used by the AutoComplete/CountrySelect components to display options.
  queryKey?: QueryKey;
  // Used by the CountrySelect component to display images.
  imageApiEndpoint?: string;
  // Default value for the control.
  defaultValue?: any;
  // Defines wheter the control is readonly or not.
  readonly?: boolean;
  // Defines that column should not be submitted to the server.
  noSubmit?: boolean;
  // Defines settings for the DataGridAutocomplete component
  dataGridAutoCompleteSettings?: DataGridAutocompleteExtendedProps;
}

export type GridColInputControlProps = InputControlWrapperProps & GridColDef;
export type IconType = OverridableComponent<SvgIconTypeMap<any, "svg">> & {
  muiName: string;
};

/*
 * This is the base classes from which all Lumina API classes must be inherited.
 */
export abstract class ModelBase {
  constructor(public id: string | null) {}

  public getQueryId(): string {
    return this.id ?? "";
  }
}

export abstract class NamedModelBase extends ModelBase {
  constructor(public name: string, id: string | null) {
    super(id);
    this.name = name;
  }
}

export class ResponseMessage {
  public severity: AlertColor;
  public message: string;
  public status: number;
  public errorCode: string | undefined;
  public payload: any;
  public open: boolean;

  constructor(data: {
    severity: AlertColor;
    message: string;
    status: number;
    errorCode?: string;
    payload?: any;
    open?: boolean;
  }) {
    this.severity = data.severity;
    this.message = data.message;
    this.status = data.status;
    this.errorCode = data.errorCode;
    this.payload = data.payload;
    this.open = data.open ?? true;
  }
}

// isValid implementations
export function isNotNullUndefined(value: StateContentTypes) {
  return value !== null && value !== undefined;
}

export function isValidString(value: StateContentTypes) {
  return typeof value === "string" && value?.trim().length > 0;
}

export function isValidNumber(value: StateContentTypes) {
  return (
    typeof value === "number" ||
    (typeof value === "string" && isNaN(Number(value)) === false)
  );
}

export function isNonEmptyArray(value: StateContentTypes) {
  return Array.isArray(value) && value.length > 0;
}

export function isValidBoolean(value: StateContentTypes) {
  return typeof value === "boolean" || value === "true" || value === "false";
}

export function isValidCvss(value: string) {
  return (
    value?.length == 0 ||
    new RegExp(
      "CVSS:3.[01]/AV:[NALP]/AC:[LH]/PR:[NLH]/UI:[NR]/S:[UC]/C:[NLH]/I:[NLH]/A:[NLH](?:/E:[UFPH])?(?:/RL:[OTWU])?(?:/RC:[URC])?(?:/CR:[LMH])?(?:/IR:[LMH])?(?:/AR:[LMH])?(?:/MAV:[NALP])?(?:/MAC:[LH])?(?:/MPR:[NLH])?(?:/MUI:[NR])?(?:/MS:[UC])?(?:/MC:[NLH])?(?:/MI:[NLH])?(?:/MA:[NLH])?"
    ).test(value)
  );
}

export function isValidDate(value: StateContentTypes) {
  if (value instanceof Date || value instanceof dayjs) {
    return true;
  } else if (typeof value === "string") {
    const date = Date.parse(value);
    return isNaN(date) === false;
  }
  return false;
}

/*
 * This function is used by the Autocomplete component to get the label for each option.
 */
export const isOptionEqualToValue = (
  option: StateContentTypes,
  value: StateContentTypes
) => {
  if (option === null || value === null) return false;
  if (typeof option === "object" && typeof value === "object") {
    if ("id" in option && "id" in value) {
      return option.id === value?.id;
    } else if ("label" in option && "label" in value) {
      return option.label === value?.label;
    } else if ("name" in option && "name" in value) {
      return option.name === value?.name;
    }
  }
  return false;
};

// getFinalValue implementations
export function getNumber(value: StateContentTypes) {
  if (typeof value === "number") {
    return value;
  } else if (typeof value === "string") {
    return Number(value);
  }
  return null;
}

export function getBoolean(value: StateContentTypes) {
  if (typeof value === "boolean") {
    return value;
  } else if (typeof value === "string") {
    return value === "true";
  }
  return null;
}

export function getSingleAutoCompleteEnumId(value: StateContentTypes) {
  if (value !== null && typeof value === "object" && "id" in value) {
    return value?.id;
  }
  return null;
}

export function getArrayAutoCompleteEnumId(value: StateContentTypes) {
  const result: number[] = [];
  if (Array.isArray(value) && value.length > 0) {
    value.forEach((item) => {
      if (typeof item === "object" && "id" in item) {
        result.push((item as AutoCompleteEnumType).id);
      }
    });
  }
  return result;
}

/*
 * The ID of multi-language components is composed of the component ID and the language code. This function splits the ID into these two parts.
 */
export function splitComponentId(id: string): [string, string?] {
  const parts = id.split("/");
  if (parts.length === 2) {
    return [parts[0], parts[1]];
  }
  return [id];
}

/*
 * This function is used to get the content of a component from the content object.
 */
export function getComponentContent(
  content: any,
  componentId: string,
  subKey?: string
) {
  if (subKey) {
    return content[componentId]?.[subKey];
  }
  return content[componentId];
}

export function getComponentFlags(
  flags: any,
  componentId: string,
  subKey?: string
) {
  if (subKey) {
    return flags[componentId]?.[subKey];
  }
  return flags[componentId];
}

export const getCookieValue = (cookieName: string): string | null => {
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === cookieName) {
      return decodeURIComponent(value);
    }
  }
  return null;
};
