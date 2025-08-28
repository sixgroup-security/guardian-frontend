import React from "react";
import {
  UseQueryOptions,
  QueryObserverBaseResult,
  QueryKey,
} from "@tanstack/react-query";
import { useQuery } from "../../../util/hooks/tanstack/useQuery";
import { useCalculateReportUrls } from "../useCalculateReportUrls.ts";

interface UseQueryType<Q, R> extends UseQueryOptions {
  // The path suffix of the report URL: /projects/{project_id}/reports/{report_id}/SUFFIX
  pathSuffix?: string;
  // Object containing the query parameters.
  params?: Q;
  // Conversion method to convert the response data to the desired format.
  convertFn?: (data: any[]) => R;
  // The query key suffix for the report URL: [...queryKeyReports, { report: reportId }, SUFFIX]
  // queryKey?: QueryKey;
  // The project's UUID
  projectId: string | undefined | null;
  // The report's UUID
  reportId: string | undefined | null;
  // Disable automatic updates;
  disableAutoUpdate?: boolean;
}

export interface UseQueryResult<T, Error, R>
  extends QueryObserverBaseResult<T, Error> {
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
  // The data fetched from the backend and converted via convertFn
  result: R | undefined;
}

/*
 * This hook is used by all report components to fetch their respective project data.
 */
export const useQueryReportData = <T, Q, R>(
  props: UseQueryType<Q, R>
): UseQueryResult<T, Error, R> => {
  const {
    pathSuffix,
    projectId,
    reportId,
    convertFn,
    queryKey: queryKeyReportsSuffix,
  } = props;
  // Calculate all variables based on the given projectId and reportId variables
  const {
    projectReportsBaseUrl,
    reportBaseUrl,
    url,
    queryKey,
    valid,
    reportBaseQueryKey,
  } = useCalculateReportUrls({
    pathSuffix,
    projectId,
    reportId,
    queryKeySuffix: queryKeyReportsSuffix,
  });
  // We obtain information about the selected report
  const query = useQuery<T, Q, R>({
    path: url,
    queryKey: queryKey,
    enabled: valid,
    convertFn,
    // We disable any automatic refetching mechanism
    disableAutoUpdate: true,
  });
  const result = React.useMemo(
    () => (query.isSuccess ? (query.data as R) : undefined),
    [query.isSuccess, query.data]
  );
  return React.useMemo(() => {
    return {
      ...query,
      projectId,
      reportId,
      projectReportsBaseUrl,
      reportBaseUrl,
      reportBaseQueryKey,
      url,
      queryKey,
      result,
    };
  }, [
    projectId,
    reportId,
    query,
    projectReportsBaseUrl,
    reportBaseQueryKey,
    reportBaseUrl,
    url,
    queryKey,
    result,
  ]);
};
