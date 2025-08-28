import React from "react";
import {
  ReportScope as ObjectRead,
  COLUMN_DEFINITION,
  URL_REPORTS_SCOPE_SUFFIX,
  queryKeyReportScopes,
} from "../../../../models/reportScope";
import { MainPages } from "../../../../models/enums";
import PagesDataGrid from "../../../data/datagrid/PagesDataGrid";
import LoadingIndicator from "../../../feedback/LoadingIndicator";
import UseMutationSnackbarAlert from "../../../feedback/snackbar/UseMutationSnackbarAlert";
import ConfirmationDialog from "../../../feedback/ConfirmationDialog";
import { useLuminaCore } from "../../../../util/hooks/useLuminaCore";
import { Alert, Chip } from "@mui/material";
import ReportScopeDetailsDialog from "../ReportScopeDetailDialog";
import { GridColDef } from "@mui/x-data-grid";
import { useCalculateReportUrls } from "../../../../util/hooks/useCalculateReportUrls";

interface ReportScopeFormProps {
  reportId: string;
  projectId: string;
}

/*
 * Custom render logic for specific columns.
 */
const renderCell = (column: GridColDef) => {
  if (["view", "type", "environment"].includes(column.field)) {
    return ({ value }: { value: string }) => (
      <Chip key={value} label={value} color="primary" variant="outlined" />
    );
  }
};

/*
 * Function to extract values for specific columns
 */
const valueGetter = (column: GridColDef) => {
  if (["view", "type", "environment"].includes(column.field)) {
    return ({ value }: { value: { id: string; label: string } }) =>
      value?.label ?? "";
  }
  if (column.field === "report_section") {
    return ({ value }: { value: { id: string; name: string } }) =>
      value?.name ?? "";
  }
};

const ReportScopeForm: React.FC<ReportScopeFormProps> = ({
  reportId,
  projectId,
}: ReportScopeFormProps) => {
  // Obtain all values for specific API endpoint
  const { url, queryKey } = useCalculateReportUrls({
    pathSuffix: URL_REPORTS_SCOPE_SUFFIX,
    queryKeySuffix: queryKeyReportScopes,
    projectId,
    reportId,
  });

  const {
    isLoadingAll,
    query,
    pageManagerContext,
    deletionMutation,
    confirmationDialogState,
    getDefaultDataGridActions,
    handleCreateDataGridRecord,
  } = useLuminaCore({
    columnDefinition: COLUMN_DEFINITION,
    dataApiEndpoint: url,
    dataQueryKey: queryKey,
    dataConvertFn: React.useCallback(
      (data: any[]) => data.map((d) => new ObjectRead(d)),
      []
    ),
    navigateable: false,
    switchToEditMode: false,
    pageType: MainPages.ReportScope,
  });
  // console.log("ScopeForm", pageManagerContext);

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
        successMessage="Scope successfully updated."
      />
      <UseMutationSnackbarAlert
        mutation={pageManagerContext.postMutation}
        successMessage="Scope successfully created."
      />
      <UseMutationSnackbarAlert
        mutation={deletionMutation}
        successMessage="Scope successfully deleted."
      />
      <ReportScopeDetailsDialog
        open={false}
        context={pageManagerContext}
        url={url}
      />
      <PagesDataGrid
        page={MainPages.ReportScope}
        user={pageManagerContext.me!}
        columns={COLUMN_DEFINITION}
        isLoading={query.isLoading}
        rows={query.data}
        renderCellFn={renderCell}
        getCellValueFn={valueGetter}
        getTableActions={getDefaultDataGridActions}
        onNewButtonClick={handleCreateDataGridRecord}
      />
    </>
  );
};

export default ReportScopeForm;
