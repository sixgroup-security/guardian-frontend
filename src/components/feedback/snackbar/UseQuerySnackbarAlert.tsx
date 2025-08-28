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
import SnackbarAlert from "./SnackbarAlert";

const UseQuerySnackbarAlert = React.memo(({ query }: { query: any }) => {
  let severity: AlertColor | undefined = undefined;
  let message: string | undefined = undefined;
  // Determine whether a notification should be displayed.
  if (query.isError) {
    severity = "error";
    message = query.error.message;
  }

  return <SnackbarAlert severity={severity} message={message} />;
});

export default UseQuerySnackbarAlert;
