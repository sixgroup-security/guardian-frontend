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

import React from "react";
import dayjs from "dayjs";
import {
  ControlTypeTypes,
  StateContentTypes,
  GridColInputControlProps,
  splitComponentId,
  getComponentContent,
  getComponentFlags,
} from "../../models/common";
import { ReportLanguageLookup } from "../../models/reportLanguage";
import { DetailsDialogMode } from "../../models/enums";
import { useMutation } from "./tanstack/useMutation";
import {
  QueryKey,
  UseMutationResult,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  NavigateFunction,
  Params,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useQueryUserMe } from "./tanstack/useQueryUserMe";
import {
  UseQueryReportLanguageReturn,
  useQueryReportLanguage,
} from "./tanstack/useQueryReportLanguage";
import { User } from "../../models/user";

/*
TODOs:
- Multilanguage support where the REST API returns something like this:
 {
   description: {
    en: "English description",
    de: "German description"
   }
 }
- For very specific attribues, where the function getControlInputValue (see below) fails, we can add a function pointer convertValue to type InputControlWrapperProps.
*/

type StateFlagProps = any; /* {
  edited: boolean;
  error: boolean;
  errorText: string;
};*/

/*
 * The different types of reducer function actions.
 */
type StateActions =
  | "SHOW_NEW_DIALOG"
  | "SHOW_EDIT_DIALOG"
  | "SHOW_VIEW_DIALOG"
  | "CLOSE_DIALOG"
  | "ON_CHANGE"
  | "ON_BLUR"
  | "SET_INPUT_ERROR"
  | "UPDATE_VALUES"
  | "SUBMISSION_SUCCESSFUL";

export interface IPageManagerState {
  columns: { [key: string]: GridColInputControlProps };
  content: { [key: string]: StateContentTypes };
  flags: { [key: string]: StateFlagProps };
  dialogTitle?: string;
  hasErrors?: boolean;
  mode?: DetailsDialogMode | null;
}

export type PageManagementReducerType = {
  action: StateActions;
  inputControlId?: string;
  inputControlIds?: string[];
  dialogTitle?: string;
  content?: any;
  // This event could be optional allowing components to use this function to update its value.
  onChangeEvent?: OnChangeEventType;
  onBlurEvent?: OnBlurEventType;
  // The Autocomplete component's onChange and onBlur events provide this extra parameter.
  newValue?: StateContentTypes;
  // The data that was returned by the POST/PUT request. This parameter is passed by the mutation's onSuccessHandler function.
  newContent?: { [key: string]: StateContentTypes };
  reportLanguages?: ReportLanguageLookup[];
  // Some DefaultDataGridViews require foreign key information (e.g., the one for the RatingDetailsDialog component).
  foreignKeyObject?: { [key: string]: string | dayjs.Dayjs };
  // This function is called after the POST request was successful. It allows the calling developers to update specific values.
  updateContentAfterSubmit?: (content: any, newContent: any) => void;
};

export type OnChangeEventType =
  | React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement> // TextField
  | React.SyntheticEvent<Element, Event>
  | null; // Select, DatePicker, Autocomplete
export type OnBlurEventType =
  | React.FocusEvent<HTMLTextAreaElement | HTMLInputElement, Element>
  | React.FocusEvent<HTMLDivElement, Element>; // TextField, Select, DatePicker, Autocomplete

/*
 * This function returns the input control's current value via the given event.
 */
export const getControlInputValue = (
  event: any | undefined,
  newValue: StateContentTypes | null,
  controlType: ControlTypeTypes | null
) => {
  if (controlType == null) {
    throw new Error("Argument controlType must not be null.");
  }
  switch (controlType) {
    case "TextField":
      return event.target.value;
    case "MarkdownEditor":
      return newValue ?? event?.target?.value;
    case "Checkbox":
      return event.target.checked;
    case "Switch":
      return event.target.checked;
    case "DatePicker":
      return newValue?.isValid() ? dayjs(newValue) : null;
    case "CountrySelect":
    case "Autocomplete":
      return newValue; // Usual format: {id: 1, label: "Some label"}
    case "DataGridAutocomplete":
      return newValue;
    default:
      throw new Error("Invalid control type: " + controlType);
  }
};

/*
 * This function returns the initial content for the form submission based on the column definition.
 *
 * It initializes the details dialog's content with empty fields.
 */
const initFormSubmissionContent = (
  columns: {
    [key: string]: GridColInputControlProps;
  },
  reportLanguages: ReportLanguageLookup[],
  foreignKeyObject?: { [key: string]: string | dayjs.Dayjs }
): { [key: string]: StateContentTypes } => {
  return Object.fromEntries(
    Object.keys(columns).map((key) => {
      const controlType = columns[key].controlType;
      let newValue: string | dayjs.Dayjs | null = columns[key].defaultValue;

      // Obtain the foreign key value if available.
      if (foreignKeyObject && key in foreignKeyObject) {
        newValue = foreignKeyObject[key];
      }

      if (controlType === "CountrySelect" || controlType === "Autocomplete") {
        if (columns[key].multiSelect) {
          return [key, []];
        }
        return [key, null];
      } else if (controlType === "Checkbox") {
        return [key, undefined];
      } else if (columns[key].multiLanguage) {
        const result: any = {};
        reportLanguages.forEach((language) => {
          result[language.language_code] = columns[key].defaultValue ?? "";
        });
        return [key, result];
      } else {
        return [key, newValue ?? ""];
      }
    })
  );
};

/*
 * This function is called once the POST/PUT request was successful.
 */
export const onSuccessHandler = (
  data: { [key: string]: StateContentTypes },
  dispatchFn: React.Dispatch<PageManagementReducerType>,
  updateContentAfterSubmit?: (content: any, newContent: any) => void
) => {
  dispatchFn &&
    dispatchFn({
      action: "SUBMISSION_SUCCESSFUL",
      newContent: data,
      updateContentAfterSubmit,
    });
};

export interface OnSubmitHandlerProps {
  pageManager: IPageManagerState;
  dispatchPageManager: React.Dispatch<PageManagementReducerType>;
  postMutation?: UseMutationResult;
  putMutation?: UseMutationResult;
}

/*
 * This function submits the form data to the given REST API.
 */
export const onSubmitHandler = ({
  pageManager,
  dispatchPageManager,
  postMutation,
  putMutation,
}: OnSubmitHandlerProps) => {
  const invalidInputControlIds: string[] = [];
  const formData: any = {};
  // We make a final input validation before submitting the request. Thereby, we iterate through all fields and highlight those that are incorrect.
  Object.keys(pageManager.content).forEach((key) => {
    const column = pageManager.columns[key];
    const content = pageManager.content[key];
    const flags = pageManager.flags[key];
    let error = false;
    if (!flags || !column) {
      throw new Error("Invalid flags: " + key);
    }
    // Skip fields that are not supposed to be submitted.
    if (column.noSubmit === true) {
      return;
    }
    // Perform input validation.
    if (column.required === true) {
      if (column.multiLanguage) {
        Object.entries(content).forEach(([languageId, value]) => {
          if (
            value === null ||
            value === undefined ||
            (typeof value === "string" && value.trim().length === 0) ||
            column.isValid?.(value, pageManager) === false
          ) {
            invalidInputControlIds.push(key + "/" + languageId);
            error = true;
          }
        });
      } else if (
        content === null ||
        content === undefined ||
        (typeof content === "string" && content.trim().length === 0) ||
        column.isValid?.(content, pageManager) === false
      ) {
        invalidInputControlIds.push(key);
        error = true;
      }
    } else {
      if (column.multiLanguage) {
        Object.keys(content).forEach((languageId) => {
          if (column.isValid?.(content, pageManager) === false) {
            invalidInputControlIds.push(key + "/" + languageId);
            error = true;
          }
        });
      } else if (column.isValid?.(content, pageManager) === false) {
        invalidInputControlIds.push(key);
        error = true;
      }
    }

    if (
      !error &&
      content !== null &&
      content !== undefined &&
      content.toString().trim() !== ""
    ) {
      // Convert value to correct value
      try {
        if (column.controlType === "DatePicker") {
          formData[key] = dayjs(content as string).format("YYYY-MM-DD");
        } else {
          formData[key] = column.getFinalValue
            ? column.getFinalValue(content)
            : content;
        }
      } catch (error) {
        invalidInputControlIds.push(key);
      }
    }
  });

  if (invalidInputControlIds.length > 0) {
    // Highlight the invalid input controls.
    dispatchPageManager({
      action: "SET_INPUT_ERROR",
      inputControlIds: invalidInputControlIds,
    });
    return false;
  } else {
    // Submit the form data to the REST API.
    switch (pageManager.mode) {
      case DetailsDialogMode.Create:
        postMutation?.mutate(formData);
        break;
      case DetailsDialogMode.Edit:
        putMutation?.mutate(formData);
        break;
      default:
        throw new Error("Invalid mode: " + pageManager.mode);
    }
  }
  return true;
};

/*
 * This function converts the column definition list to an object for easier access.
 */
const convertColumnsToObject = (columns: GridColInputControlProps[]) => {
  return columns.reduce((acc, item) => ({ ...acc, [item.field]: item }), {});
};

/*
 * This method returns the initial state for the form submission.
 */
const getFormSubmissionFlags = (
  content: object,
  columns: {
    [key: string]: GridColInputControlProps;
  },
  reportLanguages?: ReportLanguageLookup[]
): {
  [key: string]: StateFlagProps;
} => {
  const result: any = {};
  Object.keys(content).forEach((contentKey) => {
    const columnContent = columns[contentKey];
    if (columnContent) {
      if (columnContent.multiLanguage) {
        result[contentKey] = {};
        reportLanguages?.forEach((language) => {
          result[contentKey][language.language_code] = {
            edited: false,
            error: false,
            errorText: columnContent.errorText ?? "",
          };
        });
      } else {
        result[contentKey] = {
          edited: false,
          error: false,
          errorText: columnContent.errorText ?? "",
        };
      }
    }
  });
  return result;
};

/**
 * Function that is called when the input control loses focus.
 * @param state
 * @param inputControlId
 * @returns
 */
const onBlurHandler = (state: IPageManagerState, inputControlId: string) => {
  const [componentId, subKey] = splitComponentId(inputControlId);
  const column = state.columns[componentId];
  const content = getComponentContent(state.content, componentId, subKey);
  const flags = getComponentFlags(state.flags, componentId, subKey);
  if (!flags) {
    throw new Error("Invalid flags: " + componentId);
  }
  // Mark the field as edited.
  flags.edited = true;
  flags.error = column.isValid?.(content, state) === false;
  if (subKey) {
    const result = {
      ...state,
      flags: {
        ...state.flags,
        [componentId]: { ...state.flags[componentId], [subKey]: flags },
      },
    };
    return result;
  } else {
    return {
      ...state,
      flags: { ...state.flags, [componentId]: flags },
    };
  }
};

/*
 * This is the reducer function that handles all actions for the details dialog.
 */
export const pageManagementReducer = (
  state: IPageManagerState,
  {
    action,
    inputControlId,
    inputControlIds,
    dialogTitle,
    content,
    onChangeEvent,
    onBlurEvent,
    newValue,
    newContent,
    reportLanguages,
    foreignKeyObject,
    updateContentAfterSubmit,
  }: PageManagementReducerType
): IPageManagerState => {
  if (action === "SHOW_EDIT_DIALOG" || action === "SHOW_VIEW_DIALOG") {
    if (!reportLanguages) {
      throw new Error(
        "Argument reportLanguages must not be null for action: " + action
      );
    }
    if (!content) {
      throw new Error(
        "Argument content must not be null for action: " + action
      );
    }
    const flags = getFormSubmissionFlags(
      content,
      state.columns,
      reportLanguages
    );
    const mode: DetailsDialogMode =
      action === "SHOW_EDIT_DIALOG"
        ? DetailsDialogMode.Edit
        : DetailsDialogMode.View;

    // Perform necessary conversions.
    const initialContent = Object.fromEntries(
      Object.keys(content).map((key) => {
        const column = state.columns[key];
        const value = content[key];
        if (!column) {
          throw new Error("Invalid column definition: " + key);
        }

        if (column.multiLanguage) {
          // First, we initialize the multi-language field with all existing languages.
          const value: any = Object.fromEntries(
            reportLanguages.map((language) => [language.language_code, ""])
          );
          Object.entries(content[key]).forEach(
            ([languageId, languageValue]) => {
              value[languageId] = languageValue;
            }
          );
          return [key, value];
        } else if (column.controlType === "DatePicker" && value) {
          return [key, dayjs(value.toString())];
        }
        return [key, value];
      })
    );

    return {
      ...state,
      mode,
      dialogTitle: dialogTitle ?? "",
      content: initialContent,
      flags,
    };
  } else if (action === "SHOW_NEW_DIALOG") {
    if (!reportLanguages) {
      throw new Error(
        "Argument reportLanguages must not be null for action: " + action
      );
    }
    const mode = DetailsDialogMode.Create;
    const content = initFormSubmissionContent(
      state.columns,
      reportLanguages,
      foreignKeyObject
    );
    const flags = getFormSubmissionFlags(
      content,
      state.columns,
      reportLanguages
    );

    return {
      ...state,
      mode,
      dialogTitle: dialogTitle ?? "",
      content,
      flags,
    };
  } else if (action === "CLOSE_DIALOG") {
    return {
      ...state,
      mode: null,
      dialogTitle: "",
      // Don't uncomment the following lines. Because the detail dialog's input compontents will switch from controlled to uncontrolled components. This results in an error message in the console.
      // content: {},
      flags: {},
      hasErrors: false,
    };
  } else if (action === "ON_CHANGE" && inputControlId) {
    const [componentId, subKey] = splitComponentId(inputControlId);
    const column = state.columns[componentId];
    if (!column) {
      throw new Error("Invalid column definition: " + componentId);
    }

    if (!(componentId in state.content)) {
      const content = "";
      const flags = {
        edited: false,
        error: false,
        errorText: column.errorText ?? "",
      };

      if (subKey) {
        return {
          ...state,
          hasErrors: false,
          content: {
            ...state.content,
            [componentId]: { [subKey]: content },
          },
          flags: {
            ...state.flags,
            [componentId]: { [subKey]: flags },
          },
        };
      }

      return {
        ...state,
        hasErrors: false,
        content: { ...state.content, [componentId]: content },
        flags: { ...state.flags, [componentId]: flags },
      };
    } else {
      // Perform input validation and update the state accordingly.
      const content = getControlInputValue(
        onChangeEvent,
        newValue ?? null,
        column.controlType
      );
      const flags = getComponentFlags(state.flags, componentId, subKey);
      flags.error = column.isValid?.(content, state) === false;

      if (subKey) {
        const result = {
          ...state,
          hasErrors: false,
          content: {
            ...state.content,
            [componentId]: {
              ...state.content[componentId],
              [subKey]: content,
            },
          },
          flags: {
            ...state.flags,
            [componentId]: {
              ...state.flags[componentId],
              [subKey]: flags,
            },
          },
        };
        return result;
      } else {
        return {
          ...state,
          hasErrors: false,
          content: { ...state.content, [componentId]: content },
          flags: {
            ...state.flags,
            [componentId]: flags,
          },
        };
      }
    }
  } else if (action === "ON_BLUR" && onBlurEvent && inputControlId) {
    return onBlurHandler(state, inputControlId);
  } else if (
    action === "SET_INPUT_ERROR" &&
    (inputControlIds?.length ?? 0) > 0
  ) {
    // This action is used by the form submission handler to highlight the invalid input controls.
    const flags = { ...state.flags };
    inputControlIds?.forEach((inputControlId) => {
      const [componentId, subKey] = splitComponentId(inputControlId);
      if (subKey) {
        flags[componentId][subKey].error = true;
        flags[componentId][subKey].edited = true;
      } else {
        flags[componentId].error = true;
        flags[componentId].edited = true;
      }
    });
    return {
      ...state,
      hasErrors: true,
      flags,
    };
  } else if (
    action === "SUBMISSION_SUCCESSFUL" &&
    state.mode === DetailsDialogMode.Create &&
    newContent?.id
  ) {
    // Called by the mutation's onSuccess callback.
    const newState = { ...state, hasErrors: false };
    newState.mode = DetailsDialogMode.Edit;
    newState.dialogTitle = newContent?.name?.toString() ?? "";
    newState.content.id = newContent?.id;
    // Call function allowing to update specific attributes.
    // This function is used by the Projects component to update the project's ID attribute.
    updateContentAfterSubmit?.(newState.content, newContent);
    return newState;
  } else if (action === "UPDATE_VALUES") {
    let newState = { ...state };
    // We update the content object with the new values.
    newState.content = { ...newState.content, ...content };
    // We update the flags object with the new values.
    Object.keys(content).forEach((key) => {
      newState = onBlurHandler(newState, key);
    });
    return newState;
  }
  return state;
};

/*
 * This method iterates through the column definition and checks if at least one column is multi-language and shall be displayed in the DataGrid component.
 * This information is used in the PagesDataGrid component to perform expensive language conversion operations or not.
 */
const isMultiLanguage = (columnsObject: any) => {
  for (const value of Object.values(columnsObject)) {
    const item = value as GridColInputControlProps;
    if (item.multiLanguage === true && item.hideColumn !== true) {
      return true;
    }
  }
  return false;
};

const initialState: IPageManagerState = {
  columns: {},
  content: {},
  flags: {},
  mode: null,
};

interface UsePageManagerProps {
  columns: GridColInputControlProps[];
  apiEndpoint?: string;
  queryKey?: QueryKey;
  switchToEditMode?: boolean;
  // This method is called by useMutation prior sending request. It allows calling applications to perform final modifications on the URL (e.g., to replace placeholders in the URL).
  updateApiEndpoint?: (
    pageManager: IPageManagerState,
    apiEndpoint?: string
  ) => string;
  updateQueryKey?: (
    pageManager: IPageManagerState,
    queryKey?: QueryKey
  ) => string[];
  // List of query keys that should be invalidated after a successful POST/PUT request.
  invalidateQueryKeys?: QueryKey[];
  // Specifies whether the dialog (if there is one), is navigateable (default is false). If true, then the dialog can be opened via a URL.
  navigateable?: boolean;
  // This function is called after the POST request was successful. It allows the calling developers to update specific values.
  updateContentAfterSubmit?: (content: any, newContent: any) => void;
}

export interface UsePageManagerReturn {
  pageManager: IPageManagerState;
  dispatchPageManager: React.Dispatch<PageManagementReducerType>;
  postMutation: UseMutationResult;
  putMutation: UseMutationResult;
  handleOnChange: (
    event: OnChangeEventType,
    id: string,
    newValue?: StateContentTypes
  ) => void;
  handleOnBlur: (
    event: OnBlurEventType,
    id: string,
    newValue?: StateContentTypes
  ) => void;
  closeDialog: () => void;
  showEditDialog: (
    title: string,
    reportLanguages: ReportLanguageLookup[],
    content: any
  ) => void;
  showNewDialog: (
    title: string,
    reportLanguages: ReportLanguageLookup[],
    foreignKeyObject?:
      | {
          [key: string]: string | dayjs.Dayjs;
        }
      | undefined
  ) => void;
  showViewDialog: (
    title: string,
    reportLanguages: ReportLanguageLookup[],
    content: any
  ) => void;
  // Sets the error flag for the given input control IDs. This can be used to manually set errors.
  setErrors: (inputControlsIds: string[]) => void;
  columnsObject: any;
  resolveMultiLanguage: boolean;
  updateContent: (content: any) => void;
  submitOnly: () => boolean;
  submitAndCloseDialog: () => void;
  hasChanged: boolean;
  navigateable: boolean;
  params: Readonly<Params<string>>;
  navigate: NavigateFunction;
  // Switches the details dialog from new to edit mode, once a new record has been created (default: true).
  switchToEditMode?: boolean;
  languageQuery: UseQueryReportLanguageReturn;
  meQuery: UseQueryResult<User, Error>;
  me: User | undefined;
  // The users preferred report language or the default main language as default.
  preferredLanguage?: ReportLanguageLookup | null;
}

export const usePageManager = ({
  columns,
  apiEndpoint,
  queryKey,
  switchToEditMode,
  updateApiEndpoint,
  updateQueryKey,
  invalidateQueryKeys,
  navigateable,
  updateContentAfterSubmit,
}: UsePageManagerProps): UsePageManagerReturn => {
  const params = useParams();
  const navigate = useNavigate();
  // Obtain user information
  const meQuery = useQueryUserMe();
  const me = React.useMemo(
    () => (meQuery.isSuccess ? meQuery.data : undefined),
    [meQuery.data, meQuery.isSuccess]
  );
  // Query report languages from backend API
  // Only users with the role "Administrator", "Auditor", "PenTester" or "SeniorPenTester" are allowed to access report languages.
  const languageQuery = useQueryReportLanguage({
    enabled: React.useMemo(
      () =>
        me?.isAdmin() ??
        (false || me?.isAuditor()) ??
        (false || me?.isSeniorPenTester()) ??
        (false || me?.isPenTester()) ??
        false,
      [me]
    ),
  });
  const columnsObject = React.useMemo(
    () => convertColumnsToObject(columns),
    [columns]
  );
  const resolveMultiLanguage = React.useMemo(
    () => isMultiLanguage(columnsObject),
    [columnsObject]
  );
  const tmp: IPageManagerState = React.useMemo(() => {
    return {
      ...initialState,
      columns: columnsObject,
    };
  }, [columnsObject]);
  const [pageManager, dispatchPageManager] = React.useReducer(
    pageManagementReducer,
    tmp
  );

  const apiEndpointFn = React.useCallback(
    () =>
      (updateApiEndpoint && apiEndpoint
        ? updateApiEndpoint(pageManager, apiEndpoint)
        : apiEndpoint) ?? "",
    [updateApiEndpoint, apiEndpoint, pageManager]
  );

  const queryKeyFn = React.useCallback(
    () =>
      (updateQueryKey && queryKey
        ? updateQueryKey(pageManager, queryKey)
        : queryKey) ?? [],
    [updateQueryKey, queryKey, pageManager]
  );

  // Mutation object to update the user's root layout settings.
  const putMutation = useMutation({
    requestType: "PUT",
    apiEndpointFn: apiEndpointFn,
    queryKeyFn: queryKeyFn,
    invalidateQueryKeys: invalidateQueryKeys,
  });
  const postMutation = useMutation({
    requestType: "POST",
    apiEndpointFn: apiEndpointFn,
    queryKeyFn: queryKeyFn,
    invalidateQueryKeys: invalidateQueryKeys,
    // Once the POST request was successful, we update the object's id attribute and switch to edit mode.
    onSuccessUpdateId: React.useMemo(
      () =>
        switchToEditMode ?? true
          ? (data: { [key: string]: StateContentTypes }) =>
              onSuccessHandler(
                data,
                dispatchPageManager,
                updateContentAfterSubmit
              )
          : undefined,
      [switchToEditMode, updateContentAfterSubmit]
    ),
  });

  const handleOnChange = React.useCallback(
    (event: OnChangeEventType, id: string, newValue?: StateContentTypes) => {
      dispatchPageManager({
        action: "ON_CHANGE",
        inputControlId: id,
        onChangeEvent: event,
        newValue: newValue,
      });
    },
    [dispatchPageManager]
  );

  const handleOnBlur = React.useCallback(
    (event: OnBlurEventType, id: string, newValue?: StateContentTypes) => {
      dispatchPageManager({
        action: "ON_BLUR",
        inputControlId: id,
        onBlurEvent: event,
        newValue: newValue,
      });
    },
    [dispatchPageManager]
  );

  const closeDialog = React.useCallback(() => {
    if (params.id && navigateable) {
      navigate("../");
    } else {
      dispatchPageManager({
        action: "CLOSE_DIALOG",
      });
    }
  }, [dispatchPageManager, params.id, navigateable, navigate]);

  const showEditDialog = React.useCallback(
    (title: string, reportLanguages: ReportLanguageLookup[], content: any) => {
      dispatchPageManager({
        action: "SHOW_EDIT_DIALOG",
        dialogTitle: title,
        reportLanguages: reportLanguages,
        content: content,
      });
    },
    []
  );

  const showViewDialog = React.useCallback(
    (title: string, reportLanguages: ReportLanguageLookup[], content: any) => {
      dispatchPageManager({
        action: "SHOW_VIEW_DIALOG",
        dialogTitle: title,
        reportLanguages: reportLanguages,
        content: content,
      });
    },
    []
  );

  const setErrors = React.useCallback((inputControlIds: string[]) => {
    dispatchPageManager({
      action: "SET_INPUT_ERROR",
      inputControlIds: inputControlIds,
    });
  }, []);

  const showNewDialog = React.useCallback(
    (
      title: string,
      reportLanguages: ReportLanguageLookup[],
      foreignKeyObject?: {
        [key: string]: string | dayjs.Dayjs;
      }
    ) => {
      dispatchPageManager({
        action: "SHOW_NEW_DIALOG",
        dialogTitle: title,
        reportLanguages: reportLanguages,
        foreignKeyObject: foreignKeyObject,
      });
    },
    []
  );

  const updateContent = React.useCallback((content: any) => {
    dispatchPageManager({
      action: "UPDATE_VALUES",
      content: content,
    });
  }, []);

  const submitOnly = React.useCallback(
    () =>
      onSubmitHandler({
        pageManager,
        dispatchPageManager,
        postMutation,
        putMutation,
      }),
    [pageManager, dispatchPageManager, postMutation, putMutation]
  );

  const submitAndCloseDialog = React.useCallback(() => {
    if (submitOnly()) {
      closeDialog();
    }
  }, [submitOnly, closeDialog]);

  const hasChanged = React.useMemo(() => {
    if (pageManager.flags) {
      return Object.values(pageManager.flags).reduce(
        (acc: boolean, item: StateFlagProps) => acc || item.edited,
        false
      );
    }
    return false;
  }, [pageManager.flags]);

  // Obtain the user's preferred report language or the default language as default.
  const preferredLanguage = React.useMemo(
    () => meQuery.data?.report_language ?? languageQuery.mainLanguage ?? null,
    [languageQuery.mainLanguage, meQuery.data?.report_language]
  );

  return React.useMemo(
    () => ({
      pageManager,
      dispatchPageManager,
      postMutation,
      putMutation,
      handleOnChange,
      handleOnBlur,
      closeDialog,
      showEditDialog,
      showNewDialog,
      showViewDialog,
      submitOnly,
      submitAndCloseDialog,
      columnsObject,
      resolveMultiLanguage,
      updateContent,
      hasChanged,
      navigateable: navigateable ?? false,
      switchToEditMode: switchToEditMode ?? true,
      params,
      navigate,
      meQuery,
      setErrors,
      languageQuery,
      preferredLanguage,
      me,
    }),
    [
      pageManager,
      dispatchPageManager,
      postMutation,
      putMutation,
      handleOnChange,
      handleOnBlur,
      closeDialog,
      showEditDialog,
      showNewDialog,
      showViewDialog,
      submitOnly,
      setErrors,
      submitAndCloseDialog,
      columnsObject,
      resolveMultiLanguage,
      updateContent,
      hasChanged,
      navigateable,
      switchToEditMode,
      params,
      navigate,
      meQuery,
      languageQuery,
      preferredLanguage,
      me,
    ]
  );
};
