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
import {
  queryKeyTestProcedures as queryKey,
  COLUMN_DEFINITION,
  URL_TEST_PROCEDURES as URL,
  TestProcedureRead as ObjectRead,
} from "../models/testProcedure";
import { MainPages } from "../models/enums";
import TemplateProcedureDetailsDialog from "../components/inputs/dialogs/TestProcedureDetailsDialog";
import { PagesDataGridv2 } from "../components/data/datagrid/PagesDataGrid";
import LoadingIndicator from "../components/feedback/LoadingIndicator";
import UseMutationSnackbarAlert from "../components/feedback/snackbar/UseMutationSnackbarAlert";
import MainPaper from "../layout/MainPaper";
import ConfirmationDialog from "../components/feedback/ConfirmationDialog";
import { useLuminaCore } from "../util/hooks/useLuminaCore";
import {
  renderCellTestProcedures as renderCell,
  valueGetterTestProcedures as valueGetter,
} from "./Common";
import RefreshProgress from "../components/feedback/RefreshProgress";

const TestProcedures = React.memo(() => {
  const context = useLuminaCore({
    columnDefinition: COLUMN_DEFINITION,
    dataApiEndpoint: URL,
    dataQueryKey: queryKey,
    dataConvertFn: React.useCallback(
      (data: any[]) => data.map((d) => new ObjectRead(d)),
      []
    ),
    switchToEditMode: true, // If true, then the dialog will be closed after a successful submit.
    pageType: MainPages.TestProcedures,
  });
  const {
    isLoadingAll,
    query,
    pageManagerContext,
    deletionMutation,
    confirmationDialogState,
    getDefaultDataGridActions,
    handleCreateDataGridRecord,
    languageQuery,
    reportLanguages,
  } = context;

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
        successMessage="Test procedure successfully updated."
      />
      <UseMutationSnackbarAlert
        mutation={pageManagerContext.postMutation}
        successMessage="Test procedure successfully created."
      />
      <UseMutationSnackbarAlert
        mutation={deletionMutation}
        successMessage="Test procedure successfully deleted."
      />
      <TemplateProcedureDetailsDialog
        open={false}
        context={context.pageManagerContext}
      />
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

export default TestProcedures;
