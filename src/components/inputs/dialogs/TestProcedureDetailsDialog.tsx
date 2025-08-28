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
import axios from "axios";
import { Grid, Typography, Alert, Stack } from "@mui/material";
import { GridRowParams, GridValidRowModel } from "@mui/x-data-grid";
import {
  DefaultDetailsDialogProps,
  DetailsDialogv2 as DetailsDialog,
  Item,
} from "./DetailsDialog";
import DetailsDialogPaper from "../../surfaces/DetailsDialogPager";
import { InputControlFieldWrapperv2 as InputControlFieldWrapper } from "../InputControlWrapper";
import LoadingIndicator from "../../feedback/LoadingIndicator";
import UseMutationSnackbarAlert from "../../feedback/snackbar/UseMutationSnackbarAlert";
import AddVulnerabilitiesDialog from "./vulnerability/AddVulnerabilitiesDialog";
import VulnerabilityTemplateDetailsDialog from "./vulnerability/VulnerabilityTemplateDetailsDialog";
import { DetailsDialogMode, MainPages } from "../../../models/enums";
import { useLuminaCore } from "../../../util/hooks/useLuminaCore";
import { PagesDataGridv2 } from "../../data/datagrid/PagesDataGrid";
import {
  VulnerabilityTemplateRead,
  COLUMN_DEFINITION,
  queryKeyVulnerabilityTemplates,
} from "../../../models/vulnerabilityTemplate";
import {
  URL_TEST_PROCEDURE_FILES,
  URL_VULNERABILITY_TEMPLATES_PREFIX,
} from "../../../models/testProcedure";
import { useDataSubmission } from "../../../util/hooks/useDataSubmission";
import { SnackbarAlertv2 } from "../../feedback/snackbar/SnackbarAlert";
import {
  renderCellVulnerabilityTemplate as renderCell,
  valueGetterVulnerabilityTemplate as valueGetter,
} from "../../../pages/Common";

export interface TestProcedureDetailsDialogProps
  extends DefaultDetailsDialogProps {}

const TestProcedureDetailsDialog: React.FC<TestProcedureDetailsDialogProps> =
  React.memo((props) => {
    const { context: parentContext } = props;
    const { pageManager: parentPageManager } = parentContext;
    const editViewMode =
      parentPageManager.mode === DetailsDialogMode.View ||
      parentPageManager.mode === DetailsDialogMode.Edit;
    const [openAddVulnerabilitiesDialog, setOpenAddVulnerabilitiesDialog] =
      React.useState(false);
    const procedureId = parentPageManager.content?.id?.toString() ?? "";
    const baseUrl = React.useMemo(
      () =>
        URL_VULNERABILITY_TEMPLATES_PREFIX.replace(
          "{procedure_id}",
          procedureId
        ),
      [procedureId]
    );
    const queryKey = React.useMemo(
      () => [...queryKeyVulnerabilityTemplates, procedureId],
      [procedureId]
    );
    const submit = useDataSubmission();
    const context = useLuminaCore({
      columnDefinition: COLUMN_DEFINITION,
      dataApiEndpoint: baseUrl,
      dataQueryKey: queryKey,
      dataConvertFn: (data: any[]) =>
        data.map((d) => new VulnerabilityTemplateRead(d)),
      dataQueryEnabled: editViewMode, // If there is no procedure ID yet, then we do have to fetch data from the backend.
      navigateable: false,
      pageType: MainPages.VulnerabilityTemplates,
      invalidateQueryKeys: queryKey,
      // Here we register a custom delete handler to just diassociate the vulnerability template from the procedure.
      deleteDataGridAction: {
        title: "Remove",
        fn: React.useCallback(
          (selectedTableRow: GridRowParams<GridValidRowModel>) => {
            // Update the backend by assigning the current
            submit.performSubmission({
              dataSubmissionFn: async () =>
                await axios.delete(baseUrl + "/" + selectedTableRow.id),
              queryKey: queryKey,
            });
          },
          [submit, queryKey, baseUrl]
        ),
      },
    });
    const { isLoadingAll, pageManagerContext, getDefaultDataGridActions } =
      context;

    // This method displays the AddVulnerabilititiesDialog
    const handleAddVulnerabilityClick = React.useCallback(() => {
      setOpenAddVulnerabilitiesDialog(true);
    }, []);
    // This method hides the AddVulnerabilititiesDialog
    const closeDialog = React.useCallback(() => {
      setOpenAddVulnerabilitiesDialog(false);
    }, []);
    // Obtain UUIDs of all vulnerability templates associated with this procedure.
    const vulnerabilityIds = React.useMemo(
      () =>
        (context.query.data ?? []).map(
          (item: VulnerabilityTemplateRead) => item.id
        ),
      [context.query.data]
    );

    const uploadUrl = React.useMemo(
      () =>
        parentPageManager.mode !== DetailsDialogMode.Create &&
        parentPageManager.content.id
          ? URL_TEST_PROCEDURE_FILES.replace(
              "{template_id}",
              parentPageManager.content.id?.toString() ?? ""
            )
          : undefined,
      [parentPageManager.mode, parentPageManager.content.id]
    );

    // console.log("TestProcedureDetailsDialog", context, vulnerabilityIds);
    return (
      <>
        <LoadingIndicator open={isLoadingAll} />
        <SnackbarAlertv2 context={submit} />
        {/*For each operation we maintain our own notification bar, which allows reseting the respective mutation status to its original state.*/}
        <UseMutationSnackbarAlert
          mutation={pageManagerContext.putMutation}
          successMessage="Vulnerability template successfully updated."
        />
        <AddVulnerabilitiesDialog
          open={openAddVulnerabilitiesDialog}
          procedureId={procedureId}
          vulnerabilityIds={vulnerabilityIds}
          onClose={closeDialog}
        />
        <VulnerabilityTemplateDetailsDialog
          open={false}
          context={context.pageManagerContext}
        />
        <DetailsDialog disableEscapeKeyDown maxWidth="xl" fullWidth {...props}>
          <DetailsDialogPaper>
            <Grid container spacing={2}>
              <Grid item xs={6} md={12}>
                <Item>
                  <InputControlFieldWrapper id="name" context={parentContext} />
                </Item>
                <Item>
                  <InputControlFieldWrapper
                    id="general_tags"
                    context={parentContext}
                  />
                </Item>
              </Grid>
            </Grid>
          </DetailsDialogPaper>
          <DetailsDialogPaper>
            <Grid container spacing={2}>
              <Grid item xs={6} md={12}>
                <Item>
                  <InputControlFieldWrapper
                    id="hints"
                    context={parentContext}
                    minRows={10}
                    maxRows={10}
                    uploadUrl={uploadUrl}
                  />
                </Item>
              </Grid>
            </Grid>
          </DetailsDialogPaper>
          <DetailsDialogPaper>
            <Grid container spacing={2}>
              <Grid item xs={6} md={12}>
                <Item>
                  {/*Here, we create a language tab containing all multi-language controls. In this case, the InputControlFieldWrapper */}
                  <InputControlFieldWrapper
                    // id="project_types"
                    context={parentContext}
                  />
                </Item>
              </Grid>
            </Grid>
          </DetailsDialogPaper>
          <DetailsDialogPaper sx={{ display: "block" }}>
            <Stack>
              <Item>
                <Typography variant="h6">
                  Associated Vulnerability Templates
                </Typography>
              </Item>
              <Item style={{ height: 350 }}>
                {editViewMode ? (
                  <PagesDataGridv2
                    context={context}
                    dataConvertFn={(data: any) =>
                      new VulnerabilityTemplateRead(data)
                    }
                    getCellValueFn={valueGetter}
                    renderCellFn={renderCell}
                    getTableActions={getDefaultDataGridActions}
                    onNewButtonClick={handleAddVulnerabilityClick}
                    newButtonName="Add"
                  />
                ) : (
                  <Alert severity="info" sx={{ m: 1, mb: 3 }}>
                    You must create the test procedure first.
                  </Alert>
                )}
              </Item>
            </Stack>
          </DetailsDialogPaper>
        </DetailsDialog>
      </>
    );
  });

export default TestProcedureDetailsDialog;
