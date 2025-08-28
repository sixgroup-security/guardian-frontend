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
import { AxiosError } from "axios";
import { AlertColor } from "@mui/material";
import { queryClient } from "../consts/common";
import { QueryKey } from "@tanstack/react-query";

type SubmissionStatusType = { severity?: AlertColor; message?: string };
const initialSubmissionStatus: SubmissionStatusType = {
  severity: undefined,
  message: undefined,
};

export interface PerformSubmissionProps {
  dataSubmissionFn: () => any;
  queryKey?: QueryKey;
  additionalQueryKeys?: QueryKey[];
  throwException?: boolean;
}

export interface UseDataSubmissionReturn {
  performSubmission: ({
    dataSubmissionFn,
    queryKey,
    additionalQueryKeys,
    throwException,
  }: PerformSubmissionProps) => any | null;
  submissionStatus: SubmissionStatusType;
  resetSubmissionStatus: () => void;
}

/*
 * This hook can be used together with the SnackbarAlertv2 component to submit data to the backend and
 * and provide feedback about the submission back to the user.
 */
export const useDataSubmission = (): UseDataSubmissionReturn => {
  const [submissionStatus, setSubmissionStatus] =
    React.useState<SubmissionStatusType>(initialSubmissionStatus);

  // Calls the given data submission function and performs error handling.
  const performSubmission = React.useCallback(
    async ({
      dataSubmissionFn,
      queryKey,
      additionalQueryKeys,
      throwException,
    }: PerformSubmissionProps) => {
      try {
        const response = await dataSubmissionFn();
        // Invalidate the main query key
        if (queryKey) {
          queryClient.invalidateQueries({ queryKey: queryKey });
        }
        // Invalidate additional query keys
        additionalQueryKeys?.forEach((queryKey: any) => {
          queryClient.invalidateQueries({ queryKey });
        });
        if (!response?.headers["content-type"]?.includes("application/json")) {
          throw new Error(
            "Back-end returned unexpected content type: " +
              response?.headers["content-type"]
          );
        }
        const content = (await response?.data) ?? {};
        // Check if the response might contain status information that we could display using the SnackbarAlertv2 component
        if ("severity" in content && "message" in content) {
          setSubmissionStatus({
            severity: content["severity"],
            message: content["message"],
          });
        }
        return content;
      } catch (ex) {
        const error = ex as AxiosError;
        let errorMessage: string | undefined;
        if (
          error.response?.data &&
          typeof error.response.data === "object" &&
          "message" in error.response.data
        ) {
          errorMessage = error.response?.data?.message?.toString();
        }
        setSubmissionStatus({
          severity: "error",
          message: errorMessage ?? error.toString(),
        });
        if (throwException) {
          throw ex;
        }
      }
      return null;
    },
    []
  );

  // Resets the hooks state, which usually hides the SnackbarAlert component
  const resetSubmissionStatus = React.useCallback(
    () => setSubmissionStatus(initialSubmissionStatus),
    []
  );

  return React.useMemo(
    () => ({ performSubmission, submissionStatus, resetSubmissionStatus }),
    [performSubmission, submissionStatus, resetSubmissionStatus]
  );
};
