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
import { User, URL_USERS_ME, queryKeyUserMe } from "../../../models/user";
import { useQuery as useQueryTanstack } from "@tanstack/react-query";
import axios from "axios";

// This custom hook can be used to access the information of the currently logged in user.
export const useQueryUserMe = () =>
  useQueryTanstack({
    queryKey: queryKeyUserMe,
    queryFn: React.useCallback(() => {
      // console.debug(`Query: ${URL_USERS_ME}`);
      return axiosClient
        .get(URL_USERS_ME)
        .then((response) => new User(response.data));
    }, []),
    retry: React.useCallback((failureCount: number, error: Error) => {
      if (
        axios.isAxiosError(error) &&
        [401, 500].includes(error.response?.status ?? 0)
      ) {
        return false;
      }
      return failureCount < 3;
    }, []),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
