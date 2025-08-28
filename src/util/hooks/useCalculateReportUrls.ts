import React from "react";
import { QueryKey } from "@tanstack/react-query";
import { URL_REPORTS, queryKeyReports } from "../../models/report.ts";

interface UseCalculateReportUrlType {
  // The path suffix of the report URL: /projects/{project_id}/reports/{report_id}/SUFFIX
  pathSuffix?: string;
  // The query key suffix for the report URL: [...queryKeyReports, { report: reportId }, SUFFIX]
  queryKeySuffix?: QueryKey;
  // The project's UUID
  projectId: string | undefined | null;
  // The report's UUID
  reportId: string | undefined | null;
}

interface UseCalculateReportUrlResult {
  // The project's UUID
  projectId: string | undefined | null;
  // The report's UUID
  reportId: string | undefined | null;
  // URL to obtain all reports of a specific project: /projects/{project_id}/reports
  projectReportsBaseUrl: string;
  // Base URL to obtain information about a report: /projects/{project_id}/reports/{report_id}
  reportBaseUrl: string;
  // The query key for return value reportBaseUrl
  reportBaseQueryKey: QueryKey;
  // URL used to query the returned data: reportBaseUrl + provided suffix
  url: string;
  // The query key for return value url
  queryKey: QueryKey;
  // Returns true if the variables projectId and reportId are valid
  valid: boolean;
}

/*
 * This hook is used by all report components to fetch their respective project data.
 */
export const useCalculateReportUrls = (
  props: UseCalculateReportUrlType
): UseCalculateReportUrlResult => {
  const { pathSuffix, projectId, reportId, queryKeySuffix } = props;

  const projectReportsBaseUrl = React.useMemo(
    () => URL_REPORTS.replace("{project_id}", projectId ?? ""),
    [projectId]
  );
  // /projects/{project_id}/reports/{report_id}
  const reportBaseUrl = React.useMemo(
    () => projectReportsBaseUrl + "/" + reportId,
    [projectReportsBaseUrl, reportId]
  );
  const url = React.useMemo(
    () => reportBaseUrl + (pathSuffix ?? ""),
    [reportBaseUrl, pathSuffix]
  );
  const reportBaseQueryKey = React.useMemo(
    () => [...queryKeyReports, { report: reportId }],
    [reportId]
  );
  const queryKey = React.useMemo(
    () =>
      queryKeySuffix
        ? [...reportBaseQueryKey, ...queryKeySuffix]
        : reportBaseQueryKey,
    [reportBaseQueryKey, queryKeySuffix]
  );
  const valid = React.useMemo(
    () => projectId !== undefined && reportId !== undefined,
    [projectId, reportId]
  );
  return React.useMemo(() => {
    return {
      projectId,
      reportId,
      projectReportsBaseUrl,
      reportBaseUrl,
      url,
      queryKey,
      reportBaseQueryKey,
      valid,
    };
  }, [
    projectId,
    reportId,
    projectReportsBaseUrl,
    reportBaseUrl,
    url,
    queryKey,
    reportBaseQueryKey,
    valid,
  ]);
};
