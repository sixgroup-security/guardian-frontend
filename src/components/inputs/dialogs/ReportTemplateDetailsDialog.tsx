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
import { Grid } from "@mui/material";
import {
  DefaultDetailsDialogProps,
  DetailsDialogv2 as DetailsDialog,
  Item,
} from "./DetailsDialog";
import DetailsDialogPaper from "../../surfaces/DetailsDialogPager";
import { InputControlFieldWrapperv2 as InputControlFieldWrapper } from "../InputControlWrapper";
import { URL_REPORT_TEMPLATE_FILES } from "../../../models/reportTemplate";
import { DetailsDialogMode } from "../../../models/enums";

export interface ReportTemplateDetailsDialogProps
  extends DefaultDetailsDialogProps {
  // The REST API endpoint to upload files.
  apiEndpoint?: string;
}

const ReportTemplateDetailsDialog: React.FC<ReportTemplateDetailsDialogProps> =
  React.memo((props) => {
    const { context } = props;
    const { pageManager: parentPageManager } = context;
    const uploadUrl = React.useMemo(
      () =>
        parentPageManager.mode !== DetailsDialogMode.Create &&
        parentPageManager.content.id
          ? URL_REPORT_TEMPLATE_FILES.replace(
              "{template_id}",
              parentPageManager.content.id?.toString() ?? ""
            )
          : undefined,
      [parentPageManager.mode, parentPageManager.content.id]
    );

    return (
      <DetailsDialog
        fullScreen
        disableEscapeKeyDown
        maxWidth="xl"
        fullWidth
        {...props}
      >
        <DetailsDialogPaper>
          <Grid container spacing={2}>
            {/*Line 1*/}
            <Grid item xs={6} md={6}>
              <Item>
                <InputControlFieldWrapper id="name" context={context} />
              </Item>
            </Grid>
            <Grid item xs={6} md={6}>
              <Item>
                <InputControlFieldWrapper id="version" context={context} />
              </Item>
            </Grid>
            <Grid item xs={6} md={12}>
              <Item>
                {/*Here, we create a language tab containing all multi-language controls. In this case, the InputControlFieldWrapper */}
                <InputControlFieldWrapper
                  // id="project_types"
                  context={context}
                  uploadUrl={uploadUrl}
                  insertLabel={true}
                />
              </Item>
            </Grid>
          </Grid>
        </DetailsDialogPaper>
      </DetailsDialog>
    );
  });

export default ReportTemplateDetailsDialog;
