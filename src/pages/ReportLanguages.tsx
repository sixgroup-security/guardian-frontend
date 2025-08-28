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
import { GridColDef } from "@mui/x-data-grid";
import {
  ReportLanguage as ObjectRead,
  COLUMN_DEFINITION,
  URL_REPORT_LANGUAGES as URL,
  queryKeyReportLanguages as queryKey,
  URL_COUNTRIES_FLAG,
} from "../models/reportLanguage";
import { MainPages } from "../models/enums";
import ReportLanguageDetailsDialog from "../components/inputs/dialogs/ReportLanguageDetailsDialog";
import { CellValueFnType } from "../models/common";
import PagesDataGrid from "../components/data/datagrid/PagesDataGrid";
import LoadingIndicator from "../components/feedback/LoadingIndicator";
import UseMutationSnackbarAlert from "../components/feedback/snackbar/UseMutationSnackbarAlert";
import MainPaper from "../layout/MainPaper";
import ConfirmationDialog from "../components/feedback/ConfirmationDialog";
import { useLuminaCore } from "../util/hooks/useLuminaCore";
import { queryKeyUserMe } from "../models/user";
import { Alert } from "@mui/material";
import { CountryLookup } from "../models/country";
import RefreshProgress from "../components/feedback/RefreshProgress";

/*
   This function is used by the DataGrid component to custom-render cells.
   */
const renderCell = (column: GridColDef) => {
  if (column.field === "country") {
    return ({ value }: { value: string }) => (
      <img
        loading="lazy"
        width="30"
        key={"img_" + value}
        srcSet={`${URL_COUNTRIES_FLAG}/${value.toLowerCase()} 2x`}
        src={`${URL_COUNTRIES_FLAG}/${value.toLowerCase()}`}
        alt={value}
      />
    );
  }
};

const ReportLanguages = React.memo(() => {
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
    dataApiEndpoint: URL,
    dataQueryKey: queryKey,
    dataConvertFn: (data: any[]) => data.map((d) => new ObjectRead(d)),
    pageType: MainPages.ReportLanguages,
    invalidateQueryKeys: [queryKeyUserMe],
  });
  const { me } = pageManagerContext;

  const valueGetter = React.useCallback<CellValueFnType>((column) => {
    if (column.field === "country") {
      return ({ value }: { value: CountryLookup }) => value?.country_code ?? "";
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
        successMessage="Report language successfully updated."
      />
      <UseMutationSnackbarAlert
        mutation={pageManagerContext.postMutation}
        successMessage="Report language successfully created."
      />
      <UseMutationSnackbarAlert
        mutation={deletionMutation}
        successMessage="Report language successfully deleted."
      />
      <ReportLanguageDetailsDialog open={false} context={pageManagerContext} />
      <MainPaper>
        <PagesDataGrid
          page={MainPages.ReportLanguages}
          user={me!}
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

export default ReportLanguages;
