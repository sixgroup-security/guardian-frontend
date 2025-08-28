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

import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarDensitySelector,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";

interface DefaultToolbarProps {
  hasCreateAccess: boolean;
  onNewButtonClick?: () => void;
  newButtonName?: string;
}

export const defaultGridToolbars = [
  <GridToolbarColumnsButton key={"GridToolbarColumnsButton"} />,
  <GridToolbarFilterButton key={"GridToolbarFilterButton"} />,
  <GridToolbarDensitySelector key={"GridToolbarDensitySelector"} />,
  <GridToolbarExport
    key={"GridToolbarExport"}
    csvOptions={{ disableToolbarButton: true }}
    printOptions={{ disableToolbarButton: true }}
  />,
  <GridToolbarQuickFilter key={"GridToolbarQuickFilter"} debounceMs={1000} />,
];

export const getDefaultGridToolbars = ({
  hasCreateAccess,
  onNewButtonClick,
  newButtonName,
}: DefaultToolbarProps) => {
  const result: JSX.Element[] = [...defaultGridToolbars];
  if (onNewButtonClick && hasCreateAccess) {
    result.push(
      <Button
        key="create-new-button"
        variant="contained"
        size="small"
        startIcon={<AddIcon />}
        onClick={onNewButtonClick}
      >
        {newButtonName ? newButtonName : "New"}
      </Button>
    );
  }
  return result;
};
