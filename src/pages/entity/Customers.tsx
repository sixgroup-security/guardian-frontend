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
  CustomerRead as ObjectRead,
  COLUMN_CUSTOMER_DEFINITION as COLUMN_DEFINITION,
  URL_CUSTOMERS as URL,
  queryKeyCustomers as queryKey,
} from "../../models/entity/customer";
import { MainPages } from "../../models/enums";
import { CellValueFnType } from "../../models/common";
import { PagesDataGridv2 } from "../../components/data/datagrid/PagesDataGrid";
import LoadingIndicator from "../../components/feedback/LoadingIndicator";
import UseMutationSnackbarAlert from "../../components/feedback/snackbar/UseMutationSnackbarAlert";
import MainPaper from "../../layout/MainPaper";
import ConfirmationDialog from "../../components/feedback/ConfirmationDialog";
import { useLuminaCore } from "../../util/hooks/useLuminaCore";
import { URL_COUNTRIES_FLAG } from "../../models/reportLanguage";
import CustomerDetailsDialog from "../../components/inputs/dialogs/entity/CustomerDetailsDialog";
import { CUSTOMER_TITLE_NAME } from "../../util/consts/common";
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
    pageType: MainPages.Customers,
  });
  const {
    isLoadingAll,
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
    } else if (column.field === "manager") {
      return (value: any) => value?.value?.label ?? "";
    }
  }, []);

  // console.log(`${CUSTOMER_TITLE_NAME} page`, context);

  return (
    <>
      <LoadingIndicator open={isLoadingAll} />
      <ConfirmationDialog {...confirmationDialogState} />
      {/*For each operation we maintain our own notification bar, which allows reseting the respective mutation status to its original state.*/}
      <UseMutationSnackbarAlert
        mutation={pageManagerContext.putMutation}
        successMessage={`${CUSTOMER_TITLE_NAME} successfully updated.`}
      />
      <UseMutationSnackbarAlert
        mutation={pageManagerContext.postMutation}
        successMessage={`${CUSTOMER_TITLE_NAME} successfully created.`}
      />
      <UseMutationSnackbarAlert
        mutation={deletionMutation}
        successMessage={`${CUSTOMER_TITLE_NAME} successfully deleted.`}
      />
      <CustomerDetailsDialog open={false} context={pageManagerContext} />
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
