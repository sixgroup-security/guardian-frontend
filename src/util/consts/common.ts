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

/*
 * Defines common constants for the application.
 */
import Axios from "axios";
import { QueryClient, QueryCache } from "@tanstack/react-query";

export enum MuiLicenseType {
  Community = 10,
  Pro = 20,
  Premium = 30,
}

interface Env {
  VITE_API_URL: string;
  VITE_MUIX_LICENSE_KEY: string;
  VITE_INVENTORY_URL: string;
  VITE_CVSS_CALCULATOR_URL: string;
  VITE_CWE_DEFINITIONS_URL: string;
  VITE_REPORTING_GUIDELINE_URL: string;
  BASE_URL: string;
  MODE: string;
  DEV: boolean;
  PROD: boolean;
  SSR: boolean;
  MUI_LICENSE_TYPE: MuiLicenseType;
}

export const env = {
  ...import.meta.env,
  MUI_LICENSE_TYPE: MuiLicenseType.Premium,
} as Env;

// TODO: We need to remove APP_API_URL
export const APP_API_URL = "";
export const APP_INVENTORY_URL = env.VITE_INVENTORY_URL;
// https://mui.com/x/introduction/licensing/
export const MUIX_LICENSE_KEY = env.VITE_MUIX_LICENSE_KEY;
export const REPORTING_GUIDELINE_URL = env.VITE_REPORTING_GUIDELINE_URL;
// process.env.REACT_APP_API_URL?.replace(/\/*$/, "") ?? "";
export const CVSS_CALCULATOR_URL = env.VITE_CVSS_CALCULATOR_URL;
export const CWE_DEFINITIONS_URL = env.VITE_CWE_DEFINITIONS_URL;
// process.env.REACT_APP_CVSS_CALCULATOR_URL?.replace(/\/*$/, "") ?? "";
export const URL_PATH_PREFIX = "/api/v1";

export const axiosClient = Axios.create({
  baseURL: APP_API_URL,
});

export const SHOW_MAX_TABLE_COLUMN_ITEMS = 2;

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    // TODO: Implement redirect to login.
    // https://tkdodo.eu/blog/breaking-react-querys-api-on-purpose
    onError: (err, query) => console.log(err, query),
  }),
});

export const MANAGER_ROLE_NAME = "Manager";
export const CUSTOMER_TITLE_NAME = "Customer";
export const APP_NAME = "GUARDIAN";
