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
import useWebSocket from "react-use-websocket";
import { queryClient } from "../../util/consts/common";
import SnackbarAlert from "./snackbar/SnackbarAlert";
import { ResponseMessage } from "../../models/common";
import { QueryKey } from "@tanstack/react-query";

interface WebSocketAlertProps {
  isAuthenticated: boolean;
}

export const WebSocketAlert = (props: WebSocketAlertProps) => {
  const [alertState, setAlertState] = React.useState<ResponseMessage>();
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/api/ws`;

  const onMessage = React.useCallback((event: MessageEvent) => {
    const data = JSON.parse(event.data);
    setAlertState(data);
  }, []);

  // Establish a WebSocket connection to the backend
  useWebSocket(
    wsUrl,
    {
      share: true,
      onMessage: onMessage,
      onClose: () =>
        setAlertState(
          new ResponseMessage({
            severity: "error",
            message:
              "WebSocket connection was lost. You won't receive realtime information anymore.",
            status: 500,
          })
        ),
    },
    props.isAuthenticated
  );

  // Invalidate queries when the alertState contains the respective
  if (alertState?.payload && "invalidateQueries" in alertState.payload) {
    alertState.payload.invalidateQueries.forEach((queryKey: QueryKey) => {
      queryClient.invalidateQueries({ queryKey });
    });
  }

  if (alertState?.message) {
    console.log(alertState.message);
  }

  return (
    <>
      <SnackbarAlert
        severity={alertState?.open == true ? alertState?.severity : undefined}
        message={alertState?.open == true ? alertState?.message : undefined}
        resetFn={() => setAlertState(undefined)}
      />
    </>
  );
};
