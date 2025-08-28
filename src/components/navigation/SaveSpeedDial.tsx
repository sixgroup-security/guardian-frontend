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

import SpeedDial from "@mui/material/SpeedDial";
import SaveIcon from "@mui/icons-material/Save";

interface SaveSpeedDialProps {
  onClick: () => void;
}

const SaveSpeedDial: React.FC<SaveSpeedDialProps> = (props) => {
  return (
    <SpeedDial
      ariaLabel="SpeedDial for saving the current form"
      sx={{ position: "fixed", bottom: 16, right: 16 }}
      icon={<SaveIcon />}
      onClick={props.onClick}
    ></SpeedDial>
  );
};

export default SaveSpeedDial;
