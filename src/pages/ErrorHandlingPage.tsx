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
import { AlertColor } from "@mui/material";
import Alerting from "../components/feedback/snackbar/SnackbarAlert";
import {
  useRouteError,
  Navigate,
  isRouteErrorResponse,
} from "react-router-dom";

const ErrorHandlingPage = React.memo(() => {
  const error = useRouteError();
  let errorMessage: string;
  let severity: AlertColor = "error";
  let statusCode: number | undefined;

  if (isRouteErrorResponse(error)) {
    // error is type `ErrorResponse`
    errorMessage = error.data?.message || error.statusText;
    severity = error.data?.type || "error";
    statusCode = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  } else {
    console.error(error);
    errorMessage = "Unknown error";
  }

  // If user is not authenticated, then we redirect to the login page.
  if (statusCode === 401) {
    return <Navigate to="/login" replace={true} />;
  }
  return <Alerting severity={severity} message={errorMessage} />;
});

export default ErrorHandlingPage;
