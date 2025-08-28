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
import { Grid } from "@mui/material";
import {
  DefaultDetailsDialogProps,
  DetailsDialogv2 as DetailsDialog,
  Item,
} from "./DetailsDialog";
import DetailsDialogPaper from "../../surfaces/DetailsDialogPager";
import { InputControlFieldWrapperv2 as InputControlFieldWrapper } from "../InputControlWrapper";
import { UserRole, getEnumAsObject } from "../../../models/enums";
import { isOptionEqualToValue } from "../../../models/common";
import {
  URL_CUSTOMERS,
  queryKeyCustomers,
} from "../../../models/entity/customer";
import {
  URL_PROVIDERS,
  queryKeyProviders,
} from "../../../models/entity/provider";

const UserDetailsDialog: React.FC<DefaultDetailsDialogProps> = React.memo(
  (props) => {
    const { context } = props;
    return (
      <DetailsDialog disableEscapeKeyDown maxWidth="xl" fullWidth {...props}>
        <DetailsDialogPaper>
          <Grid container spacing={2}>
            {/*Line 1*/}
            <Grid item xs={6} md={4}>
              <Item>
                <InputControlFieldWrapper
                  id="name"
                  context={context}
                  readonly={true}
                />
              </Item>
            </Grid>
            <Grid item xs={6} md={4}>
              <Item>
                <InputControlFieldWrapper
                  id="email"
                  context={context}
                  readonly={true}
                />
              </Item>
            </Grid>
            <Grid item xs={6} md={4}>
              <Item>
                <InputControlFieldWrapper
                  id="roles"
                  context={context}
                  options={getEnumAsObject(UserRole, "label")}
                  isOptionEqualToValue={isOptionEqualToValue}
                  readonly={true}
                />
              </Item>
            </Grid>
          </Grid>
        </DetailsDialogPaper>
        <DetailsDialogPaper>
          <Grid container spacing={2}>
            <Grid item xs={6} md={1.5}>
              <Item>
                <InputControlFieldWrapper
                  id="show_in_dropdowns"
                  size="small"
                  context={context}
                />
              </Item>
            </Grid>
            <Grid item xs={6} md={1}>
              <Item>
                <InputControlFieldWrapper
                  id="locked"
                  size="small"
                  context={context}
                />
              </Item>
            </Grid>
            <Grid item xs={6} md={2}>
              <Item>
                <InputControlFieldWrapper id="active_from" context={context} />
              </Item>
            </Grid>
            <Grid item xs={6} md={2}>
              <Item>
                <InputControlFieldWrapper id="active_until" context={context} />
              </Item>
            </Grid>
            <Grid item xs={6} md={2.5}>
              <Item>
                <InputControlFieldWrapper
                  id="customer"
                  context={context}
                  apiEndpoint={URL_CUSTOMERS}
                  queryKey={queryKeyCustomers}
                  getOptionLabel={(option) => option?.name ?? ""}
                  isOptionEqualToValue={isOptionEqualToValue}
                />
              </Item>
            </Grid>
            <Grid item xs={6} md={3}>
              <Item>
                <InputControlFieldWrapper
                  id="provider"
                  context={context}
                  apiEndpoint={URL_PROVIDERS}
                  queryKey={queryKeyProviders}
                  getOptionLabel={(option) => option?.name ?? ""}
                  isOptionEqualToValue={isOptionEqualToValue}
                />
              </Item>
            </Grid>
          </Grid>
        </DetailsDialogPaper>
      </DetailsDialog>
    );
  }
);
export default UserDetailsDialog;
