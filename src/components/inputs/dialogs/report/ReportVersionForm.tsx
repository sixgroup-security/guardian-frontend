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
import axios from "axios";
import React from "react";
import { Chip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DataObjectIcon from "@mui/icons-material/DataObject";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import BarChartIcon from "@mui/icons-material/BarChart";
import LogoDevIcon from "@mui/icons-material/LogoDev";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import {
  GridActionsCellItem,
  GridActionsCellItemProps,
  GridColDef,
  GridRowParams,
  GridValidRowModel,
} from "@mui/x-data-grid";
import {
  COLUMN_DEFINITION,
  ReportVersionRead as ObjectRead,
} from "../../../../models/reportVersion";
import { AutoCompleteEnumType, MainPages } from "../../../../models/enums";
import ReportVersionDetailsDialog from "./ReportVersionDetailsDialog";
import PagesDataGrid from "../../../data/datagrid/PagesDataGrid";
import LoadingIndicator from "../../../feedback/LoadingIndicator";
import UseMutationSnackbarAlert from "../../../feedback/snackbar/UseMutationSnackbarAlert";
import ConfirmationDialog from "../../../feedback/ConfirmationDialog";
import { useLuminaCore } from "../../../../util/hooks/useLuminaCore";
import { QueryKey } from "@tanstack/react-query";
import ReplayIcon from "@mui/icons-material/Replay";
import { useDataSubmission } from "../../../../util/hooks/useDataSubmission";
import { SnackbarAlertv2 } from "../../../feedback/snackbar/SnackbarAlert";
import PdfViewer from "./PdfViewer";
import { downloadFile } from "../../../../util/common";
import { usePdfViewerDialog } from "../../../../util/hooks/usePdfViewerDialog";
import { ChipColorType } from "../../../../models/common";
import dayjs from "dayjs";

const STATUS: {
  [key: string]: ChipColorType;
} = {
  Draft: "default",
  Final: "primary",
};

const CREATION_STATUS: {
  [key: string]: ChipColorType;
} = {
  Scheduled: "default",
  Generating: "primary",
  Failed: "error",
  Successful: "success",
};

/*
 *This function is used by the DataGrid component to custom-render cells.
 */
const renderCell = (column: GridColDef) => {
  if (column.field === "status") {
    return ({ value }: { value: string }) => {
      return <Chip label={value} color={STATUS[value]} variant="outlined" />;
    };
  } else if (column.field === "creation_status") {
    return ({ value }: { value: string }) => {
      return (
        value && (
          <Chip
            label={value}
            color={CREATION_STATUS[value]}
            variant="outlined"
          />
        )
      );
    };
  }
};

// Create function to obtain the correct value for a cell.
const valueGetter = (column: GridColDef) => {
  // The REST API returns an object containing the enum information. For the DataGrid, we have to extract the name attribute.
  if (column.field === "status") {
    return ({ value }: { value: AutoCompleteEnumType }) => value?.label ?? "";
  } else if (column.field === "creation_status") {
    return ({ value }: { value: AutoCompleteEnumType }) => value?.label ?? "";
  }
};

interface ReportVersionFormProps {
  queryUrl: string;
  queryKey: QueryKey;
}

const ReportVersionForm = React.memo((props: ReportVersionFormProps) => {
  const queryUrl = React.useMemo(
    () => props.queryUrl + "/versions",
    [props.queryUrl]
  );
  const queryKey = React.useMemo(
    () => [...props.queryKey, "version"],
    [props.queryKey]
  );
  const pdfViewerContext = usePdfViewerDialog();
  const context = useLuminaCore({
    columnDefinition: COLUMN_DEFINITION,
    dataApiEndpoint: queryUrl,
    dataQueryKey: queryKey,
    dataConvertFn: (data: any[]) => data.map((d) => new ObjectRead(d)),
    navigateable: false,
    dataGridActionSettings: {
      showDelete: true,
      showEdit: true,
      showView: true,
    },
    pageType: MainPages.ReportVersion,
    dataQueryEnabled: queryUrl?.length > 0,
  });
  const {
    query,
    hasWriteAccess,
    isLoadingAll,
    pageManagerContext,
    deletionMutation,
    confirmationDialogState,
    handleViewDataGridRecord,
    handleEditDataGridRecord,
    showConfirmationDialog,
    showNewDialog,
  } = context;
  // Create hook to send re-generate request
  const submit = useDataSubmission();
  const handleCreateDataGridRecord = React.useCallback(() => {
    // Open the dialog to create a new report version with the current date.
    showNewDialog("Create new report version", {
      report_date: dayjs(new Date().toLocaleDateString("en-CA")),
    });
  }, [showNewDialog]);
  // Create the DataGrid's Action column
  const getDefaultDataGridActions = React.useCallback(
    (
      params: GridRowParams<GridValidRowModel>
    ): React.ReactElement<GridActionsCellItemProps>[] => {
      const actions = [];
      // TODO: Implement error handling for donwloading file (download successful or fails).
      actions.push(
        <GridActionsCellItem
          icon={<VisibilityIcon />}
          label="View"
          onClick={() => handleViewDataGridRecord(params)}
        />
      );
      actions.push(
        <GridActionsCellItem
          showInMenu
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEditDataGridRecord(params)}
        />
      );

      if (params.row.has_pdf) {
        actions.push(
          <GridActionsCellItem
            showInMenu
            icon={<PictureAsPdfIcon />}
            label="View PDF"
            onClick={() =>
              pdfViewerContext.pdfViewerOpenHandler(
                queryUrl + "/" + params.row.id + "/view-pdf"
              )
            }
          />
        );
        actions.push(
          <GridActionsCellItem
            showInMenu
            icon={<PictureAsPdfIcon />}
            label="Download PDF"
            onClick={() =>
              downloadFile(queryUrl + "/" + params.row.id + "/pdf")
            }
          />
        );
      }

      actions.push(
        <GridActionsCellItem
          showInMenu
          icon={<DataObjectIcon />}
          label="Download JSON"
          onClick={() => downloadFile(queryUrl + "/" + params.row.id + "/json")}
        />
      );

      if (params.row.has_xlsx) {
        actions.push(
          <GridActionsCellItem
            showInMenu
            icon={<BarChartIcon />}
            label="Download XLSX"
            onClick={() =>
              downloadFile(queryUrl + "/" + params.row.id + "/xlsx")
            }
          />
        );
      }
      if (params.row.has_tex) {
        actions.push(
          <GridActionsCellItem
            showInMenu
            icon={<LogoDevIcon />}
            label="Download LaTeX Source"
            onClick={() =>
              downloadFile(queryUrl + "/" + params.row.id + "/tex")
            }
          />
        );
      }
      if (params.row.has_pdf_log) {
        actions.push(
          <GridActionsCellItem
            showInMenu
            icon={<TextSnippetIcon />}
            label="Download Log File"
            onClick={() =>
              downloadFile(queryUrl + "/" + params.row.id + "/pdf-log")
            }
          />
        );
      }
      if (
        ["Successful", "Failed"].includes(params.row.creation_status?.label)
      ) {
        actions.push(
          <GridActionsCellItem
            showInMenu
            icon={<ReplayIcon />}
            label="Regenerate Files"
            onClick={() =>
              submit.performSubmission({
                dataSubmissionFn: async () =>
                  await axios.put(
                    queryUrl + "/" + params.row.id + "/regenerate"
                  ),
                queryKey: queryKey,
              })
            }
          />
        );
      }

      if (hasWriteAccess) {
        actions.push(
          <GridActionsCellItem
            showInMenu
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => showConfirmationDialog(params)}
          />
        );
      }
      return actions;
    },
    [
      queryUrl,
      handleViewDataGridRecord,
      showConfirmationDialog,
      handleEditDataGridRecord,
      hasWriteAccess,
      queryKey,
      submit,
      pdfViewerContext,
    ]
  );

  return (
    <>
      <LoadingIndicator open={isLoadingAll} />
      <SnackbarAlertv2 context={submit} />
      <PdfViewer context={pdfViewerContext} />
      <ConfirmationDialog {...confirmationDialogState} />
      {/*For each operation we maintain our own notification bar, which allows reseting the respective mutation status to its original state.*/}
      <UseMutationSnackbarAlert
        mutation={pageManagerContext.putMutation}
        successMessage="Report version successfully updated."
      />
      <UseMutationSnackbarAlert
        mutation={pageManagerContext.postMutation}
        successMessage="Report version successfully created."
      />
      <UseMutationSnackbarAlert
        mutation={deletionMutation}
        successMessage="Report version successfully deleted."
      />
      <ReportVersionDetailsDialog open={false} context={pageManagerContext} />
      <PagesDataGrid
        page={MainPages.ReportVersion}
        user={pageManagerContext.me!}
        columns={COLUMN_DEFINITION}
        isLoading={query.isLoading}
        rows={query.data}
        getCellValueFn={valueGetter}
        renderCellFn={renderCell}
        getTableActions={getDefaultDataGridActions}
        onNewButtonClick={handleCreateDataGridRecord}
      />
    </>
  );
});

export default ReportVersionForm;
