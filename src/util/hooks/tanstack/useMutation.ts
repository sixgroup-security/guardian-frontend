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
import { axiosClient, queryClient } from "../../consts/common.ts";
import {
  useMutation as useTanstackMutation,
  MutationFunction,
  MutationOptions,
  QueryKey,
} from "@tanstack/react-query";
import { AxiosError } from "axios";

type RequestType = "POST" | "PUT" | "DELETE";

interface UseMutationOptions extends MutationOptions {
  requestType: RequestType;
  apiEndpointFn: () => string;
  queryKeyFn?: () => QueryKey;
  onSuccessUpdateId?: (data: any) => void;
  // List of query keys that should be invalidated after a successful POST/PUT request.
  invalidateQueryKeys?: QueryKey[];
}

export const useMutation = <ResponseType, MutateType>(
  props: UseMutationOptions
) => {
  const { requestType, apiEndpointFn, queryKeyFn, onSuccessUpdateId } = props;

  const mutationFn: MutationFunction<ResponseType, MutateType> =
    React.useCallback(
      (data?: MutateType) => {
        switch (requestType) {
          case "POST":
            return axiosClient
              .post(apiEndpointFn(), data)
              .then((response) => response.data as ResponseType);
          case "PUT":
            return axiosClient
              .put(apiEndpointFn(), data)
              .then((response) => response.data as ResponseType);
          case "DELETE":
            return axiosClient
              .delete(apiEndpointFn() + "/" + data)
              .then((response) => response.data as ResponseType);
          default:
            throw new Error(`Unsupported request type: ${requestType}`);
        }
      },
      [apiEndpointFn, requestType]
    );

  /*
   * mutationFn: (variables: TVariables) => Promise<TData>
   * useMutation<TData = unknown
                 TError = DefaultError
                 TVariables = void
                 TContext = unknown>(options: UseMutationOptions<TData, TError, TVariables, TContext>, queryClient?: QueryClient): UseMutationResult<TData, TError, TVariables, TContext>;
  */
  const mutation = useTanstackMutation<ResponseType, Error, MutateType>({
    // ...options,
    mutationFn,
    // We need to set networkMode to offlineFirst and retry to false to get notified that no network connection is available.
    networkMode: "offlineFirst",
    retry: false,
    // Invalidate the query cache after the mutation has been successfully executed.
    onSuccess: React.useMemo(
      () =>
        queryKeyFn
          ? (data) => {
              onSuccessUpdateId?.(data);
              queryClient.invalidateQueries({
                queryKey: queryKeyFn(),
              });
              // Invalidate additional query keys if they are provided.
              props.invalidateQueryKeys?.forEach((item) => {
                queryClient.invalidateQueries({
                  queryKey: item,
                });
              });
            }
          : onSuccessUpdateId,
      [queryKeyFn, onSuccessUpdateId, props.invalidateQueryKeys]
    ),
  });

  const { ...mutationProps } = mutation;
  // If the error is a network error, we want to return a more user friendly error message. In addition, we want to return the error message from the server if it is available.
  if (mutationProps.isError) {
    const error = mutationProps.error as AxiosError;
    if (error?.code === "ERR_NETWORK") {
      mutationProps.error = new Error("No network connection available.");
    } else if (
      error.response?.data &&
      typeof error.response.data === "object" &&
      "message" in error.response.data &&
      typeof error.response.data.message === "string"
    ) {
      mutationProps.error = new Error(error.response.data.message);
    }
  }

  return React.useMemo(() => ({ ...mutationProps }), [mutationProps]);
};
