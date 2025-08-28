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
import {
  URL_USERS_ME_SETTINGS,
  queryKeyUserMeSettings,
} from "../../../models/user";
import { useQuery as useQueryTanstack } from "@tanstack/react-query";

interface UseQueryUserSettingsType {
  // The UID of the user setting.
  settingsUid: string;
}

// This custom hook can be used to used to access user settings.
export const useQueryUserSettings = ({
  settingsUid,
  ...other
}: UseQueryUserSettingsType) =>
  useQueryTanstack({
    ...other,
    queryKey: React.useMemo(
      () => [...queryKeyUserMeSettings, settingsUid],
      [settingsUid]
    ),
    queryFn: React.useCallback(() => {
      // console.debug(`Query: ${URL_USERS_ME_SETTINGS + "/" + settingsUid}`);
      return axiosClient
        .get(URL_USERS_ME_SETTINGS + "/" + settingsUid)
        .then((response) => response.data);
    }, [settingsUid]),
    staleTime: 1000 * 60 * 60 * 24, // 1 day
    retry: 0,
  });
