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

import dayjs from "dayjs";
import React from "react";
import { Grid, Box, Container, Tab } from "@mui/material";
import TabPanel from "@mui/lab/TabPanel";
import TabbedPane from "../../navigation/TabbedPane";
import {
  DefaultDetailsDialogProps,
  DetailsDialogv2 as DetailsDialog,
  Item,
} from "./DetailsDialog";
import DetailsDialogPaper from "../../surfaces/DetailsDialogPager";
import CommentView from "../../data/comment/CommentView";
import { InputControlFieldWrapperv2 as InputControlFieldWrapper } from "../InputControlWrapper";
import { ProjectState, DetailsDialogMode } from "../../../models/enums";
import { isOptionEqualToValue } from "../../../models/common";
import { queryKeyApplicationsLookup } from "../../../models/application/application";
import { URL_PROVIDER_TESTERS } from "../../../models/entity/provider";
import {
  queryKeyProjects,
  URL_PROJECT_COMMENTS,
} from "../../../models/project";
import { UsePageManagerReturn } from "../../../util/hooks/usePageManager";

interface ProjectDetailsDialogProps extends DefaultDetailsDialogProps {}

const DetailsSection = (props: {
  context: UsePageManagerReturn;
  testerApiEndpoint?: string;
}) => {
  const { context, testerApiEndpoint } = props;
  return (
    <>
      <DetailsDialogPaper>
        <Grid container spacing={2}>
          {/*Line 1*/}
          <Grid item xs={6} md={2}>
            <Item>
              <InputControlFieldWrapper id="project_id" context={context} />
            </Item>
          </Grid>
          <Grid item xs={6} md={6}>
            <Item>
              <InputControlFieldWrapper id="name" context={context} />
            </Item>
          </Grid>
          <Grid item xs={6} md={4}>
            <Item>
              <InputControlFieldWrapper id="project_type" context={context} />
            </Item>
          </Grid>
          {/*Line 2*/}
          <Grid item xs={6} md={3}>
            <Item>
              <InputControlFieldWrapper id="state" context={context} />
            </Item>
          </Grid>
          <Grid item xs={6} md={3}>
            <Item>
              <InputControlFieldWrapper id="start_date" context={context} />
            </Item>
          </Grid>
          <Grid item xs={6} md={3}>
            <Item>
              <InputControlFieldWrapper id="end_date" context={context} />
            </Item>
          </Grid>
          <Grid item xs={6} md={3}>
            <Item>
              <InputControlFieldWrapper
                id="completion_date"
                context={context}
                readonly={
                  context.pageManager.content?.state?.id !==
                  ProjectState.Completed
                }
              />
            </Item>
          </Grid>
          {/*Line 3*/}
          <Grid item xs={6} md={12}>
            <Item>
              <InputControlFieldWrapper id="applications" context={context} />
            </Item>
          </Grid>
          {/*Line 4*/}
          <Grid item xs={6} md={4}>
            <Item>
              <InputControlFieldWrapper id="location" context={context} />
            </Item>
          </Grid>
          <Grid item xs={6} md={4}>
            <Item>
              <InputControlFieldWrapper id="customer" context={context} />
            </Item>
          </Grid>
          <Grid item xs={6} md={4}>
            <Item>
              <InputControlFieldWrapper id="manager" context={context} />
            </Item>
          </Grid>
        </Grid>
      </DetailsDialogPaper>
      <DetailsDialogPaper>
        <Grid container spacing={2}>
          <Grid item xs={6} md={4}>
            <Item>
              <InputControlFieldWrapper id="provider" context={context} />
            </Item>
          </Grid>
          <Grid item xs={6} md={4}>
            <Item>
              <InputControlFieldWrapper
                id="lead_tester"
                context={context}
                apiEndpoint={testerApiEndpoint}
                queryKey={queryKeyApplicationsLookup}
                isOptionEqualToValue={isOptionEqualToValue}
              />
            </Item>
          </Grid>
          <Grid item xs={6} md={4}>
            <Item>
              <InputControlFieldWrapper
                id="testers"
                context={context}
                apiEndpoint={testerApiEndpoint}
                queryKey={queryKeyApplicationsLookup}
                isOptionEqualToValue={isOptionEqualToValue}
              />
            </Item>
          </Grid>
        </Grid>
      </DetailsDialogPaper>
      <DetailsDialogPaper>
        <Grid container spacing={2}>
          {/*Line 1*/}
          <Grid item xs={6} md={3}>
            <Item>
              <InputControlFieldWrapper
                id="classifications"
                context={context}
              />
            </Item>
          </Grid>
          <Grid item xs={6} md={3}>
            <Item>
              <InputControlFieldWrapper id="environments" context={context} />
            </Item>
          </Grid>
          <Grid item xs={6} md={3}>
            <Item>
              <InputControlFieldWrapper id="reasons" context={context} />
            </Item>
          </Grid>
          <Grid item xs={6} md={3}>
            <Item>
              <InputControlFieldWrapper id="tags" context={context} />
            </Item>
          </Grid>
        </Grid>
      </DetailsDialogPaper>
      {context.pageManager.mode != DetailsDialogMode.View && (
        <Container maxWidth="md">
          <Box>
            <DetailsDialogPaper>
              <Item sx={{ p: 1 }}>
                <InputControlFieldWrapper
                  id="comment"
                  context={context}
                  multiline
                  minRows={4}
                  maxRows={4}
                />
              </Item>
            </DetailsDialogPaper>
          </Box>
        </Container>
      )}
    </>
  );
};

const ProjectDetailsDialog: React.FC<ProjectDetailsDialogProps> = React.memo(
  (props) => {
    const { context } = props;
    const {
      pageManager: { content, mode },
      meQuery: { data: user },
    } = context;
    const commentEndpoint = React.useMemo(
      () =>
        content?.id
          ? URL_PROJECT_COMMENTS.replace("{project_id}", content.id)
          : undefined,
      [content.id]
    );
    const testerApiEndpoint = React.useMemo(
      () =>
        content.provider
          ? URL_PROVIDER_TESTERS.replace("{providerId}", content.provider.id)
          : undefined,
      [content.provider]
    );
    const tabTitles = React.useMemo(() => {
      const result = [
        <Tab id={"details"} key={"details"} label={"Details"} value={"0"} />,
      ];
      if (mode !== DetailsDialogMode.Create) {
        result.push(
          <Tab
            id={"comments"}
            key={"comments"}
            label={"Comments"}
            value={"1"}
          />
        );
      }
      return result;
    }, [mode]);
    const tabContents = React.useMemo(
      () => [
        <TabPanel
          id={"details"}
          key={"details"}
          value={"0"}
          sx={{ pl: 0, pr: 0 }}
        >
          <DetailsSection
            context={context}
            testerApiEndpoint={testerApiEndpoint}
          />
        </TabPanel>,
        <TabPanel
          id={"comments"}
          key={"comments"}
          value={"1"}
          sx={{ pl: 0, pr: 0 }}
        >
          <CommentView
            comments={content.comments}
            currentUser={user}
            readonly={mode === DetailsDialogMode.View}
            apiEndpoint={commentEndpoint}
            queryKey={queryKeyProjects}
          />
        </TabPanel>,
      ],
      [
        context,
        testerApiEndpoint,
        content.comments,
        user,
        mode,
        commentEndpoint,
      ]
    );

    // If the provider is not set, then testers should not be set either
    React.useEffect(() => {
      if (
        !content.provider &&
        (content?.testers?.length > 0 || content?.lead_tester)
      ) {
        props.context.updateContent({ lead_tester: null, testers: [] });
      }
    }, [
      content.provider,
      content?.testers,
      content?.lead_tester,
      props.context,
    ]);

    // Depending on the project's state, we might want to update the completion date.
    React.useEffect(() => {
      if (
        content?.state?.id !== ProjectState.Completed &&
        (content?.completion_date != null ||
          content?.completion_date != undefined)
      ) {
        props.context.updateContent({ completion_date: null });
      } else if (
        content?.state?.id === ProjectState.Completed &&
        (content?.completion_date == null ||
          content?.completion_date == undefined)
      ) {
        props.context.updateContent({ completion_date: dayjs(new Date()) });
      }
    }, [content?.state, content?.completion_date, props.context]);
    return (
      <DetailsDialog
        disableEscapeKeyDown
        maxWidth="xl"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            minHeight: "80vh",
            maxHeight: "80vh",
          },
        }}
        {...props}
      >
        <TabbedPane tabTitles={tabTitles} tabContents={tabContents} />
      </DetailsDialog>
    );
  }
);

export default ProjectDetailsDialog;
