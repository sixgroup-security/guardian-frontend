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
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useSearchParams } from "react-router-dom";
import {
  GridRowParams,
  GridValidRowModel,
  GridActionsCellItem,
  GridActionsCellItemProps,
} from "@mui/x-data-grid";
import { useQuery } from "./tanstack/useQuery";
import { MainPages, getPageTitle } from "../../models/enums";
import {
  GridColInputControlProps,
  StateContentTypes,
} from "../../models/common";
import {
  usePageManager,
  OnChangeEventType,
  OnBlurEventType,
  UsePageManagerReturn,
} from "./usePageManager";
import { NamedModelBase } from "../../models/common";
import { useDeleteDataGridRow } from "./useConfirmationDialog";
import { QueryKey, UseMutationResult } from "@tanstack/react-query";
import dayjs from "dayjs";

export type DataGridActionSettingsType = {
  showDelete: boolean;
  showEdit: boolean;
  showView: boolean;
};

interface LuminaCoreProps {
  columnDefinition: GridColInputControlProps[];
  // The REST API endpoint for querying the main data source for the current dialog
  dataApiEndpoint: string;
  // Query key used for querying the main data source for the current dialog
  dataQueryKey: QueryKey;
  // The REST API endpoint for creating/updating a new record
  submissionApiEditEndpoint?: string;
  // Query key used for creating/updating a new record
  submissionQueryKey?: QueryKey;
  // Function is used by useQuery to convert the received data to the desired object (e.g. ProjectRead)
  dataConvertFn: (data: any) => any;
  dataQueryParameters?: any;
  // Enables/disables the useQuery hook for the main data source for the current dialog
  dataQueryEnabled?: boolean;
  // Switches the details dialog from new to edit mode, once a new record has been created (default: true).
  switchToEditMode?: boolean;
  // The page type
  pageType: MainPages;
  foreignKeyObject?: { [key: string]: string };
  // If true, then corresponding details dialog can be directly navigated to (default: false).
  navigateable?: boolean;
  // This functions allow overwriting the GridActionsCellItem component's default event.
  addDataGridRecord?: (
    selectedTableRow: GridRowParams<GridValidRowModel>
  ) => void;
  deleteDataGridAction?: {
    title: string;
    fn: (selectedTableRow: GridRowParams<GridValidRowModel>) => void;
  };
  // Specifies which row menu items shall be displayed
  dataGridActionSettings?: DataGridActionSettingsType;
  // List of query keys that should be invalidated after a successful POST/PUT request.
  invalidateQueryKeys?: any[];
  // This function is called after the POST request was successful. It allows the calling developers to update specific values.
  updateContentAfterSubmit?: (content: any, newContent: any) => void;
}

export interface LuminaCoreReturn {
  isLoadingAll: boolean;
  meQuery: any;
  query: any;
  pageManagerContext: UsePageManagerReturn;
  deletionMutation: UseMutationResult;
  confirmationDialogState: any;
  getDefaultDataGridActions: (
    params: GridRowParams<GridValidRowModel>
  ) => React.ReactElement<GridActionsCellItemProps>[];
  handleCreateDataGridRecord: () => void;
  handleOnChange: (
    event: OnChangeEventType,
    id: string,
    newValue?: StateContentTypes | undefined
  ) => void;
  handleOnBlur: (
    event: OnBlurEventType,
    id: string,
    newValue?: StateContentTypes | undefined
  ) => void;
  showEditDialog: (title: string, content: any) => void;
  showViewDialog: (title: string, content: any) => void;
  showNewDialog: (
    title: string,
    foreignKeyObject?: {
      [key: string]: string | dayjs.Dayjs;
    }
  ) => void;
  closeDialog: () => void;
  handleEditDataGridRecord: (
    selectedTableRow: GridRowParams<GridValidRowModel>
  ) => void;
  handleViewDataGridRecord: (
    selectedTableRow: GridRowParams<GridValidRowModel>
  ) => void;
  showConfirmationDialog: (
    selectedTableRow: GridRowParams<GridValidRowModel>
  ) => void;
  updateContent: (content: any) => void;
  hasWriteAccess: boolean;
  hasDeleteAccess: boolean;
  hasCreateAccess: boolean;
  reportLanguages: any;
  languageQuery: any;
  mainLanguage: any;
  pageType: MainPages;
  columnDefinition: GridColInputControlProps[];
  submitAndCloseDialog: (context: UsePageManagerReturn) => void;
}

export const useLuminaCore = (props: LuminaCoreProps): LuminaCoreReturn => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");
  const { addDataGridRecord, dataGridActionSettings, deleteDataGridAction } =
    props;

  // Query project data from backend API
  const query = useQuery({
    queryKey: props.dataQueryKey,
    path: props.dataApiEndpoint,
    params: props.dataQueryParameters,
    enabled: props.dataQueryEnabled ?? true,
    // Here, we convert the received list of data objects into a list of ProjectRead objects.
    convertFn: props.dataConvertFn,
  });
  const pageManagerContext = usePageManager({
    columns: props.columnDefinition,
    apiEndpoint: props.submissionApiEditEndpoint
      ? props.submissionApiEditEndpoint
      : props.dataApiEndpoint,
    queryKey: props.submissionQueryKey
      ? props.submissionQueryKey
      : props.dataQueryKey,
    switchToEditMode: props.switchToEditMode,
    invalidateQueryKeys: props.invalidateQueryKeys,
    navigateable: props.navigateable ?? true,
    updateContentAfterSubmit: props.updateContentAfterSubmit,
  });
  const {
    params: { id },
    meQuery,
    me,
    languageQuery: { reportLanguages, languageQuery, mainLanguage },
    navigate,
    navigateable,
    dispatchPageManager,
    closeDialog,
    showEditDialog,
    showNewDialog,
    showViewDialog,
    submitAndCloseDialog,
  } = pageManagerContext;
  // Mutation hook for deleting a record
  const {
    showDialog: showConfirmationDialog,
    mutation: deletionMutation,
    ...confirmationDialogState
  } = useDeleteDataGridRow({
    apiEndpoint: props.dataApiEndpoint,
    queryKey: props.dataQueryKey,
  });
  // Determine write access permissions
  const { hasWriteAccess, hasDeleteAccess, hasCreateAccess } =
    React.useMemo(() => {
      return {
        hasWriteAccess: me?.hasWriteAccess(props.pageType) ?? false,
        hasDeleteAccess: me?.hasDeleteAccess(props.pageType) ?? false,
        hasCreateAccess: me?.hasCreateAccess(props.pageType) ?? false,
      };
    }, [me, props.pageType]);
  // Merge isLoading states from queries and mutations
  const isLoadingAll = React.useMemo(
    () =>
      meQuery.isLoading ||
      query.isLoading ||
      pageManagerContext.putMutation.isPending ||
      pageManagerContext.postMutation.isPending ||
      deletionMutation.isPending,
    [
      meQuery.isLoading,
      query.isLoading,
      pageManagerContext.putMutation.isPending,
      pageManagerContext.postMutation.isPending,
      deletionMutation.isPending,
    ]
  );

  const showEditDialogWrapper = React.useCallback(
    (title: string, content: any) => {
      showEditDialog(title, reportLanguages, content);
    },
    [showEditDialog, reportLanguages]
  );

  const handleEditDataGridRecord = React.useCallback(
    (selectedTableRow: GridRowParams<GridValidRowModel>) => {
      const content = selectedTableRow.row;
      if (navigateable === false) {
        showEditDialogWrapper(content.name, content);
      } else {
        navigate(content.getQueryId() + "?mode=edit");
      }
    },
    [navigate, navigateable, showEditDialogWrapper]
  );

  const showViewDialogWrapper = React.useCallback(
    (title: string, content: any) => {
      showViewDialog(title, reportLanguages, content);
    },
    [showViewDialog, reportLanguages]
  );

  const handleViewDataGridRecord = React.useCallback(
    (selectedTableRow: GridRowParams<GridValidRowModel>) => {
      const content = selectedTableRow.row;
      if (navigateable === false) {
        showViewDialogWrapper(content.name, content);
      } else {
        navigate(content.getQueryId());
      }
    },
    [navigate, navigateable, showViewDialogWrapper]
  );

  const showNewDialogWrapper = React.useCallback(
    (
      title: string,
      foreignKeyObject?: {
        [key: string]: string | dayjs.Dayjs;
      }
    ) => {
      showNewDialog(title, reportLanguages, foreignKeyObject);
    },
    [showNewDialog, reportLanguages]
  );

  const handleCreateDataGridRecord = React.useCallback(() => {
    showNewDialogWrapper(
      "Create new " + getPageTitle(props.pageType),
      props.foreignKeyObject
    );
  }, [showNewDialogWrapper, props.pageType, props.foreignKeyObject]);

  // If the user directly navigates to an item, then we directly show the details dialog.
  React.useEffect(() => {
    if (query.isSuccess && id) {
      const item = (query.data as NamedModelBase[]).find(
        (item) => item.getQueryId() === id
      );
      if (item) {
        dispatchPageManager({
          action:
            mode == "edit" && hasWriteAccess
              ? "SHOW_EDIT_DIALOG"
              : "SHOW_VIEW_DIALOG",
          dialogTitle: item.name,
          content: item,
          reportLanguages,
        });
      }
    }
  }, [
    hasWriteAccess,
    dispatchPageManager,
    query.isSuccess,
    // We must not use query.data here, because all changes becomes overwritten in the
    // update dialog once the DataGrid data becomes refreshed.
    // query.data,
    id,
    mode,
    reportLanguages,
  ]);

  // Create the DataGrid's Action column
  const getDefaultDataGridActions = React.useCallback(
    (
      params: GridRowParams<GridValidRowModel>
    ): React.ReactElement<GridActionsCellItemProps>[] => {
      const actions = [];
      const showInMenu =
        (hasWriteAccess ? 1 : 0) + (hasDeleteAccess ? 1 : 0) > 1;
      const { showDelete, showView, showEdit } = dataGridActionSettings ?? {
        showDelete: true,
        showView: true,
        showEdit: true,
      };
      if (hasWriteAccess && showEdit) {
        actions.push(
          <GridActionsCellItem
            showInMenu={showInMenu}
            icon={<EditIcon />}
            label="Edit"
            onClick={() => handleEditDataGridRecord(params)}
          />
        );
      }
      if (hasDeleteAccess && showDelete) {
        actions.push(
          <GridActionsCellItem
            showInMenu={showInMenu}
            icon={<DeleteIcon />}
            label={deleteDataGridAction?.title ?? "Delete"}
            onClick={() =>
              deleteDataGridAction
                ? deleteDataGridAction.fn(params)
                : showConfirmationDialog(params)
            }
          />
        );
      }
      if (showView) {
        actions.push(
          <GridActionsCellItem
            icon={<VisibilityIcon />}
            label="View"
            onClick={() => handleViewDataGridRecord(params)}
          />
        );
      }
      if (addDataGridRecord) {
        actions.push(
          <GridActionsCellItem
            icon={<AddIcon />}
            label="Add"
            onClick={() => addDataGridRecord!(params)}
          />
        );
      }
      return actions;
    },
    [
      handleEditDataGridRecord,
      handleViewDataGridRecord,
      showConfirmationDialog,
      hasWriteAccess,
      hasDeleteAccess,
      addDataGridRecord,
      dataGridActionSettings,
      deleteDataGridAction,
    ]
  );

  return React.useMemo(
    () => ({
      isLoadingAll,
      meQuery,
      query,
      pageManagerContext,
      deletionMutation,
      confirmationDialogState,
      getDefaultDataGridActions,
      handleCreateDataGridRecord,
      handleOnChange: pageManagerContext.handleOnChange,
      handleOnBlur: pageManagerContext.handleOnBlur,
      showEditDialog: showEditDialogWrapper,
      showViewDialog: showViewDialogWrapper,
      showNewDialog: showNewDialogWrapper,
      updateContent: pageManagerContext.updateContent,
      closeDialog: closeDialog,
      submitAndCloseDialog,
      handleEditDataGridRecord,
      handleViewDataGridRecord,
      showConfirmationDialog,
      hasWriteAccess,
      hasDeleteAccess,
      hasCreateAccess,
      reportLanguages,
      languageQuery,
      mainLanguage,
      pageType: props.pageType,
      columnDefinition: props.columnDefinition,
    }),
    [
      isLoadingAll,
      meQuery,
      query,
      pageManagerContext,
      deletionMutation,
      confirmationDialogState,
      getDefaultDataGridActions,
      handleCreateDataGridRecord,
      showEditDialogWrapper,
      showViewDialogWrapper,
      showNewDialogWrapper,
      closeDialog,
      submitAndCloseDialog,
      handleEditDataGridRecord,
      handleViewDataGridRecord,
      showConfirmationDialog,
      hasWriteAccess,
      hasDeleteAccess,
      hasCreateAccess,
      reportLanguages,
      languageQuery,
      mainLanguage,
      props.pageType,
      props.columnDefinition,
    ]
  );
};
