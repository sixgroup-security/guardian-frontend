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
import { Alert } from "@mui/material";
import { Link } from "react-router-dom";
import { GridColDef } from "@mui/x-data-grid";
import {
  ReportTemplateRead as ObjectRead,
  COLUMN_DEFINITION,
  URL_PENTEST_REPORT_TEMPLATES as URL,
  queryKeyPenTestReportTemplates as queryKey,
} from "../models/reportTemplate";
import { MainPages } from "../models/enums";
import ReportTemplateDetailsDialog from "../components/inputs/dialogs/ReportTemplateDetailsDialog";
import { CellValueFnType } from "../models/common";
import { PagesDataGridv2 } from "../components/data/datagrid/PagesDataGrid";
import LoadingIndicator from "../components/feedback/LoadingIndicator";
import UseMutationSnackbarAlert from "../components/feedback/snackbar/UseMutationSnackbarAlert";
import MainPaper from "../layout/MainPaper";
import ConfirmationDialog from "../components/feedback/ConfirmationDialog";
import { useLuminaCore } from "../util/hooks/useLuminaCore";
import { renderDataGridCellTags } from "./Common";
import RefreshProgress from "../components/feedback/RefreshProgress";

/*
 *This function is used by the DataGrid component to custom-render cells.
 */
const renderCell = (column: GridColDef) => {
  if (column.field === "project_types") {
    return ({ value }: { value: string[] }) => {
      return renderDataGridCellTags(value);
    };
  }
};

const ReportTemplates = React.memo(() => {
  const context = useLuminaCore({
    columnDefinition: COLUMN_DEFINITION,
    dataApiEndpoint: URL,
    dataQueryKey: queryKey,
    dataConvertFn: (data: any[]) => data.map((d) => new ObjectRead(d)),
    switchToEditMode: true, // If true, then the dialog will be closed after a successful submit.
    pageType: MainPages.ReportTemplates,
  });
  const {
    isLoadingAll,
    query,
    pageManagerContext,
    deletionMutation,
    confirmationDialogState,
    getDefaultDataGridActions,
    handleCreateDataGridRecord,
    reportLanguages,
    languageQuery,
  } = context;

  const valueGetter = React.useCallback<CellValueFnType>((column) => {
    if (column.field === "project_types") {
      return ({ value }: { value: { id: string; name: string }[] }) =>
        (value ?? []).map((item) => item?.name ?? "");
    }
  }, []);

  if (languageQuery.isSuccess && reportLanguages.length === 0) {
    return (
      <Alert severity="info">
        Please define a report language first by clicking{" "}
        <Link to="/languages">here</Link>.
      </Alert>
    );
  }

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
        successMessage="Report template successfully updated."
      />
      <UseMutationSnackbarAlert
        mutation={pageManagerContext.postMutation}
        successMessage="Report template successfully created."
      />
      <UseMutationSnackbarAlert
        mutation={deletionMutation}
        successMessage="Report template successfully deleted."
      />
      <ReportTemplateDetailsDialog open={false} context={pageManagerContext} />
      <MainPaper>
        <PagesDataGridv2
          dataConvertFn={(data: any) => new ObjectRead(data)}
          context={context}
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

export default ReportTemplates;
