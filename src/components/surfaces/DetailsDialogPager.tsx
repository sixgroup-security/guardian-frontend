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
import { Paper } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";

const DetailsDialogPaper: React.FC<{
  sx?: SxProps<Theme>;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = React.memo((props) => {
  //const { children, sx, ...other } = props;
  const sxPaper: SxProps<Theme> = {
    m: 0,
    mb: 2,
    p: 1,
    display: "flex",
    flexWrap: "wrap",
    ...props.sx,
  };
  return (
    <Paper style={props.style} sx={sxPaper}>
      {props.children}
    </Paper>
  );
});

export default DetailsDialogPaper;
