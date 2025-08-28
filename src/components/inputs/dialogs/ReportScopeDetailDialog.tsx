import React from "react";
import { Grid } from "@mui/material";
import {
  DefaultDetailsDialogProps,
  DetailsDialogv2 as DetailsDialog,
  Item,
} from "./DetailsDialog";
import DetailsDialogPaper from "../../surfaces/DetailsDialogPager";
import { InputControlFieldWrapperv2 as InputControlFieldWrapper } from "../InputControlWrapper";
import { isOptionEqualToValue } from "../../../models/common";

interface ReportScopeDetailsDialog extends DefaultDetailsDialogProps {
  url: string;
}

const ReportScopeDetailsDialog: React.FC<ReportScopeDetailsDialog> = React.memo(
  (props) => {
    const { context, url } = props;
    const reportSectionUrl = React.useMemo(
      () => url!.replace("/scope", "/report-sections"),
      [url]
    );

    return (
      <DetailsDialog disableEscapeKeyDown maxWidth="md" fullWidth {...props}>
        <DetailsDialogPaper>
          <Grid container spacing={2}>
            {/* Line 1: Asset and Type */}
            <Grid item sm={8}>
              <Item>
                <InputControlFieldWrapper id="asset" context={context} />
              </Item>
            </Grid>
            <Grid item sm={4}>
              <Item>
                <InputControlFieldWrapper id="type" context={context} />
              </Item>
            </Grid>
            {/* Line 2: View, Environment, Zone and MFA */}
            <Grid item sm={3}>
              <Item>
                <InputControlFieldWrapper id="view" context={context} />
              </Item>
            </Grid>
            <Grid item sm={3}>
              <Item>
                <InputControlFieldWrapper id="environment" context={context} />
              </Item>
            </Grid>
            <Grid item sm={3}>
              <Item>
                <InputControlFieldWrapper id="zone" context={context} />
              </Item>
            </Grid>
            <Grid item sm={3}>
              <Item>
                <InputControlFieldWrapper
                  id="strong_authentication"
                  context={context}
                />
              </Item>
            </Grid>
            {/* Line 3: Report Section */}
            <Grid item xs={12}>
              <Item>
                <InputControlFieldWrapper
                  id="report_section"
                  context={context}
                  apiEndpoint={reportSectionUrl}
                  getOptionLabel={React.useCallback(
                    (option: any) => option.name,
                    []
                  )}
                  isOptionEqualToValue={isOptionEqualToValue}
                />
              </Item>
            </Grid>
            {/* Line 4: Description */}
            <Grid item xs={12}>
              <Item>
                <InputControlFieldWrapper
                  id="description"
                  context={context}
                  multiline
                />
              </Item>
            </Grid>
          </Grid>
        </DetailsDialogPaper>
      </DetailsDialog>
    );
  }
);

export default ReportScopeDetailsDialog;
