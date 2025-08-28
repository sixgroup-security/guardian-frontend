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
import axios from "axios";
import { Grid } from "@mui/material";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import {
  DefaultDetailsDialogProps,
  DetailsDialogv2 as DetailsDialog,
  Item,
} from "../DetailsDialog";
import DetailsDialogPaper from "../../../surfaces/DetailsDialogPager";
import { InputControlFieldWrapperv2 as InputControlFieldWrapper } from "../../InputControlWrapper";
import { isOptionEqualToValue } from "../../../../models/common";
import {
  URL_COUNTRIES,
  URL_COUNTRIES_FLAG,
} from "../../../../models/reportLanguage";
import { queryKeyProjects } from "../../../../models/project";
import { ProjectType, getEnumAsObject } from "../../../../models/enums";
import { useDataSubmission } from "../../../../util/hooks/useDataSubmission";
import { SnackbarAlertv2 } from "../../../feedback/snackbar/SnackbarAlert";
import { onSubmitHandler } from "../../../../util/hooks/usePageManager";
import {
  ProjectCreation,
  ProjectSubmittion,
  URL_CREATE_PROJECTS,
} from "../../../../models/application/projectCreation";
import { queryKeyApplications } from "../../../../models/application/application";

interface CreateProjectsDialogProps extends DefaultDetailsDialogProps {
  model: GridRowSelectionModel;
}

const CreateProjectsDialog = React.memo((props: CreateProjectsDialogProps) => {
  const { context } = props;
  const { pageManager, dispatchPageManager, closeDialog } = context;
  const submit = useDataSubmission();
  // console.log("CreateProjectsDialog", context);

  const onSubmit = React.useCallback(async () => {
    const ok = onSubmitHandler({
      pageManager: pageManager,
      dispatchPageManager: dispatchPageManager, // We do not submit a post or put mutation object because we only want input validation
    });
    if (ok) {
      try {
        const content = new ProjectSubmittion(
          pageManager.content as ProjectCreation
        );
        // Here we update the backend
        await submit.performSubmission({
          dataSubmissionFn: async () =>
            await axios.post(URL_CREATE_PROJECTS, content, {
              headers: {
                "Content-Type": "application/json",
              },
            }),
          queryKey: queryKeyProjects,
          additionalQueryKeys: [queryKeyApplications],
          throwException: true,
        });
        closeDialog();
      } catch (ex) {
        console.error(ex);
      }
    }
  }, [pageManager, submit, dispatchPageManager, closeDialog]);

  return (
    <>
      <SnackbarAlertv2 context={submit} />
      <DetailsDialog
        disableEscapeKeyDown
        maxWidth="sm"
        fullWidth
        onSubmit={onSubmit}
        {...props}
      >
        <DetailsDialogPaper>
          <Grid container spacing={2}>
            <Grid item xs={6} md={6}>
              <Item>
                <InputControlFieldWrapper id="start" context={context} />
              </Item>
            </Grid>
            <Grid item xs={6} md={6}>
              <Item>
                <InputControlFieldWrapper
                  id="location"
                  context={context}
                  apiEndpoint={URL_COUNTRIES}
                  impageApiEndpoint={URL_COUNTRIES_FLAG}
                  getOptionLabel={(option) => option?.name ?? ""}
                  isOptionEqualToValue={isOptionEqualToValue}
                />
              </Item>
            </Grid>{" "}
            <Grid item xs={6} md={12}>
              <Item>
                <InputControlFieldWrapper
                  id="type"
                  readonly={true}
                  context={context}
                  options={getEnumAsObject(ProjectType)}
                  // getOptionLabel={(option) => option.label}
                  isOptionEqualToValue={isOptionEqualToValue}
                />
              </Item>
            </Grid>
          </Grid>
        </DetailsDialogPaper>
      </DetailsDialog>
    </>
  );
});

export default CreateProjectsDialog;
