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
  ProviderRead as ObjectRead,
  COLUMN_PROVIDER_DEFINITION as COLUMN_DEFINITION,
  URL_PROVIDERS as URL,
  queryKeyProviders as queryKey,
} from "../../models/entity/provider";
import { MainPages } from "../../models/enums";
import { CellValueFnType } from "../../models/common";
import { PagesDataGridv2 } from "../../components/data/datagrid/PagesDataGrid";
import LoadingIndicator from "../../components/feedback/LoadingIndicator";
import UseMutationSnackbarAlert from "../../components/feedback/snackbar/UseMutationSnackbarAlert";
import MainPaper from "../../layout/MainPaper";
import ConfirmationDialog from "../../components/feedback/ConfirmationDialog";
import { useLuminaCore } from "../../util/hooks/useLuminaCore";
import { URL_COUNTRIES_FLAG } from "../../models/reportLanguage";
import ProviderDetailsDialog from "../../components/inputs/dialogs/entity/ProviderDetailsDialog";
import { Alert } from "@mui/material";
import { CountryLookup } from "../../models/country";

/*
 * This function is used by the DataGrid component to custom-render cells.
 */
const renderCell = (column: GridColDef) => {
  if (column.field === "location") {
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

const Providers = React.memo(() => {
  const context = useLuminaCore({
    columnDefinition: COLUMN_DEFINITION,
    dataApiEndpoint: URL,
    dataQueryKey: queryKey,
    dataConvertFn: (data: any[]) => data.map((d) => new ObjectRead(d)),
    pageType: MainPages.Providers,
  });
  const {
    isLoadingAll,
    query,
    pageManagerContext,
    deletionMutation,
    confirmationDialogState,
    getDefaultDataGridActions,
    handleCreateDataGridRecord,
  } = context;

  // Create function to obtain the correct value for a cell.
  const valueGetter = React.useCallback<CellValueFnType>((column) => {
    if (column.field === "location") {
      return ({ value }: { value: CountryLookup }) => value?.country_code ?? "";
    }
  }, []);

  // console.log("Providers page", context);

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
        successMessage="Provider successfully updated."
      />
      <UseMutationSnackbarAlert
        mutation={pageManagerContext.postMutation}
        successMessage="Provider successfully created."
      />
      <UseMutationSnackbarAlert
        mutation={deletionMutation}
        successMessage="Provider successfully deleted."
      />
      <ProviderDetailsDialog open={false} context={pageManagerContext} />
      <MainPaper>
        <PagesDataGridv2
          context={context}
          dataConvertFn={(data: any) => new ObjectRead(data)}
          getCellValueFn={valueGetter}
          renderCellFn={renderCell}
          getTableActions={getDefaultDataGridActions}
          onNewButtonClick={handleCreateDataGridRecord}
        />
      </MainPaper>
    </>
  );
});

export default Providers;
