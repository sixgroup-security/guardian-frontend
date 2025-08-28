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
import { Box, LinearProgress, Tooltip } from "@mui/material";
import { UseQueryResult } from "@tanstack/react-query";

const RefreshProgress = React.memo(
  ({ query }: { query: UseQueryResult<unknown, Error> }) =>
    query.isRefetching && (
      <Box>
        <Tooltip title="The table is refreshing its content in the background.">
          <LinearProgress />
        </Tooltip>
      </Box>
    )
);

export default RefreshProgress;
