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

import TextField from "./TextField";
import Autocomplete from "./Autocomplete";
import DatePicker from "./DatePicker";
import CountrySelect from "./CountrySelect";
import Checkbox from "./Checkbox";
import MarkdownEditor from "./MarkdownEditor";
import {
  OnChangeEventType,
  UsePageManagerReturn,
} from "../../util/hooks/usePageManager";
import {
  StateContentTypes,
  splitComponentId,
  getComponentContent,
  getComponentFlags,
  isOptionEqualToValue,
  DataGridAutocompleteExtendedProps,
} from "../../models/common";
import { DetailsDialogMode } from "../../models/enums";
import LanguageTabbedPane from "../navigation/LanguageTabbedPane";
import MarkdownField from "./MarkdownField";
import Switch from "./Switch";
import React from "react";
import { QueryKey } from "@tanstack/react-query";
import DataGridAutocomplete from "../data/datagrid/DataGridAutocomplete";

interface InputControlFieldWrapperPropsv2 {
  context: UsePageManagerReturn;
  id?: string;
  options?: StateContentTypes[];
  getOptionLabel?: (option: StateContentTypes) => string;
  isOptionEqualToValue?: (
    option: StateContentTypes,
    value: StateContentTypes
  ) => boolean;
  multiline?: boolean;
  minRows?: number;
  maxRows?: number;
  // Additional settings for the CountrySelect component
  impageApiEndpoint?: string;
  // Additional settings used for asynchronous fetching of data from the backend.
  apiEndpoint?: string; // The endpoint to fetch the data from.
  queryKey?: QueryKey | undefined; // The query key used to fetch the data from the backend.
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  // Additional settings used for freeSole.
  freeSolo?: boolean;
  // In multi-language mode, MarkdownEditor or TextField components manage an attribute within a language object (e.g., {en: "English", de: "Deutsch"}). This attribute is identified by the languageKey.
  languageKey?: string;
  // Additional settings used for MarkdownEditor.
  uploadUrl?: string;
  // If set to true, then a \label{} will be inserted at the end of an image's caption.
  insertLabel?: boolean;
  size?: "small" | "medium";
  readonly?: boolean;
  dataGridAutoComplete?: DataGridAutocompleteExtendedProps;
}

export const InputControlFieldWrapperv2 = React.memo(
  (props: InputControlFieldWrapperPropsv2) => {
    const { context, languageKey } = props;
    const {
      pageManager,
      handleOnBlur: onBlur,
      handleOnChange: onChange,
    } = context;

    // ID and reportLanguages are mutual exclusive
    const reportLanguages = React.useMemo(
      () => (props.id ? undefined : context.languageQuery.reportLanguages),
      [props.id, context.languageQuery.reportLanguages]
    );

    if ((props.id && reportLanguages) || (!props.id && !reportLanguages)) {
      throw new Error("id and reportLanguages are mutually exclusive.");
    }

    // If the component is a multi-language component, then we create a LanguageTabbedPane.
    // Note that the LanguageTabbedPane itself calls this component again but with a languageKey potentially leading to an infinite loop.
    // Therefore, we need to check whether the languageKey is already defined.
    if (reportLanguages && !languageKey) {
      return (
        <LanguageTabbedPane
          context={context}
          uploadUrl={props.uploadUrl}
          insertLabel={props.insertLabel}
        />
      );
    }

    // Obtain the correct column definition for the given id.FormSubmissionStateType
    const [id, subKey] = splitComponentId(props.id ?? "");
    const column = pageManager.columns[id];
    if (!column) {
      throw new Error("Invalid column definition: " + props.id);
    }

    const {
      required,
      controlType,
      headerName,
      description,
      options,
      apiEndpoint,
      queryKey,
      uploadUrl,
      imageApiEndpoint,
      freeSolo,
      minRows,
      maxRows,
      readonly,
    } = column;
    const content = getComponentContent(pageManager.content, id, subKey);
    const flags = getComponentFlags(pageManager.flags, id, subKey);
    const readOnly =
      props.readonly === true ||
      readonly ||
      pageManager.mode === DetailsDialogMode.View;
    const getOptionLabel = props.getOptionLabel ?? column.getOptionLabel;

    switch (controlType) {
      case "TextField":
        return (
          <TextField
            required={required}
            id={id}
            label={headerName ?? "Undefined"}
            helperText={description ?? "Undefined"}
            errorText={flags?.errorText}
            fullWidth={true}
            multiline={
              props.multiline ||
              (props.minRows ?? minRows ?? 1) > 1 ||
              (props.maxRows ?? maxRows ?? 1) > 1
            }
            minRows={props.minRows ?? minRows ?? 1}
            maxRows={props.maxRows ?? maxRows ?? 1}
            value={content ?? ""}
            readOnly={readOnly}
            size={props.size}
            error={flags?.error && flags?.edited}
            onChange={(event) => onChange(event, props.id ?? "")}
            onBlur={(event) => onBlur(event, props.id ?? "")}
            startAdornment={props.startAdornment}
            endAdornment={props.endAdornment}
          />
        );
      case "MarkdownEditor":
        return (
          <MarkdownEditor
            required={required}
            id={id}
            label={headerName ?? "Undefined"}
            helperText={description ?? "Undefined"}
            errorText={flags?.errorText}
            fullWidth={true}
            multiline={true}
            minRows={props.minRows ?? minRows ?? 1}
            maxRows={props.maxRows ?? maxRows ?? 1}
            value={content ?? ""}
            readOnly={readOnly}
            error={flags?.error && flags?.edited}
            onChange={(
              event: OnChangeEventType,
              newValue?: StateContentTypes | null
            ) => onChange(event, props.id ?? "", newValue)}
            mode={column.markdownEditorMode}
            maxHeight={column.markdownMaxHeight}
            onBlur={(event) => onBlur(event, props.id ?? "")}
            uploadUrl={props.uploadUrl ?? uploadUrl}
            insertLabel={props.insertLabel}
          />
        );
      case "MarkdownField":
        return (
          <MarkdownField
            maxHeight={column.markdownMaxHeight}
            content={content}
          />
        );
      case "DatePicker":
        return (
          <DatePicker
            required={required}
            id={id}
            label={headerName ?? ""}
            helperText={description ?? "Undefined"}
            errorText={flags?.errorText}
            value={content ?? null}
            readOnly={readOnly}
            error={flags?.error && flags?.edited}
            onChange={(newValue: Date | null) => {
              onChange(null, id, newValue);
            }}
            // OnBlur is not working for DatePicker
            onBlur={(event: React.FocusEvent<HTMLDivElement, Element>) =>
              onBlur(event, id)
            }
          />
        );
      case "Checkbox":
        return (
          <Checkbox
            required={required}
            id={id}
            label={headerName ?? ""}
            helperText={description ?? "Undefined"}
            errorText={flags?.errorText}
            value={content}
            error={flags?.error}
            readOnly={readOnly}
            onChange={(
              event: React.SyntheticEvent<Element, Event>,
              newValue: StateContentTypes
            ) => onChange(event, id, newValue)}
          />
        );
      case "Switch":
        return (
          <Switch
            id={id}
            label={headerName ?? ""}
            disabled={readOnly}
            checked={content ?? false}
            onChange={(event: React.ChangeEvent) => onChange(event, id)}
          />
        );
      case "Autocomplete":
        if ((props.freeSolo || freeSolo) && getOptionLabel) {
          throw new Error(
            "freeSolo and getOptionLabel cannot be used together"
          );
        }
        return (
          <Autocomplete
            required={required}
            id={id}
            label={headerName ?? ""}
            helperText={description ?? "Undefined"}
            errorText={flags?.errorText}
            value={content}
            readOnly={readOnly}
            options={props.options ?? options ?? []}
            getOptionLabel={
              props.freeSolo || freeSolo
                ? (option: { name: string }) => option?.name
                : getOptionLabel
            }
            isOptionEqualToValue={
              props.isOptionEqualToValue ??
              column.isOptionEqualToValue ??
              isOptionEqualToValue
            }
            error={flags?.error && flags?.edited}
            onChange={(
              event: React.SyntheticEvent<Element, Event>,
              newValue: StateContentTypes
            ) => onChange(event, id, newValue)}
            onBlur={(event: React.FocusEvent<HTMLDivElement, Element>) =>
              onBlur(event, id)
            }
            multiple={column.multiSelect ?? false}
            freeSolo={props.freeSolo ?? freeSolo ?? false}
            apiEndpoint={props.apiEndpoint ?? apiEndpoint}
            queryKey={props.queryKey ?? queryKey}
          />
        );
      case "CountrySelect":
        if ((props.freeSolo || freeSolo) && getOptionLabel) {
          throw new Error(
            "freeSolo and getOptionLabel cannot be used together"
          );
        }
        return (
          <CountrySelect
            required={required}
            id={id}
            label={headerName ?? ""}
            helperText={description ?? "Undefined"}
            errorText={flags?.errorText}
            value={content}
            readOnly={readOnly}
            options={props.options ?? []}
            getOptionLabel={
              props.freeSolo || freeSolo
                ? (option: { name: string }) => option?.name
                : getOptionLabel
            }
            isOptionEqualToValue={
              props.isOptionEqualToValue ??
              column.isOptionEqualToValue ??
              isOptionEqualToValue
            }
            error={flags?.error && flags?.edited}
            onChange={(
              event: React.SyntheticEvent<Element, Event>,
              newValue: StateContentTypes
            ) => onChange(event, id, newValue)}
            onBlur={(event: React.FocusEvent<HTMLDivElement, Element>) =>
              onBlur(event, id)
            }
            multiple={column.multiSelect ?? false}
            freeSolo={props.freeSolo ?? false}
            apiEndpoint={props.apiEndpoint ?? apiEndpoint}
            impageApiEndpoint={
              props.impageApiEndpoint ?? imageApiEndpoint ?? ""
            }
            queryKey={props.queryKey ?? queryKey}
          />
        );
      case "DataGridAutocomplete":
        return (
          <DataGridAutocomplete
            id={id}
            required={required}
            label={headerName ?? ""}
            helperText={description ?? "Undefined"}
            errorText={flags?.errorText}
            value={content}
            readOnly={readOnly}
            multiSelect={column.multiSelect ?? false}
            onChange={(event: OnChangeEventType, newValue: StateContentTypes) =>
              onChange(event, id, newValue)
            }
            dataGridAutoCompleteSettings={
              context.pageManager.columns[props.id!]
                .dataGridAutoCompleteSettings!
            }
          />
        );
      default:
        throw new Error("Invalid input control type");
    }
  }
);
