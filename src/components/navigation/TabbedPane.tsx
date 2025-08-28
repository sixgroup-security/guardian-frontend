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

import * as React from "react";
import Box from "@mui/material/Box";
import { TabContext, TabList } from "@mui/lab";
import { SxProps, Theme } from "@mui/material";

export interface TabbedPaneProps {
  tabTitles: JSX.Element[];
  tabContents: JSX.Element[];
  sx?: SxProps<Theme>;
  style?: React.CSSProperties;
}

const TabbedPane = (props: TabbedPaneProps) => {
  const [value, setValue] = React.useState("0");

  const handleChange = React.useCallback(
    (_event: React.SyntheticEvent, newValue: string) => {
      setValue(newValue);
    },
    []
  );

  return (
    <TabContext value={value}>
      <Box
        sx={{
          width: "100%",
          typography: "body1",
        }}
        style={props.style}
      >
        <TabList onChange={handleChange}>{props.tabTitles}</TabList>
      </Box>
      <Box sx={{ b: 0, m: 0, p: 0, ...props.sx }}>{props.tabContents}</Box>
    </TabContext>
  );
};
export default TabbedPane;
