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
import { Link } from "react-router-dom";
import { GridColDef } from "@mui/x-data-grid";
import {
  queryKeyMeasures as queryKey,
  COLUMN_DEFINITION,
  URL_MEASURES as URL,
  MeasureRead as ObjectRead,
} from "../models/measure";
import { MainPages } from "../models/enums";
import MeasureDetailsDialog from "../components/inputs/dialogs/MeasureDetailsDialog";
import { PagesDataGridv2 } from "../components/data/datagrid/PagesDataGrid";
import LoadingIndicator from "../components/feedback/LoadingIndicator";
import UseMutationSnackbarAlert from "../components/feedback/snackbar/UseMutationSnackbarAlert";
import MainPaper from "../layout/MainPaper";
import ConfirmationDialog from "../components/feedback/ConfirmationDialog";
import { useLuminaCore } from "../util/hooks/useLuminaCore";
import { TagLookup } from "../models/tagging/tag";
import { renderDataGridCellTags } from "./Common";
import { Alert } from "@mui/material";
import RefreshProgress from "../components/feedback/RefreshProgress";

/*
 *This function is used by the DataGrid component to custom-render cells.
 */
const renderCell = (column: GridColDef) => {
  if (["project_types", "general_tags"].includes(column.field)) {
    return ({ value }: { value: string[] }) => {
      return renderDataGridCellTags(value);
    };
  }
};

const valueGetter = (column: GridColDef) => {
  if (column.field === "project_types") {
    return ({ value }: { value: { id: string; label: string }[] }) =>
      value?.map((item) => item?.label ?? "") ?? [];
  } else if (column.field === "general_tags") {
    return ({ value }: { value: TagLookup[] }) => {
      return value?.map((item) => item?.name) ?? [];
    };
  }
};

const Measures = React.memo(() => {
  const context = useLuminaCore({
    columnDefinition: COLUMN_DEFINITION,
    dataApiEndpoint: URL,
    dataQueryKey: queryKey,
    dataConvertFn: (data: any[]) => data.map((d) => new ObjectRead(d)),
    switchToEditMode: true, // If true, then the dialog will be closed after a successful submit.
    pageType: MainPages.Measures,
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
        successMessage="Measure successfully updated."
      />
      <UseMutationSnackbarAlert
        mutation={pageManagerContext.postMutation}
        successMessage="Measure successfully created."
      />
      <UseMutationSnackbarAlert
        mutation={deletionMutation}
        successMessage="Measure successfully deleted."
      />
      <MeasureDetailsDialog open={false} context={pageManagerContext} />
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

export default Measures;
