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
import { axiosClient } from "../../consts/common.ts";
import {
  useQuery as useQueryTanstack,
  UseQueryOptions,
  UseQueryResult,
  QueryObserverBaseResult,
} from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

interface UseQueryType<Q, R> extends UseQueryOptions {
  // The path of the REST API endpoint.
  path: string;
  // Object containing the query parameters.
  params?: Q;
  // Conversion method to convert the response data to the desired format.
  convertFn?: (data: any[]) => R;
  // If false, it disables this query from automatically running.
  enabled?: boolean;
  // Disable automatic updates;
  disableAutoUpdate?: boolean;
}

// This custom hook can be used to issue a GET request to the server.
export const useQuery = <T, Q, R>(
  props: UseQueryType<Q, R>
): QueryObserverBaseResult<T, Error> => {
  const { path, queryKey, params, convertFn, disableAutoUpdate, ...options } =
    props;

  // We set all useQuery options to disable any automatic update mechanism
  if (disableAutoUpdate) {
    options.staleTime = Infinity;
    options.gcTime = Infinity;
    options.refetchInterval = false;
    options.refetchOnWindowFocus = false;
    options.refetchOnMount = "always";
    options.refetchOnReconnect = false;
  }

  const mutation = useQueryTanstack({
    ...options,
    queryKey: queryKey,
    enabled: options.enabled ?? true,
    queryFn: React.useCallback(
      async (/*{ signal }*/) => {
        // console.debug(`Query: ${path}`);
        const response = await axiosClient.get(path, {
          /*signal: signal*/
          params,
        });
        // We might want to convert the response data to a different format/class
        if (convertFn) {
          return convertFn(response.data);
        }
        return response.data;
      },
      [convertFn, path, params]
    ),
    retry: React.useCallback((failureCount: number, error: Error) => {
      // Abort retries if the error status code is 500
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status ?? 0;
        if ((500 <= statusCode && statusCode < 600) || statusCode == 401) {
          return false;
        }
      }
      return failureCount < 3;
    }, []),
  }) as UseQueryResult<T, Error>;

  // If the error is a network error, we want to return a more user friendly error message. In addition, we want to return the error message from the server if it is available.
  const error: Error = React.useMemo(() => {
    if (mutation.isError && "code" in mutation.error) {
      const error = mutation.error as AxiosError;
      if (error?.code === "ERR_NETWORK") {
        return new Error("No network connection available.");
      } else if (
        error.response?.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
      ) {
        return new Error(error.response.data.message);
      }
    }
    return new Error();
  }, [mutation.error, mutation.isError]);

  return React.useMemo(() => {
    return { ...mutation, error };
  }, [mutation, error]);
};
