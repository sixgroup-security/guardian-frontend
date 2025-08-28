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
import { useMutation } from "./tanstack/useMutation";
import { GridRowParams, GridValidRowModel } from "@mui/x-data-grid";
import { QueryKey } from "@tanstack/react-query";

type StatePropsType = {
  open: boolean;
  onConfirm: (...args: any[]) => void;
};

export interface UseConfirmationDialogReturn {
  open: boolean;
  onConfirm: (...args: any[]) => void;
  title: string;
  message: string;
  onCancel: () => void;
  showDialog: (doConfirmedAction: () => void) => void;
}

export const useConfirmationDialog = ({
  open,
  title,
  message,
}: {
  open?: boolean;
  title: string;
  message: string;
}): UseConfirmationDialogReturn => {
  const [openState, setOpen] = React.useState<StatePropsType>({
    open: open === true,
    onConfirm: () => {},
  });

  const cancelHandler = React.useCallback(() => {
    setOpen((state) => ({ ...state, open: false }));
  }, []);

  const showDialog = React.useCallback((doConfirmedAction: () => void) => {
    setOpen((state) => ({
      ...state,
      open: true,
      onConfirm: doConfirmedAction,
    }));
  }, []);

  return {
    open: openState.open,
    onConfirm: openState.onConfirm,
    title,
    message,
    onCancel: cancelHandler,
    showDialog: showDialog,
  };
};

export const useDeleteDataGridRow = ({
  apiEndpoint,
  queryKey,
}: {
  apiEndpoint: string;
  queryKey: QueryKey;
}) => {
  const confirmationDialog = useConfirmationDialog({
    title: "Delete item ...",
    message: "Are you sure you want to permanently delete the item?",
  });

  // Mutation object to update the user's root layout settings.
  const deleteMutation = useMutation({
    requestType: "DELETE",
    apiEndpointFn: () => apiEndpoint,
    queryKeyFn: () => queryKey,
  });

  const deleteRow = React.useCallback(
    (selectedTableRow: GridRowParams<GridValidRowModel>) => {
      confirmationDialog.showDialog(() => {
        deleteMutation.mutate(selectedTableRow.row.id);
      });
    },
    [confirmationDialog, deleteMutation]
  );

  return React.useMemo(
    () => ({
      open: confirmationDialog.open,
      title: confirmationDialog.title,
      message: confirmationDialog.message,
      onCancel: confirmationDialog.onCancel,
      onConfirm: confirmationDialog.onConfirm,
      showDialog: deleteRow,
      mutation: deleteMutation,
    }),
    [
      confirmationDialog.open,
      confirmationDialog.title,
      confirmationDialog.message,
      confirmationDialog.onCancel,
      confirmationDialog.onConfirm,
      deleteRow,
      deleteMutation,
    ]
  );
};
