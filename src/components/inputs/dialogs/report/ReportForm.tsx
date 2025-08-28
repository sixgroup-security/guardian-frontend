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
 * along with MyAwesomeProject. If not, see <https://www.gnu.org/licenses/>.
 *
 * @author Lukas Reiter
 * @copyright Copyright (C) 2024 Lukas Reiter
 * @license GPLv3
 */

import React from "react";
import {
  REPORT_UPDATE_COLUMNS,
  ReportUpdate,
  URL_REPORTS_MAIN_SUFFIX,
  queryKeyReportMainSuffix,
} from "../../../../models/report";
import {
  onSubmitHandler,
  usePageManager,
} from "../../../../util/hooks/usePageManager";
import { Alert, Grid } from "@mui/material";
import { Item } from "../DetailsDialog";
import SaveSpeedDial from "../../../navigation/SaveSpeedDial";
import { InputControlFieldWrapperv2 as InputControlFieldWrapper } from "../../InputControlWrapper";
import PageManagerSnackbarAlert from "../../../feedback/snackbar/PageManagerSnackbarAlert";
import LoadingIndicator from "../../../feedback/LoadingIndicator";
import UseMutationSnackbarAlert from "../../../feedback/snackbar/UseMutationSnackbarAlert";
import { useQueryReportData } from "../../../../util/hooks/tanstack/useQueryReportData";

interface ReportFormProps {
  projectId: string | undefined;
  reportId: string | undefined;
}

const ReportForm = React.memo((props: ReportFormProps) => {
  const { projectId, reportId } = props;
  // We obtain the project data.
  const query = useQueryReportData({
    pathSuffix: URL_REPORTS_MAIN_SUFFIX,
    queryKey: queryKeyReportMainSuffix,
    convertFn: React.useCallback((x: any) => new ReportUpdate(x), []),
    projectId,
    reportId,
    // disableAutoUpdate: false,
  });
  const { url, queryKey, reportBaseUrl: reportUrl, result: report } = query;
  // console.log("ReportForm", props);
  // This page manager is responsible for maintaining the state of the executive summary as well as the report prefix and postfix.
  const context = usePageManager({
    apiEndpoint: url,
    queryKey: queryKey,
    columns: REPORT_UPDATE_COLUMNS,
  });
  const { showEditDialog, closeDialog } = context;

  React.useEffect(() => {
    if (report) {
      showEditDialog("Enter report details.", [], report);
    }
  }, [
    // The following line causes an infinite loop.
    closeDialog,
    showEditDialog,
    report,
  ]);

  // We show an error, if requesting the data failed.
  if (query.isError) {
    return <Alert severity="error">Error loading data</Alert>;
  }

  // The page manager must be fully initialized before we can proceed.
  if (
    !context.pageManager.content ||
    Object.keys(context.pageManager.content).length == 0
  ) {
    return <LoadingIndicator open={true} />;
  }
  return (
    <>
      <SaveSpeedDial onClick={() => onSubmitHandler(context)} />
      <PageManagerSnackbarAlert pageManagerContext={context} />
      <UseMutationSnackbarAlert
        mutation={context.putMutation}
        successMessage="Report successfully updated."
      />
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Item sx={{ p: 2 }}>
            <InputControlFieldWrapper
              id="executive_summary"
              context={context}
              minRows={40}
              maxRows={40}
              insertLabel={true}
              uploadUrl={reportUrl + "/files"}
            />
          </Item>
        </Grid>
        <Grid item xs={12}>
          <Item sx={{ p: 2 }}>
            <InputControlFieldWrapper
              id="postfix_section_text"
              context={context}
              minRows={40}
              maxRows={40}
              insertLabel={true}
              uploadUrl={reportUrl + "/files"}
            />
          </Item>
        </Grid>
        <Grid item xs={12}>
          <Item sx={{ p: 2 }}>
            <InputControlFieldWrapper
              id="prefix_section_text"
              context={context}
              minRows={40}
              maxRows={40}
              insertLabel={true}
              uploadUrl={reportUrl + "/files"}
            />
          </Item>
        </Grid>
        <Grid item xs={12}>
          <Item sx={{ p: 2 }}>
            <InputControlFieldWrapper id="version" context={context} />
          </Item>
        </Grid>
      </Grid>
    </>
  );
});

export default ReportForm;
