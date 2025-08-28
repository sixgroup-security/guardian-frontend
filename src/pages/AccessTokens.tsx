import { GridColDef } from "@mui/x-data-grid";
import {
  AccessToken as ObjectRead,
  COLUMN_DEFINITION,
  URL_ACCESS_TOKENS as URL,
  queryKeyAccessTokens as queryKey,
} from "../models/accessToken";
import { MainPages } from "../models/enums";
import PagesDataGrid from "../components/data/datagrid/PagesDataGrid";
import LoadingIndicator from "../components/feedback/LoadingIndicator";
import UseMutationSnackbarAlert from "../components/feedback/snackbar/UseMutationSnackbarAlert";
import MainPaper from "../layout/MainPaper";
import ConfirmationDialog from "../components/feedback/ConfirmationDialog";
import { useLuminaCore } from "../util/hooks/useLuminaCore";
import { Alert } from "@mui/material";
import AccessTokenDetailsDialog from "../components/inputs/dialogs/user/AccessTokenDetailDialog";
import React from "react";
import RefreshProgress from "../components/feedback/RefreshProgress.tsx";

/*
   This function is used by the DataGrid component to custom-render cells.
*/
const renderCell = (column: GridColDef) => {
  if (column.field === "type") {
    return ({ value }: { value: string }) => <span>{value}</span>; // Customize rendering for the 'type' field if necessary
  }
};

const valueGetter = (column: GridColDef) => {
  if (column.field === "type") {
    return (value: any) => value.value.label ?? "";
  }
};

const AccessTokens = React.memo(() => {
  const context = useLuminaCore({
    columnDefinition: COLUMN_DEFINITION,
    dataApiEndpoint: URL,
    dataQueryKey: queryKey,
    dataConvertFn: React.useCallback(
      (data: any[]) => data.map((d) => new ObjectRead(d)),
      []
    ),
    updateContentAfterSubmit: React.useCallback(
      (content: any, newContent: any) => {
        content.value = newContent.value;
        content.revoked = newContent.revoked;
      },
      []
    ),
    switchToEditMode: true, // If true, then the dialog will be closed after a successful submit.
    pageType: MainPages.AccessTokens,
  });
  const {
    isLoadingAll,
    query,
    meQuery,
    pageManagerContext,
    deletionMutation,
    confirmationDialogState,
    getDefaultDataGridActions,
    handleCreateDataGridRecord,
  } = context;

  if (query.isError) {
    return <Alert severity="error">Error loading data</Alert>;
  }

  return (
    <>
      <LoadingIndicator open={isLoadingAll} />
      <ConfirmationDialog {...confirmationDialogState} />
      <UseMutationSnackbarAlert
        mutation={pageManagerContext.putMutation}
        successMessage="Access token successfully updated."
      />
      <UseMutationSnackbarAlert
        mutation={pageManagerContext.postMutation}
        successMessage="Access token successfully created."
      />
      <UseMutationSnackbarAlert
        mutation={deletionMutation}
        successMessage="Access token successfully deleted."
      />
      <AccessTokenDetailsDialog open={false} context={pageManagerContext} />
      <MainPaper>
        <PagesDataGrid
          page={MainPages.AccessTokens}
          user={meQuery.data!}
          columns={COLUMN_DEFINITION}
          isLoading={query.isLoading}
          rows={query.data}
          getCellValueFn={valueGetter}
          renderCellFn={renderCell}
          getTableActions={getDefaultDataGridActions}
          onNewButtonClick={handleCreateDataGridRecord}
        />
      </MainPaper>
      <RefreshProgress query={query} />
    </>
  );
});

export default AccessTokens;
