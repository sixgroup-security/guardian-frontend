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
import { Tab, Typography, useTheme, Alert, Box } from "@mui/material";
import { TabContext, TabList } from "@mui/lab";
import Grid from "@mui/material/Unstable_Grid2";
import TabPanel from "@mui/lab/TabPanel";
import { useParams } from "react-router-dom";
import {
  ReportOverviewRead,
  ReportGeneralRead,
  queryKeyReportGeneralSuffix,
  queryKeyReportOverviewSuffix,
  URL_REPORTS_GENERAL_SUFFIX,
  URL_REPORTS_OVERVIEW_SUFFIX,
  URL_REPORTS_TESTING_SUFFIX,
  queryKeyReportTestingSuffix,
  ReportTestingRead,
} from "../models/report";
import TestingForm from "../components/inputs/dialogs/report/TestingForm";
import ReportVersionForm from "../components/inputs/dialogs/report/ReportVersionForm";
import TextField from "../components/inputs/TextField";
import ReportLanguageSelect from "../components/inputs/ReportLanguageSelect";
import LoadingIndicator from "../components/feedback/LoadingIndicator";
import ReportForm from "../components/inputs/dialogs/report/ReportForm";
import ReportScopeForm from "../components/inputs/dialogs/report/ReportScopeForm";
import MainPaper from "../layout/MainPaper";
import { useQueryReportData } from "../util/hooks/tanstack/useQueryReportData";

interface TabComponentProps {
  projectId: string | undefined;
  reportId: string | undefined;
  tabId: string;
  tabValue: string;
}

const ReportOverviewTab = React.memo((props: TabComponentProps) => {
  const { tabId, tabValue, projectId, reportId } = props;
  const query = useQueryReportData({
    pathSuffix: URL_REPORTS_OVERVIEW_SUFFIX,
    queryKey: queryKeyReportOverviewSuffix,
    convertFn: React.useCallback((x: any) => new ReportOverviewRead(x), []),
    projectId,
    reportId,
  });
  const { queryKey, reportBaseUrl, result: report } = query;

  if (query.isError) {
    return <Alert severity="error">Error loading data</Alert>;
  }
  if (query.isFetching || !report) {
    return <LoadingIndicator open={true} />;
  }

  return (
    <TabPanel
      id={tabId}
      value={tabValue}
      sx={{
        pl: 2,
        pr: 2,
        pb: 21.5,
        m: 0,
        height: "100%",
      }}
    >
      <Grid container spacing={2} sx={{ height: "100%" }}>
        <Grid xs={8}>
          <TextField
            id={"name"}
            label={"Name"}
            helperText="The report template used by the report."
            fullWidth={true}
            value={report?.reportTemplate?.name}
            readOnly
          />
        </Grid>
        <Grid xs={4}>
          <ReportLanguageSelect
            id={"reportLanguage"}
            label={"Report Language"}
            helperText="The report's language"
            value={report?.reportLanguage}
            onChange={() => {}}
            readOnly
          />
        </Grid>
        <Grid
          xs={12}
          sx={{
            height: "100%",
          }}
        >
          <ReportVersionForm queryKey={queryKey} queryUrl={reportBaseUrl} />
        </Grid>
      </Grid>
    </TabPanel>
  );
});

const ReportTestingTab = React.memo((props: TabComponentProps) => {
  const { tabId, tabValue, projectId, reportId } = props;
  // This state is updated when the user selects a node in the tree view. This allows us to display the correct details page.
  const [selectedNodeId, setSelectedNodeId] = React.useState<string>();
  // We obtain the report's testing data.
  const queryTesting = useQueryReportData({
    pathSuffix: URL_REPORTS_TESTING_SUFFIX,
    queryKey: queryKeyReportTestingSuffix,
    convertFn: React.useCallback((x: any) => new ReportTestingRead(x), []),
    projectId,
    reportId,
  });

  if (queryTesting.isError) {
    return <Alert severity="error">Error loading data</Alert>;
  }
  if (queryTesting.isFetching || !queryTesting.result) {
    return <LoadingIndicator open={true} />;
  }

  return (
    <TabPanel
      id={tabId}
      value={tabValue}
      sx={{
        b: 0,
        m: 0,
        p: 0,
        pb: 11,
        height: "100%",
        // overflow: "auto",
      }}
    >
      <TestingForm
        data={queryTesting}
        selectedNodeId={selectedNodeId}
        setSelectedNodeId={setSelectedNodeId}
      />
    </TabPanel>
  );
});

const Reports = React.memo(() => {
  const theme = useTheme();
  const [selectedTab, setSelectedTab] = React.useState("0");
  // Tabs: Settings, Executive Summary, Reporting, Vulnerabilities
  const { pid: projectId, rid: reportId } = useParams();
  // We obtain the report page's title.
  const queryTitle = useQueryReportData({
    pathSuffix: URL_REPORTS_GENERAL_SUFFIX,
    queryKey: queryKeyReportGeneralSuffix,
    convertFn: React.useCallback((x: any) => new ReportGeneralRead(x), []),
    projectId,
    reportId,
  });

  const handleTabChange = React.useCallback(
    (_event: React.SyntheticEvent, newValue: string) => {
      setSelectedTab(newValue);
    },
    []
  );

  const tabTitles = React.useMemo(
    () => [
      <Tab id={"overview"} key={"overview"} label={"Overview"} value={"0"} />,
      <Tab id={"testing"} key={"testing"} label={"Testing"} value={"1"} />,
      <Tab id={"report"} key={"report"} label={"Report"} value={"2"} />,
      <Tab id={"scope"} key={"scope"} label={"Scope"} value={"3"} />, // Scope tab added
    ],
    []
  );

  const tabContents = React.useMemo(
    () => [
      selectedTab === "0" ? (
        <ReportOverviewTab
          projectId={projectId}
          reportId={reportId}
          key="overview"
          tabId="overview"
          tabValue="0"
        />
      ) : undefined,
      selectedTab === "1" ? (
        <ReportTestingTab
          projectId={projectId}
          reportId={reportId}
          key="testing"
          tabId="testing"
          tabValue="1"
        />
      ) : undefined,
      selectedTab === "2" ? (
        <TabPanel
          key="report"
          id="report"
          value="2"
          sx={{
            b: 0,
            m: 0,
            p: 0,
            pb: 11,
            height: "100%",
            overflow: "auto",
          }}
        >
          <ReportForm projectId={projectId} reportId={reportId} />
        </TabPanel>
      ) : undefined,
      selectedTab === "3" ? (
        <TabPanel
          id={"scope"}
          key={"scope"}
          value={"3"}
          sx={{
            b: 0,
            m: 0,
            p: 2,
            pb: 11.5,
            height: "100%",
            overflow: "auto",
          }}
        >
          <ReportScopeForm
            reportId={reportId || ""}
            projectId={projectId || ""}
          />
        </TabPanel>
      ) : undefined,
    ],
    [projectId, reportId, selectedTab]
  );

  if (queryTitle.isFetching /*|| queryTesting.isFetching*/) {
    return <LoadingIndicator open={queryTitle.isLoading} />;
  } else if (queryTitle.isError /*|| queryTesting.isFetching*/) {
    return <Alert severity="error">Failed to load report.</Alert>;
  }

  return (
    <MainPaper>
      {queryTitle.isSuccess && (
        <Typography
          sx={{ b: 0, mt: 1, p: 0, display: "block", textAlign: "center" }}
          variant="caption"
          color={theme.palette.text.secondary}
        >
          {queryTitle.result?.projectId} - {queryTitle.result?.name}
        </Typography>
      )}

      <TabContext value={selectedTab}>
        <Box
          sx={{
            width: "100%",
            typography: "body1",
          }}
        >
          <TabList onChange={handleTabChange}>{tabTitles}</TabList>
        </Box>
        <Box sx={{ b: 0, m: 0, p: 0, height: "100%" }}>{tabContents}</Box>
      </TabContext>
    </MainPaper>
  );
});

export default Reports;
