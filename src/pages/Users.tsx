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
import { Alert, Chip, Stack } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { ChipColorType } from "../models/common";
import {
  UserRead as ObjectRead,
  COLUMN_DEFINITION,
  URL_USERS as URL,
  queryKeyUsers as queryKey,
} from "../models/user";
import { MainPages, AutoCompleteEnumType } from "../models/enums";
import { CellValueFnType } from "../models/common";
import { PagesDataGridv2 } from "../components/data/datagrid/PagesDataGrid";
import LoadingIndicator from "../components/feedback/LoadingIndicator";
import UseMutationSnackbarAlert from "../components/feedback/snackbar/UseMutationSnackbarAlert";
import MainPaper from "../layout/MainPaper";
import ConfirmationDialog from "../components/feedback/ConfirmationDialog";
import { useLuminaCore } from "../util/hooks/useLuminaCore";
import UserDetailsDialog from "../components/inputs/dialogs/UserDetailsDialog";
import RefreshProgress from "../components/feedback/RefreshProgress";

/*
 This function is used by the DataGrid component to custom-render cells.

 For possible Chip colors, see https://mui.com/material-ui/api/chip/#Chip-prop-color
 */
const renderCell = (column: GridColDef) => {
  if (column.field === "roles") {
    return ({ value }: { value: string[] }) => {
      const result = Object.values(value ?? []).map((item) => {
        let color: ChipColorType = "default";
        if (item === "Admin") {
          color = "error"; // Red
        } else if (item === "Auditor") {
          color = "info"; // Light Blue
        } else if (item === "Manager") {
          color = "primary"; // Dark Blue
        } else if (item === "Leadpentester") {
          color = "default"; // Grey
        } else if (item === "Pentester") {
          color = "default"; // Grey
        } else if (item === "Customer") {
          color = "success"; // Green
        } else {
          color = "info"; // Light Blue
        }
        return (
          <Chip
            key={
              Math.floor(
                Math.random() * 10000
              ) /* We need to create a unique key for each chip. */
            }
            label={item}
            variant="outlined"
            color={color}
          />
        );
      });
      return (
        <Stack direction="row" spacing={1}>
          {result}
        </Stack>
      );
    };
  }
};

const Users = React.memo(() => {
  const context = useLuminaCore({
    columnDefinition: COLUMN_DEFINITION,
    dataApiEndpoint: URL,
    dataQueryKey: queryKey,
    dataConvertFn: (data: any[]) => data.map((d) => new ObjectRead(d)),
    switchToEditMode: false,
    dataGridActionSettings: {
      showDelete: false,
      showEdit: true,
      showView: true,
    },
    pageType: MainPages.Users,
  });
  const {
    isLoadingAll,
    query,
    pageManagerContext,
    deletionMutation,
    confirmationDialogState,
    getDefaultDataGridActions,
  } = context;

  // Create function to obtain the correct value for a cell.
  const valueGetter = React.useCallback<CellValueFnType>((column) => {
    // The REST API returns an object containing the enum information. For the DataGrid, we have to extract the name attribute.
    if (column.field === "roles") {
      return ({ value }: { value: AutoCompleteEnumType[] }) =>
        (value ?? []).map((item) => item?.label ?? "");
    } else if (["provider", "customer"].includes(column.field)) {
      return ({ value }: { value: AutoCompleteEnumType }) => value?.name ?? "";
    }
  }, []);

  if (query.isError) {
    return <Alert severity="error">Error loading data</Alert>;
  }

  return (
    <>
      <LoadingIndicator open={isLoadingAll} />
      <ConfirmationDialog {...confirmationDialogState} />
      {/*For each operation we maintain our own notification bar, which allows reseting the respective mutation status to its original state.*/}
      <UseMutationSnackbarAlert
        mutation={pageManagerContext.putMutation}
        successMessage="User successfully updated."
      />
      <UseMutationSnackbarAlert
        mutation={pageManagerContext.postMutation}
        successMessage="User successfully created."
      />
      <UseMutationSnackbarAlert
        mutation={deletionMutation}
        successMessage="User successfully deleted."
      />
      <UserDetailsDialog open={false} context={pageManagerContext} />
      <MainPaper>
        <PagesDataGridv2
          context={context}
          dataConvertFn={(data: any) => new ObjectRead(data)}
          getCellValueFn={valueGetter}
          renderCellFn={renderCell}
          getTableActions={getDefaultDataGridActions}
        />
      </MainPaper>
      <RefreshProgress query={query} />
    </>
  );
});

export default Users;
