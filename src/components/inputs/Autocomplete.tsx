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

import React from "react";
import axios from "axios";
import { queryClient } from "../../util/consts/common";
import {
  FormControl,
  TextField,
  CircularProgress,
  AutocompleteRenderInputParams,
  Autocomplete as MuiAutocomplete,
  AlertColor,
} from "@mui/material";
import { useQuery } from "../../util/hooks/tanstack/useQuery";
import { AutoCompleteEnumType } from "../../models/enums";
import { StateContentTypes } from "../../models/common";
import UseQuerySnackbarAlert from "../feedback/snackbar/UseQuerySnackbarAlert";
import SnackbarAlert from "../feedback/snackbar/SnackbarAlert";
import { createFilterOptions } from "@mui/material/Autocomplete";
import { AxiosError } from "axios";
import { QueryKey } from "@tanstack/react-query";

const filter = createFilterOptions();

export interface AutocompleteProps {
  id: string;
  required?: boolean;
  value: any | null;
  helperText: string;
  errorText?: string;
  readOnly?: boolean;
  getOptionLabel?: (option: any) => string;
  isOptionEqualToValue?: (option: any, value: any) => boolean;
  label: string;
  error?: boolean;
  options?: any[];
  onChange: (
    event: React.SyntheticEvent<Element, Event>,
    newValue: StateContentTypes | null
  ) => void;
  onBlur?: (event: React.FocusEvent<HTMLDivElement, Element>) => void;
  multiple?: boolean;
  // Additional settings used for asynchronous fetching of data from the backend.
  apiEndpoint?: string; // The endpoint to fetch the data from.
  queryKey?: QueryKey | undefined; // The query key used to fetch the data from the backend.
  startAdornment?: React.ReactNode;
  // Additional settings used for freeSole.
  freeSolo?: boolean;
  postApiEndpoint?: string;
  postQueryKey?: QueryKey | undefined;
  maxLength?: number;
  // Additional settings required by the CountrySelect component
  renderOption?: any;
}

type SubmissionErrorType = { severity?: AlertColor; message?: string };
const initialTagSubmissionError: SubmissionErrorType = {
  severity: undefined,
  message: undefined,
};

const Autocomplete = React.memo((props: AutocompleteProps) => {
  const {
    id,
    required,
    value,
    options,
    getOptionLabel,
    isOptionEqualToValue,
    helperText,
    errorText,
    readOnly,
    label,
    error,
    onChange,
    onBlur,
    multiple,
    // Additional settings used for asynchronous fetching of data from the backend.
    apiEndpoint,
    queryKey,
    startAdornment,
    // Additional settings used for freeSole.
    freeSolo,
    postApiEndpoint,
    postQueryKey,
  } = props;
  const [open, setOpen] = React.useState(false);
  const [tagSubmissionError, setTagSubmissionError] =
    React.useState<SubmissionErrorType>(initialTagSubmissionError);
  const query = useQuery({
    queryKey: queryKey ?? [],
    path: apiEndpoint ?? "",
    enabled: false,
  });
  const async = apiEndpoint !== undefined;
  const message = error ? errorText : helperText;
  const autocompleteOptions = async
    ? (query.data as AutoCompleteEnumType[])
    : options;

  React.useEffect(() => {
    if (async && open) {
      query.refetch();
    }
    // TODO: If we add query to the dependeny list, then we have an infinite loop until the user closes the dialog.
  }, [async, open]);

  // Function pushes new tags to the backend. We cannot use a Tanstack mutation because we must immediately obtain and process the HTTP response.
  const tagUploadHandler = React.useCallback(
    async (tag: string) => {
      const jsonObject = { name: tag };
      try {
        const response = await axios.post(
          postApiEndpoint ?? apiEndpoint ?? "",
          jsonObject,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        // TODO: Refactor this code to use the custom hook useDataSubmission and SnackbarAlertv2 component
        queryClient.invalidateQueries({ queryKey: postQueryKey ?? queryKey });
        return await response.data;
      } catch (ex) {
        const error = ex as AxiosError;
        let errorMessage: string | undefined;
        if (
          error.response?.data &&
          typeof error.response.data === "object" &&
          "message" in error.response.data
        ) {
          errorMessage = error.response?.data?.message?.toString();
        }
        setTagSubmissionError({
          severity: "error",
          message: errorMessage ?? "Unknown error while uploading tag.",
        });
      }
      return null;
    },
    [postApiEndpoint, apiEndpoint, postQueryKey, queryKey]
  );

  // Event handler for freeSolo mode.
  const onChangeHandler = React.useCallback(
    async (event: React.SyntheticEvent<Element, Event>, newValue: any) => {
      // newValue contains all the selected values. Therefore, if the multiple attribute is set to true, then newValue
      // is an array with all selected elements.
      if (multiple) {
        const count = newValue?.length ?? 0;
        const newElement = newValue[count - 1];
        const updatedValue = newValue?.slice(0, count - 1) ?? [];

        if (newElement?.inputValue) {
          // If the element does not exist in the dropdown menu yet, then it contains an object with the following
          // structure: {inputValue: 'Production', name: 'Add "Production"'} else, it is just a string.
          const jsonObject = await tagUploadHandler(newElement.inputValue);
          if (jsonObject === null) {
            return;
          }
          // Create a new value from the user input
          updatedValue.push(jsonObject);
          onChange(event, updatedValue);
        } else if (
          getOptionLabel &&
          typeof getOptionLabel(newElement) === "string"
        ) {
          // If the element is of type string, then it's a value that already exists in the dropdown menu.
          updatedValue.push(newElement);
          onChange(event, updatedValue);
        } else if (newElement) {
          // If the user enters a new value and hits enter. In this case, query.data is empty and we have to push the value
          // to the backend, which will create and/or just return the JSON object for us.
          const jsonObject = await tagUploadHandler(newElement);
          if (jsonObject === null) {
            return;
          }
          updatedValue.push(jsonObject);
          onChange(event, updatedValue);
        } else {
          // If the content of the component is deleted.
          onChange(event, updatedValue);
        }
      } else {
        // TODO: This branch tests Autocomplete components with singleSelect attribute. This has not been tested yet.
        if (newValue?.inputValue) {
          // If the element does not exist in the dropdown menu yet, then it contains an object with the following
          // structure: {inputValue: 'Production', name: 'Add "Production"'} else, it is just a string.
          const jsonObject = await tagUploadHandler(newValue.inputValue);
          if (jsonObject === null) {
            return;
          }
          onChange(event, jsonObject);
        } else if (
          getOptionLabel &&
          typeof getOptionLabel(newValue) === "string"
        ) {
          // If the element is of type string, then it's a value that already exists in the dropdown menu.
          onChange(event, newValue);
        } else if (newValue) {
          // If the user enters a new value and hits enter. In this case, query.data is empty and we have to push the value
          // to the backend, which will create and/or just return the JSON object for us.
          const jsonObject = await tagUploadHandler(newValue);
          if (jsonObject === null) {
            return;
          }
          onChange(event, jsonObject);
        } else {
          // If the content of the component is deleted.
          onChange(event, newValue);
        }
      }
    },
    [multiple, tagUploadHandler, onChange, getOptionLabel]
  );

  const filterOptions = React.useCallback(
    (options: AutoCompleteEnumType[], params: any) => {
      const filtered = filter(options, params);
      const { inputValue } = params;
      // Suggest the creation of a new value
      const isExisting = options.some((option) => inputValue === option.label);
      if (inputValue !== "" && !isExisting) {
        filtered.push({
          inputValue,
          name: `Add "${inputValue}"`,
        });
      }
      return filtered;
    },
    []
  );

  const getRenderInputComponent = React.useCallback(
    (async: boolean, multiple: boolean) => {
      if (async) {
        return (params: AutocompleteRenderInputParams) => (
          <TextField
            {...params}
            label={label}
            required={required}
            placeholder={label}
            error={error}
            helperText={message}
            InputProps={
              // If multiple is selected, then startAdornment cannot be used.
              multiple
                ? {
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {query.isLoading ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }
                : {
                    ...params.InputProps,
                    startAdornment,
                    endAdornment: (
                      <>
                        {query.isLoading ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }
            }
          />
        );
      }
      // This is the default render input component. For example, it allows displaying enum types.
      return (params: AutocompleteRenderInputParams) => (
        <TextField
          {...params}
          label={label}
          required={required}
          placeholder={label}
          error={error}
          helperText={message}
        />
      );
    },
    [query.isLoading, error, message, label, required, startAdornment]
  );

  return (
    <>
      <SnackbarAlert
        severity={tagSubmissionError.severity}
        message={tagSubmissionError.message}
        resetFn={() => setTagSubmissionError(initialTagSubmissionError)}
      />
      <UseQuerySnackbarAlert query={query} />
      <FormControl color={error ? "error" : "primary"} sx={{ width: "100%" }}>
        <MuiAutocomplete
          id={id}
          value={value}
          onChange={freeSolo ? onChangeHandler : onChange}
          onBlur={onBlur} // The onBlur event does not contain the component's current value. Hence, we cannot use it to update the state.
          // onInputChange={onChange}
          options={autocompleteOptions ?? []}
          loading={async && query.isLoading && query.isFetching}
          multiple={multiple}
          getOptionLabel={getOptionLabel}
          isOptionEqualToValue={isOptionEqualToValue}
          renderOption={props.renderOption}
          readOnly={!!readOnly}
          disabled={!!readOnly}
          renderInput={getRenderInputComponent(
            async ?? false,
            multiple ?? false
          )}
          open={open}
          onOpen={() => {
            setOpen(true);
          }}
          onClose={() => {
            setOpen(false);
          }}
          // freeSole-specific settings
          freeSolo={freeSolo}
          filterOptions={freeSolo ? filterOptions : undefined}
          //selectOnFocus={freeSolo}
          //clearOnBlur={freeSolo}
          //handleHomeEndKeys={freeSolo}
        />
      </FormControl>
    </>
  );
});

export default Autocomplete;
