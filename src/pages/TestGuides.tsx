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
import { Link as DomRouterLink } from "react-router-dom";
import {
  TestGuideRead,
  COLUMN_DEFINITION,
  URL_PENTEST_TEST_GUIDES,
  queryKeyPenTestTestGuides,
} from "../models/testguide";
import { MainPages } from "../models/enums";
import TestGuideDetailsDialog from "../components/inputs/dialogs/testguide/TestGuideDetailsDialog.js";
import PagesDataGrid from "../components/data/datagrid/PagesDataGrid";
import LoadingIndicator from "../components/feedback/LoadingIndicator";
import UseMutationSnackbarAlert from "../components/feedback/snackbar/UseMutationSnackbarAlert";
import MainPaper from "../layout/MainPaper";
import ConfirmationDialog from "../components/feedback/ConfirmationDialog";
import { useLuminaCore } from "../util/hooks/useLuminaCore";
// Remux related imports for managing the year state.
import RefreshProgress from "../components/feedback/RefreshProgress.js";

const TestGuides = React.memo(() => {
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
  } = useLuminaCore({
    columnDefinition: COLUMN_DEFINITION,
    dataApiEndpoint: URL_PENTEST_TEST_GUIDES,
    dataQueryKey: queryKeyPenTestTestGuides,
    dataConvertFn: (data: any[]) => data.map((d) => new TestGuideRead(d)),
    switchToEditMode: true,
    pageType: MainPages.TestGuide,
  });
  const { me } = pageManagerContext;

  if (languageQuery.isSuccess && reportLanguages.length === 0) {
    return (
      <Alert severity="info">
        Please define a report language first by clicking{" "}
        <DomRouterLink to="/languages">here</DomRouterLink>.
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
        successMessage="Test Guide successfully updated."
      />
      <UseMutationSnackbarAlert
        mutation={pageManagerContext.postMutation}
        successMessage="Test Guide successfully created."
      />
      <UseMutationSnackbarAlert
        mutation={deletionMutation}
        successMessage="Test Guide successfully deleted."
      />
      <TestGuideDetailsDialog
        fullScreen
        open={false}
        context={pageManagerContext}
      />
      <MainPaper>
        <PagesDataGrid
          page={MainPages.TestGuide}
          user={me!}
          columns={COLUMN_DEFINITION}
          isLoading={query.isLoading}
          rows={query.data}
          getTableActions={getDefaultDataGridActions}
          onNewButtonClick={handleCreateDataGridRecord}
        />
      </MainPaper>
      <RefreshProgress query={query} />
    </>
  );
});

export default TestGuides;
