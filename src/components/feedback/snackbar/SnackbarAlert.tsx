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

import React, { useEffect } from "react";
import Snackbar from "@mui/material/Snackbar";
import { Alert as MuiAlert, AlertProps, AlertColor } from "@mui/material";
import { UseDataSubmissionReturn } from "../../../util/hooks/useDataSubmission";

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

/*
 * This component can be used in combination with custom hook useDataSubmission to submit data to the backend
 * and provide feedback about the submission back to the user.
 */
export const SnackbarAlertv2 = React.memo(
  ({ context }: { context: UseDataSubmissionReturn }) => {
    return (
      <SnackbarAlert
        severity={context.submissionStatus.severity}
        message={context.submissionStatus.message ?? ""}
        resetFn={context.resetSubmissionStatus}
      />
    );
  }
);

const SnackbarAlert: React.FC<{
  severity?: AlertColor;
  message?: string;
  // Usually this the useMutation's reset function. It is called when the Snackbar is closed and it is used to reset the mutation's state (isError will be reset).
  resetFn?: () => void;
}> = React.memo(({ severity, message, resetFn }) => {
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    if (severity) {
      setOpen(true);
    }
  }, [severity]);

  const handleClose = (
    _event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    open && resetFn?.();
    setOpen(false);
  };

  // Without this code, the Snackbar with an empty success alert component will be displayed for a split second.
  if (!severity) {
    return null;
  }

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert onClose={handleClose} severity={severity} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
});

export default SnackbarAlert;
