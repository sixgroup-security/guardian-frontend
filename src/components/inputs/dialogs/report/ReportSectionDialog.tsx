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

import { Grid } from "@mui/material";
import {
  DefaultDetailsDialogProps,
  DetailsDialogv2 as DetailsDialog,
  Item,
} from "../DetailsDialog";
import DetailsDialogPaper from "../../../surfaces/DetailsDialogPager";
import { InputControlFieldWrapperv2 as InputControlFieldWrapper } from "../../InputControlWrapper";

interface TestGuideSectionDialogProps extends DefaultDetailsDialogProps {}

const ReportSectionDialog: React.FC<TestGuideSectionDialogProps> = (props) => {
  const { context } = props;
  return (
    <DetailsDialog disableEscapeKeyDown maxWidth="md" fullWidth {...props}>
      <DetailsDialogPaper>
        <Grid container spacing={2}>
          <Grid item xs={6} md={8}>
            <Item>
              <InputControlFieldWrapper id="name" context={context} />
            </Item>
          </Grid>
          <Grid item xs={6} md={4}>
            <Item>
              <InputControlFieldWrapper id="hide" context={context} />
            </Item>
          </Grid>
          <Grid item xs={6} md={12}>
            <Item>
              <InputControlFieldWrapper
                id="description"
                context={context}
                multiline
                minRows={4}
                maxRows={4}
              />
            </Item>
          </Grid>
        </Grid>
      </DetailsDialogPaper>
    </DetailsDialog>
  );
};

export default ReportSectionDialog;
