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
import dayjs from "dayjs";
import { Alert } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BarChartIcon from "@mui/icons-material/BarChart";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import AddIcon from "@mui/icons-material/Add";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import { useNavigate } from "react-router-dom";
import {
  GridRowParams,
  GridValidRowModel,
  GridActionsCellItem,
  GridActionsCellItemProps,
} from "@mui/x-data-grid";
import {
  ProjectRead as ObjectRead,
  COLUMN_DEFINITION,
  URL_PROJECTS,
  queryKeyProjects as queryKey,
  queryKeyProjectYears,
  ProjectRead,
} from "../models/project";
import {
  URL_REPORTS,
  NEW_REPORT_COLUMN_DEFINITION as REPORT_COLUMN_DEFINITION,
  ReportLookup,
} from "../models/report";
import { MainPages } from "../models/enums";
import ProjectDetailsDialog from "../components/inputs/dialogs/ProjectDetailsDialog";
import PagesDataGrid from "../components/data/datagrid/PagesDataGrid";
import LoadingIndicator from "../components/feedback/LoadingIndicator";
import UseMutationSnackbarAlert from "../components/feedback/snackbar/UseMutationSnackbarAlert";
import MainPaper from "../layout/MainPaper";
import ConfirmationDialog from "../components/feedback/ConfirmationDialog";
import { SelectedYear } from "../models/user";
import { usePageManager } from "../util/hooks/usePageManager";
import { useLuminaCore } from "../util/hooks/useLuminaCore";
// Remux related imports for managing the year state.
import CreateReportDialog from "../components/inputs/dialogs/report/CreateReportDialog";
import { useQueryUserMe } from "../util/hooks/tanstack/useQueryUserMe";
import { renderCellProjects, valueGetterProjects } from "./Common";
import { queryKeyApplications } from "../models/application/application";
import RefreshProgress from "../components/feedback/RefreshProgress";
import { downloadFile } from "../util/common";
import { usePdfViewerDialog } from "../util/hooks/usePdfViewerDialog";
import PdfViewer from "../components/inputs/dialogs/report/PdfViewer";

const Projects = React.memo(() => {
  const navigate = useNavigate();
  const meQuery = useQueryUserMe();
  const year = meQuery.data?.selected_year;
  const [currentProjectId, setCurrentProjectId] = React.useState<string>();
  const pdfViewerContext = usePdfViewerDialog();
  const {
    isLoadingAll,
    query,
    pageManagerContext,
    deletionMutation,
    confirmationDialogState,
    handleCreateDataGridRecord,
    // Required for table actions
    handleEditDataGridRecord,
    handleViewDataGridRecord,
    showConfirmationDialog,
    hasWriteAccess,
    hasDeleteAccess,
    reportLanguages,
  } = useLuminaCore({
    columnDefinition: COLUMN_DEFINITION,
    dataApiEndpoint: URL_PROJECTS,
    dataQueryKey: React.useMemo(() => [...queryKey, year], [year]),
    dataConvertFn: React.useCallback(
      (data: any[]) => data.map((d) => new ObjectRead(d)),
      []
    ),
    dataQueryParameters: React.useMemo(
      () => new SelectedYear(year ?? "All"),
      [year]
    ),
    dataQueryEnabled: year !== undefined && year !== null,
    invalidateQueryKeys: React.useMemo(
      () => [queryKeyProjectYears, queryKeyApplications],
      []
    ),
    // We merge the new content returned by server after submittion with the existing content.
    updateContentAfterSubmit: React.useCallback(
      (content: any, newContent: any) => {
        content.project_id = newContent.project_id;
        content.comments = newContent.comments;
        content.completion_date = dayjs(newContent.completion_date);
      },
      []
    ),
    pageType: MainPages.Projects,
  });
  const { me } = pageManagerContext;
  const hasWriteReportAccess = React.useMemo(
    () => me?.hasCreateAccess(MainPages.Reports) ?? false,
    [me]
  );
  const hasReadPdfReportAccess = React.useMemo(
    () => me?.hasCreateAccess(MainPages.PdfPenTestReport) ?? false,
    [me]
  );
  const hasReadXlsxReportAccess = React.useMemo(
    () => me?.hasCreateAccess(MainPages.XlsxPenTestReport) ?? false,
    [me]
  );
  // Dialog manager for creating a new report
  const reportPageManagerContext = usePageManager({
    columns: REPORT_COLUMN_DEFINITION,
    apiEndpoint: currentProjectId
      ? URL_REPORTS.replace("{project_id}", currentProjectId)
      : "",
    queryKey: currentProjectId ? [...queryKey] : undefined,
    switchToEditMode: true,
  });
  const { showNewDialog, submitAndCloseDialog } = reportPageManagerContext;

  // Function to display the report creation dialog
  const handleShowReportCreationDialog = React.useCallback(
    (project: ProjectRead) => {
      showNewDialog("Create new report", reportLanguages);
      setCurrentProjectId(project.id ?? undefined);
    },
    [showNewDialog, reportLanguages]
  );

  // Create the DataGrid's Action column
  const getDefaultDataGridActions = React.useCallback(
    (
      params: GridRowParams<GridValidRowModel>
    ): React.ReactElement<GridActionsCellItemProps>[] => {
      const actions = [];
      const pdfCount = params.row.reports.filter(
        (x: ReportLookup) => x.has_pdf
      ).length;
      const xlsxCount = params.row.reports.filter(
        (x: ReportLookup) => x.has_xlsx
      ).length;
      const project = params.row as ProjectRead;
      const showPdfReportMenuItem =
        hasReadPdfReportAccess && project.state?.id === 50 && pdfCount > 0;
      const showXlsxReportMenuItem =
        hasReadXlsxReportAccess && project.state?.id === 50 && xlsxCount > 0;
      const showInMenu =
        (hasWriteAccess ? 1 : 0) +
          (hasDeleteAccess ? 1 : 0) +
          (hasWriteReportAccess ? 1 : 0) +
          (showPdfReportMenuItem ? 1 : 0) +
          (showXlsxReportMenuItem ? 1 : 0) +
          ((hasWriteReportAccess ||
            showPdfReportMenuItem ||
            showXlsxReportMenuItem) &&
          params.row.reports.length > 1
            ? 1
            : 0) >
        1;

      const createReportName = (report: any) =>
        report.report_template.name +
        " (" +
        report.report_language.language_code.toUpperCase() +
        ")";
      if (hasWriteAccess) {
        actions.push(
          <GridActionsCellItem
            showInMenu={showInMenu}
            icon={<EditIcon />}
            label="Edit"
            onClick={() => handleEditDataGridRecord(params)}
          />
        );
      }
      if (hasDeleteAccess) {
        actions.push(
          <GridActionsCellItem
            showInMenu={showInMenu}
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => showConfirmationDialog(params)}
          />
        );
      }
      actions.push(
        <GridActionsCellItem
          icon={<VisibilityIcon />}
          label="View"
          onClick={() => handleViewDataGridRecord(params)}
        />
      );

      if (showPdfReportMenuItem) {
        project.reports.forEach((item: any) => {
          const baseUrl = `${URL_PROJECTS}/${project.id}/reports/${item.id}`;
          actions.push(
            <GridActionsCellItem
              showInMenu={showInMenu}
              icon={<PictureAsPdfIcon />}
              label={"View Final PDF Report: " + createReportName(item)}
              onClick={() =>
                pdfViewerContext.pdfViewerOpenHandler(`${baseUrl}/pdfview`)
              }
            />
          );
          actions.push(
            <GridActionsCellItem
              showInMenu={showInMenu}
              icon={<PictureAsPdfIcon />}
              label={"Download Final PDF Report: " + createReportName(item)}
              onClick={() => downloadFile(`${baseUrl}/pdf`)}
            />
          );
        });
      }

      if (showXlsxReportMenuItem) {
        project.reports.forEach((item: any) => {
          const baseUrl = `${URL_PROJECTS}/${project.id}/reports/${item.id}`;
          actions.push(
            <GridActionsCellItem
              showInMenu={showInMenu}
              icon={<BarChartIcon />}
              label={"Download Final Excel Report: " + createReportName(item)}
              onClick={() => downloadFile(`${baseUrl}/xlsx`)}
            />
          );
        });
      }

      if (!hasWriteReportAccess) {
        return actions;
      }

      // At the moment, we only support the creation of one report for penetration testing projects (ID=40).
      if (
        params.row.reports.length === 0 &&
        params.row.project_type.id === 40
      ) {
        actions.push(
          <GridActionsCellItem
            showInMenu={showInMenu}
            icon={<AddIcon />}
            label="Create Report"
            onClick={() => handleShowReportCreationDialog(project)}
          />
        );
      } else {
        project.reports.forEach((item: any) => {
          actions.push(
            <GridActionsCellItem
              showInMenu={showInMenu}
              icon={<FileOpenIcon />}
              label={"Open Report: " + createReportName(item)}
              onClick={() => navigate(`${project.id}/report/${item.id}`)}
            />
          );
        });
      }
      return actions;
    },
    [
      navigate,
      handleEditDataGridRecord,
      handleViewDataGridRecord,
      showConfirmationDialog,
      hasWriteAccess,
      handleShowReportCreationDialog,
      hasWriteReportAccess,
      hasReadPdfReportAccess,
      hasReadXlsxReportAccess,
      hasDeleteAccess,
      pdfViewerContext,
    ]
  );

  const onCreateReportHandler = React.useCallback(() => {
    submitAndCloseDialog();
  }, [submitAndCloseDialog]);

  if (query.isError) {
    return <Alert severity="error">Error loading data</Alert>;
  }
  return (
    <>
      <PdfViewer context={pdfViewerContext} />
      <LoadingIndicator open={isLoadingAll} />
      <ConfirmationDialog {...confirmationDialogState} />
      {/*For each operation we maintain our own notification bar, which allows reseting the respective mutation status to its original state.*/}
      <UseMutationSnackbarAlert
        mutation={pageManagerContext.putMutation}
        successMessage="Project successfully updated."
      />
      <UseMutationSnackbarAlert
        mutation={pageManagerContext.postMutation}
        successMessage="Project successfully created."
      />
      <UseMutationSnackbarAlert
        mutation={deletionMutation}
        successMessage="Project successfully deleted."
      />
      {hasWriteReportAccess && (
        <>
          <UseMutationSnackbarAlert
            mutation={reportPageManagerContext.postMutation}
            successMessage="Report successfully created."
          />
          <CreateReportDialog
            open={false}
            context={reportPageManagerContext}
            onSubmit={onCreateReportHandler}
          />
        </>
      )}
      <ProjectDetailsDialog open={false} context={pageManagerContext} />
      <ConfirmationDialog {...confirmationDialogState} />
      <MainPaper>
        <PagesDataGrid
          page={MainPages.Projects}
          user={meQuery.data!}
          columns={COLUMN_DEFINITION}
          isLoading={query.isLoading}
          rows={query.data}
          getCellValueFn={valueGetterProjects}
          renderCellFn={renderCellProjects}
          getTableActions={getDefaultDataGridActions}
          onNewButtonClick={handleCreateDataGridRecord}
        />
      </MainPaper>
      <RefreshProgress query={query} />
    </>
  );
});

export default Projects;
