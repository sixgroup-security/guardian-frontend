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

import React, { Suspense } from "react";
import { MUIX_LICENSE_KEY } from "./util/consts/common";
import { LicenseInfo } from "@mui/x-license";
LicenseInfo.setLicenseKey(MUIX_LICENSE_KEY);
import {
  RouterProvider,
  createBrowserRouter,
  Navigate,
  RouteObject,
} from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/en-gb";
import updateLocale from "dayjs/plugin/updateLocale";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Login from "./pages/Login";
import RootLayout from "./layout/RootLayout";
import { getDesignTokens } from "./layout/theme";
import { MainPages } from "./models/enums";
import { useQueryUserMe } from "./util/hooks/tanstack/useQueryUserMe";
import { PaletteMode } from "@mui/material";
import { getCookieValue } from "./models/common";
import LoadingIndicator from "./components/feedback/LoadingIndicator";
import Dashboard from "./pages/Dashboard";

// Set the start of the week to Sunday.
dayjs.extend(updateLocale);
dayjs.updateLocale("en-gb", {
  // Sunday = 0, Monday = 1.
  weekStart: 1,
});

/*
 * This helper function lazy loads components.
 * see also: https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations
 */
// LazyLoad helper for normal pages
const LazyLoad = (module: string) => {
  const Component = React.lazy(() => import(`./pages/${module}.tsx`));
  return (
    <Suspense fallback={<LoadingIndicator open={true} />}>
      <Component />
    </Suspense>
  );
};

// LazyLoad helper for entity-related pages
const LazyLoadEntity = (module: string) => {
  const Component = React.lazy(() => import(`./pages/entity/${module}.tsx`));
  return (
    <Suspense fallback={<LoadingIndicator open={true} />}>
      <Component />
    </Suspense>
  );
};

// LazyLoad helper for tagging-related pages
const LazyLoadTagging = (module: string) => {
  const Component = React.lazy(() => import(`./pages/tagging/${module}.tsx`));
  return (
    <Suspense fallback={<LoadingIndicator open={true} />}>
      <Component />
    </Suspense>
  );
};

const ErrorHandlingPage = () => LazyLoad("ErrorHandlingPage");

function App() {
  // Obtain user information
  const meQuery = useQueryUserMe();
  const children: RouteObject[] = [];
  const dashboardAccess = React.useMemo(
    () => meQuery.data?.hasAccess(MainPages.Dashboard) ?? true,
    [meQuery.data]
  );

  // Based on the user's permissions, we add the corresponding routes
  if (meQuery.data?.hasAccess(MainPages.Calendar) ?? true) {
    children.push({
      path: "calendar",
      errorElement: <ErrorHandlingPage />,
      children: [
        { index: true, element: LazyLoad("Calendar") },
        { path: ":id", element: LazyLoad("Calendar") },
      ],
    });
  }
  if (meQuery.data?.hasAccess(MainPages.Projects) ?? true) {
    children.push({
      path: "projects",
      errorElement: <ErrorHandlingPage />,
      children: [
        { index: true, element: LazyLoad("Projects") },
        { path: ":id", element: LazyLoad("Projects") },
        { path: ":pid/report/:rid", element: LazyLoad("Reports") },
      ],
    });
  }
  if (meQuery.data?.hasAccess(MainPages.Applications) ?? true) {
    children.push({
      path: "applications",
      errorElement: <ErrorHandlingPage />,
      children: [
        { index: true, element: LazyLoad("Applications") },
        { path: ":id", element: LazyLoad("Applications") },
      ],
    });
  }
  // PenTest section
  if (meQuery.data?.hasAccess(MainPages.Measures) ?? true) {
    children.push({
      path: "measures",
      errorElement: <ErrorHandlingPage />,
      children: [
        {
          index: true,
          element: LazyLoad("Measures"),
        },
        {
          path: ":id",
          element: LazyLoad("Measures"),
        },
      ],
    });
  }
  if (meQuery.data?.hasAccess(MainPages.ReportTemplates) ?? true) {
    children.push({
      path: "templates/pentest",
      errorElement: <ErrorHandlingPage />,
      children: [
        { index: true, element: LazyLoad("ReportTemplates") },
        { path: ":id", element: LazyLoad("ReportTemplates") },
      ],
    });
  }
  if (meQuery.data?.hasAccess(MainPages.TestProcedures) ?? true) {
    children.push({
      path: "procedures",
      errorElement: <ErrorHandlingPage />,
      children: [
        { index: true, element: LazyLoad("TestProcedures") },
        { path: ":id", element: LazyLoad("TestProcedures") },
      ],
    });
  }
  if (meQuery.data?.hasAccess(MainPages.TestGuide) ?? true) {
    children.push({
      path: "playbooks/pentest",
      errorElement: <ErrorHandlingPage />,
      children: [
        { index: true, element: LazyLoad("TestGuides") },
        { path: ":id", element: LazyLoad("TestGuides") },
      ],
    });
  }
  if (meQuery.data?.hasAccess(MainPages.VulnerabilityTemplates) ?? true) {
    children.push({
      path: "vulnerabilities",
      errorElement: <ErrorHandlingPage />,
      children: [
        {
          index: true,
          element: LazyLoad("VulnerabilityTemplates"),
        },
        {
          path: ":id",
          element: LazyLoad("VulnerabilityTemplates"),
        },
      ],
    });
  }
  // Admin section
  if (meQuery.data?.hasAccess(MainPages.ReportLanguages) ?? true) {
    children.push({
      path: "languages",
      errorElement: <ErrorHandlingPage />,
      children: [
        { index: true, element: LazyLoad("ReportLanguages") },
        { path: ":id", element: LazyLoad("ReportLanguages") },
      ],
    });
  }
  if (meQuery.data?.hasAccess(MainPages.Customers) ?? true) {
    children.push({
      path: "customers",
      errorElement: <ErrorHandlingPage />,
      children: [
        { index: true, element: LazyLoadEntity("Customers") },
        { path: ":id", element: LazyLoadEntity("Customers") },
      ],
    });
  }
  if (meQuery.data?.hasAccess(MainPages.Providers) ?? true) {
    children.push({
      path: "providers",
      errorElement: <ErrorHandlingPage />,
      children: [
        { index: true, element: LazyLoadEntity("Providers") },
        { path: ":id", element: LazyLoadEntity("Providers") },
      ],
    });
  }
  if (meQuery.data?.hasAccess(MainPages.Users) ?? true) {
    children.push({
      path: "users",
      errorElement: <ErrorHandlingPage />,
      children: [
        { index: true, element: LazyLoad("Users") },
        { path: ":id", element: LazyLoad("Users") },
      ],
    });
  }
  if (meQuery.data?.hasAccess(MainPages.BugCrowdVrt) ?? true) {
    children.push({
      path: "classifications",
      errorElement: <ErrorHandlingPage />,
      children: [{ index: true, element: LazyLoadTagging("Overview") }],
    });
  }
  // Token management section
  if (meQuery.data?.hasAccess(MainPages.AccessTokens) ?? true) {
    children.push({
      path: "tokens",
      errorElement: <ErrorHandlingPage />,
      children: [
        { index: true, element: LazyLoad("AccessTokens") },
        { path: ":id", element: LazyLoad("AccessTokens") },
      ],
    });
  }

  const router = createBrowserRouter([
    { path: "/login", element: <Login />, errorElement: <ErrorHandlingPage /> },
    {
      path: "/",
      element: <RootLayout />,
      errorElement: <Navigate to="/" replace={true} />,
      children: [
        {
          index: true,
          element: dashboardAccess ? (
            <Dashboard />
          ) : (
            <Navigate to="/projects" replace={true} />
          ),
        },
        ...children,
      ],
    },
  ]);
  if (meQuery.isSuccess) {
    document.cookie = `darkmode=${!meQuery.data?.lightMode}; Secure; path=/`;
  }
  const darkMode = getCookieValue("darkmode");
  const mode: PaletteMode = darkMode === "true" ? "dark" : "light";
  const theme = React.useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      <ReactQueryDevtools initialIsOpen={true} />
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </LocalizationProvider>
  );
}

export default App;
