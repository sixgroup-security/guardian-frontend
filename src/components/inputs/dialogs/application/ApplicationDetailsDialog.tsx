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
import { Grid, InputAdornment, Tab } from "@mui/material";
import TabPanel from "@mui/lab/TabPanel";
import LaunchIcon from "@mui/icons-material/Launch";
import TabbedPane from "../../../navigation/TabbedPane";
import {
  DefaultDetailsDialogProps,
  DetailsDialogv2 as DetailsDialog,
  Item,
} from "../DetailsDialog";
import DetailsDialogPaper from "../../../surfaces/DetailsDialogPager";
import { InputControlFieldWrapperv2 as InputControlFieldWrapper } from "../../InputControlWrapper";
import { MainPages } from "../../../../models/enums";
import {
  COLUMN_DEFINITION as PROJECT_COLUMN_DEFINITION,
  ProjectRead,
} from "../../../../models/project";
import { UsePageManagerReturn } from "../../../../util/hooks/usePageManager";
import { useQuery } from "../../../../util/hooks/tanstack/useQuery";
import { queryKeyProjects } from "../../../../models/project";
import PagesDataGrid from "../../../data/datagrid/PagesDataGrid";
import {
  renderCellProjects,
  valueGetterProjects,
} from "../../../../pages/Common";
import { URL_APPLICATION_PROJECTS } from "../../../../models/application/application";
import {
  GridActionsCellItem,
  GridRowParams,
  GridValidRowModel,
} from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";

const DetailsSection = React.memo(
  (props: { context: UsePageManagerReturn }) => {
    const { context } = props;
    const in_scope = context.pageManager.content.in_scoped ?? true;

    return (
      <>
        <DetailsDialogPaper>
          <Grid container spacing={2}>
            {/*Line 1*/}
            <Grid item xs={6} md={2}>
              <Item>
                <InputControlFieldWrapper
                  id="application_id"
                  context={context}
                />
              </Item>
            </Grid>
            <Grid item xs={6} md={8}>
              <Item>
                <InputControlFieldWrapper id="name" context={context} />
              </Item>
            </Grid>
            <Grid item xs={6} md={2}>
              <Item>
                <InputControlFieldWrapper id="state" context={context} />
              </Item>
            </Grid>
            {/*Line 2*/}
            <Grid item xs={6} md={4}>
              <Item>
                <InputControlFieldWrapper id="last_pentest" context={context} />
              </Item>
            </Grid>
            <Grid item xs={6} md={4}>
              <Item>
                <InputControlFieldWrapper id="next_pentest" context={context} />
              </Item>
            </Grid>
            <Grid item xs={6} md={4}>
              <Item>
                <InputControlFieldWrapper
                  id="pentest_periodicity"
                  context={context}
                  endAdornment={
                    <InputAdornment position="end">months</InputAdornment>
                  }
                />
              </Item>
            </Grid>
            {/*Line 3*/}
            <Grid item xs={6} md={12}>
              <Item>
                <InputControlFieldWrapper id="description" context={context} />
              </Item>
            </Grid>
          </Grid>
        </DetailsDialogPaper>
        <DetailsDialogPaper>
          <Grid container spacing={2}>
            {/*Line 4*/}
            <Grid item xs={6} md={6}>
              <Item>
                <InputControlFieldWrapper id="owner" context={context} />
              </Item>
            </Grid>
            <Grid item xs={6} md={6}>
              <Item>
                <InputControlFieldWrapper id="manager" context={context} />
              </Item>
            </Grid>
            <Grid item xs={6} md={6}>
              <Item>
                <InputControlFieldWrapper
                  id="inventory_tags"
                  context={context}
                />
              </Item>
            </Grid>
            <Grid item xs={6} md={6}>
              <Item>
                <InputControlFieldWrapper
                  id="classification_tags"
                  context={context}
                />
              </Item>
            </Grid>
            {/*Line 5*/}
            <Grid item xs={6} md={6}>
              <Item>
                <InputControlFieldWrapper
                  freeSolo
                  id="deployment_model_tags"
                  context={context}
                />
              </Item>
            </Grid>
          </Grid>
        </DetailsDialogPaper>
        <DetailsDialogPaper>
          <Grid container spacing={3}>
            <Grid item xs={1} md={2}>
              <Item>
                <InputControlFieldWrapper id="in_scoped" context={context} />
              </Item>
            </Grid>
            <Grid item xs={1} md={10}>
              <Item>
                <InputControlFieldWrapper
                  id="manual_pentest_periodicity"
                  context={context}
                  readonly={!in_scope}
                />
              </Item>
            </Grid>
            <Grid item xs={1} md={12}>
              <Item>
                <InputControlFieldWrapper
                  id="periodicity_details"
                  context={context}
                />
              </Item>
            </Grid>
          </Grid>
        </DetailsDialogPaper>
        <DetailsDialogPaper>
          <Grid container spacing={3}>
            <Grid item xs={6} md={12}>
              <Item>
                <InputControlFieldWrapper id="general_tags" context={context} />
              </Item>
            </Grid>
          </Grid>
        </DetailsDialogPaper>
      </>
    );
  }
);

const ApplicationDetailsDialog: React.FC<DefaultDetailsDialogProps> =
  React.memo((props) => {
    const navigate = useNavigate();
    const { context } = props;
    const { me } = context;
    const {
      pageManager: { content },
    } = context;
    // Load project data
    const projectQuery = useQuery({
      path: React.useMemo(
        () => URL_APPLICATION_PROJECTS.replace("{id}", content.id),
        [content.id]
      ),
      queryKey: React.useMemo(
        () => [...queryKeyProjects, content.id],
        [content.id]
      ),
      convertFn: React.useMemo(
        () => (data: any[]) => data.map((item) => new ProjectRead(item)),
        []
      ),
      enabled:
        content.id !== "" && content.id !== undefined && content.id !== null,
    });
    const projectData = React.useMemo(
      () => (projectQuery.data as Array<any>) ?? [],
      [projectQuery.data]
    );

    const getTableActions = React.useCallback(
      (params: GridRowParams<GridValidRowModel>) => [
        <GridActionsCellItem
          icon={<LaunchIcon />}
          label="Open"
          onClick={() =>
            navigate(`/projects/${params.row.project_id}?mode=edit`)
          }
        />,
      ],
      []
    );

    const tabTitles = React.useMemo(() => {
      const result = [
        <Tab id={"details"} key={"details"} label={"Details"} value={"0"} />,
      ];
      if (
        projectData.length > 0 &&
        me?.hasReadAccess(MainPages.ApplicationProjects) === true
      ) {
        result.push(
          <Tab
            id={"projects"}
            key={"projects"}
            label={"Projects"}
            value={"1"}
          />
        );
      }
      return result;
    }, [projectData, me]);

    const tabContents = React.useMemo(() => {
      const result = [
        <TabPanel
          id={"details"}
          key={"details"}
          value={"0"}
          sx={{ pl: 0, pr: 0 }}
        >
          <DetailsSection context={context} />
        </TabPanel>,
      ];

      if (
        projectData.length > 0 &&
        me?.hasReadAccess(MainPages.ApplicationProjects) === true
      ) {
        result.push(
          <TabPanel
            id={"projects"}
            key={"projects"}
            value={"1"}
            sx={{ pl: 0, pr: 0 }}
          >
            <Item style={{ height: "424px" }}>
              <PagesDataGrid
                autoPageSize
                page={MainPages.ApplicationProjects}
                user={context.me!}
                columns={PROJECT_COLUMN_DEFINITION}
                isLoading={projectQuery.isLoading}
                rows={projectQuery.data}
                getCellValueFn={valueGetterProjects}
                renderCellFn={renderCellProjects}
                getTableActions={getTableActions}
              />
            </Item>
          </TabPanel>
        );
      }
      return result;
    }, [
      projectData,
      context,
      projectQuery.data,
      projectQuery.isLoading,
      getTableActions,
      me,
    ]);

    return (
      <DetailsDialog
        disableEscapeKeyDown
        maxWidth="xl"
        fullWidth
        {...props}
        sx={{
          "& .MuiDialog-paper": {
            minHeight: "70vh",
            maxHeight: "70vh",
          },
        }}
      >
        <TabbedPane tabTitles={tabTitles} tabContents={tabContents} />
      </DetailsDialog>
    );
  });

export default ApplicationDetailsDialog;
