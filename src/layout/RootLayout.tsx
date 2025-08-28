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

import axios from "axios";
import React from "react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import HeaderBar from "./HeaderBar";
import Sidebar from "./Sidebar";
import Copyright from "./Copyright";
import LoadingIndicator from "../components/feedback/LoadingIndicator";
import { useQuery } from "../util/hooks/tanstack/useQuery";
import { useQueryUserMe } from "../util/hooks/tanstack/useQueryUserMe";
import { Outlet, Navigate } from "react-router-dom";
import { URL_PROJECT_YEARS, queryKeyProjectYears } from "../models/project.ts";
import { useDataSubmission } from "../util/hooks/useDataSubmission.ts";
import { URL_USERS_ME_TOGGLE_MENU, queryKeyUserMe } from "../models/user.ts";
import { WebSocketAlert } from "../components/feedback/WebSocketAlert.tsx";
import { MainPages } from "../models/enums.ts";

// Check the following link for more details on the AppBar component:
// https://mui.com/material-ui/react-app-bar/#app-bar-with-responsive-menu

const RootLayout = () => {
  const submit = useDataSubmission();
  // Obtain user information
  const meQuery = useQueryUserMe();

  // Obtain the project years
  const projectYearsQuery = useQuery({
    queryKey: queryKeyProjectYears,
    path: URL_PROJECT_YEARS,
    enabled: meQuery.isSuccess,
    retry: 0,
    // We disable any automatic refetching mechanism
    disableAutoUpdate: true,
  });

  const toggleDrawer = React.useCallback(() => {
    submit.performSubmission({
      dataSubmissionFn: async () => await axios.put(URL_USERS_ME_TOGGLE_MENU),
      // We need to ensure the User object is reloaded to contain the selected year.
      queryKey: queryKeyUserMe,
    });
  }, [submit]);

  const content = React.useMemo(
    () => (
      <Box
        component="main"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
          flexGrow: 1,
          height: "100vh",
          overflow: "auto",
          m: 0,
          p: 0,
        }}
      >
        <Toolbar />
        <Container
          maxWidth={false}
          sx={{ p: 3, m: 0, height: "calc(100% - 92px)" }}
        >
          <Outlet />
          <Copyright sx={{ pt: 2 }} />
        </Container>
      </Box>
    ),
    []
  );

  if (projectYearsQuery.isLoading || meQuery.isLoading) {
    return <LoadingIndicator open={true} />;
  }

  if (projectYearsQuery.isError || meQuery.isError) {
    return <Navigate to="/login" replace={true} />;
  }

  return (
    <Box sx={{ display: "flex" }}>
      {meQuery.data?.hasAccess(MainPages.WebSockets) && (
        <WebSocketAlert isAuthenticated={meQuery.isSuccess} />
      )}
      <HeaderBar
        submit={submit}
        open={meQuery.data?.toggle_menu ?? true}
        user={meQuery.data!}
        years={(projectYearsQuery.data as string[]) ?? []}
        toggleDrawer={toggleDrawer}
      />
      <Sidebar open={meQuery.data!.toggle_menu} toggleDrawer={toggleDrawer} />
      {content}
    </Box>
  );
};

export default RootLayout;
