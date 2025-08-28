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

import { PaletteMode, ThemeOptions } from "@mui/material";
import { SeverityType } from "../models/enums";

// https://color.adobe.com/search?q=blue
//https://mui.com/material-ui/customization/color/
export const ratingColors = {
  [SeverityType.Info]: "#7cb342",
  [SeverityType.Low]: "#00b0ff",
  [SeverityType.Medium]: "#ff9100",
  [SeverityType.High]: "#e91e63",
  [SeverityType.Critical]: "#a31545",
  [SeverityType.Unknown]: "#9e9e9e",
};

// Create a theme instance.
// https://mui.com/material-ui/customization/dark-mode/
export const getDesignTokens = (mode: PaletteMode): ThemeOptions => ({
  palette: {
    mode,
    ...(mode === "light"
      ? {
          primary: {
            main: "#031059",
            light: "#72A9F2",
            dark: "#731702",
            contrastText: "#dfdfdf",
          },
        }
      : {
          mode: "dark",
        }),
  },
});
