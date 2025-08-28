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
import { Tab, Grid } from "@mui/material";
import { TabPanel } from "@mui/lab";
import TabbedPane from "../../../../navigation/TabbedPane";
import { Item } from "../../DetailsDialog";
import { URL_VULNERABILITY_TEMPLATES_PREFIX } from "../../../../../models/testProcedure";
import { queryKeyVulnerabilityTemplates } from "../../../../../models/vulnerabilityTemplate";
import ProcedureTreeNode from "../treeview/ProcedureTreeNode";
import AddVulnerabilitiesForm from "../../vulnerability/AddVulnerabilitiesForm";
import { ReportProcedureRead } from "../../../../../models/reportProcedure";
import { UsePageManagerReturn } from "../../../../../util/hooks/usePageManager";
import { InputControlFieldWrapperv2 as InputControlFieldWrapper } from "../../../InputControlWrapper";
import LoadingIndicator from "../../../../feedback/LoadingIndicator";
import SaveSpeedDial from "../../../../navigation/SaveSpeedDial";
import { ProcedureStatus, getEnumAsObject } from "../../../../../models/enums";
import { isOptionEqualToValue } from "../../../../../models/common";
import UseMutationSnackbarAlert from "../../../../feedback/snackbar/UseMutationSnackbarAlert";
import PageManagerSnackbarAlert from "../../../../feedback/snackbar/PageManagerSnackbarAlert";

interface ReportProcedureFormProps {
  node: ProcedureTreeNode;
  baseUrl: string;
  queryKey: any;
  // Used to submit data
  queryUrl: string;
  procedure: ReportProcedureRead;
  context: UsePageManagerReturn;
  onSubmit: () => void;
}

const ReportProcedureForm = React.memo((props: ReportProcedureFormProps) => {
  const { node, queryKey, context } = props;
  const url = node.getUrl();

  const tabTitles = React.useMemo(
    () => [
      <Tab id={"details"} key={"details"} label={"Details"} value={"0"} />,
      <Tab
        id={"vulnerabilities"}
        key={"vulnerabilities"}
        label={"vulnerabilities"}
        value={"1"}
      />,
    ],
    []
  );
  // console.log("ReportProcedureForm", props);
  const tabContents = React.useMemo(
    () => [
      <TabPanel
        id={"details"}
        key={"details"}
        value={"0"}
        sx={{
          pl: 0,
          pr: 0,
          height: "100%",
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={6} md={6}>
            <Item>
              <InputControlFieldWrapper
                id="status"
                context={context}
                options={getEnumAsObject(ProcedureStatus)}
                isOptionEqualToValue={isOptionEqualToValue}
              />
            </Item>
          </Grid>
          <Grid item xs={6} md={12}>
            <Item>
              <InputControlFieldWrapper
                id="objective"
                context={context}
                minRows={3}
                maxRows={3}
                readonly={true}
              />
            </Item>
          </Grid>
          <Grid item xs={6} md={12}>
            <Item>
              <InputControlFieldWrapper
                id="internal_documentation"
                context={context}
                minRows={12}
                maxRows={12}
                uploadUrl={props.queryUrl + "/files"}
              />
            </Item>
          </Grid>
          <Grid item xs={6} md={12}>
            <Item>
              <InputControlFieldWrapper id="hints" context={context} />
            </Item>
          </Grid>
        </Grid>
      </TabPanel>,
      <TabPanel
        id={"vulnerabilities"}
        key={"vulnerabilities"}
        value={"1"}
        sx={{ pl: 0, pr: 0 }}
      >
        <AddVulnerabilitiesForm
          procedureId={node.sourceProcedureId}
          queryBaseUrl={URL_VULNERABILITY_TEMPLATES_PREFIX}
          queryBaseQueryKey={queryKeyVulnerabilityTemplates}
          submissionBaseUrl={url + "/vulnerabilities"}
          submissionQueryKey={queryKey}
        />
      </TabPanel>,
    ],
    [url, queryKey, node.sourceProcedureId, context, props.queryUrl]
  );

  return (
    <>
      <LoadingIndicator open={context.putMutation.isPending} />
      <UseMutationSnackbarAlert
        mutation={context.putMutation}
        successMessage="Procedure successfully updated."
      />
      <PageManagerSnackbarAlert pageManagerContext={context} />
      <SaveSpeedDial onClick={props.onSubmit} />
      <LoadingIndicator open={context.putMutation.isPending} />
      <TabbedPane tabTitles={tabTitles} tabContents={tabContents} />
    </>
  );
});

export default ReportProcedureForm;
