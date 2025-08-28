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

import {
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton as MuiIconButton,
} from "@mui/material";
import { IconType } from "../../../models/common";

export const IconButton = ({
  icon,
  disabled,
  onClick,
}: {
  icon: IconType;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}) => {
  const Icon = icon;
  return (
    <MuiIconButton
      sx={{
        m: 0,
        p: 0,
      }}
      disabled={disabled}
      onClick={(event) => {
        onClick?.(event);
        event.stopPropagation();
      }}
    >
      <Icon fontSize="small" />
    </MuiIconButton>
  );
};

export const MenuItemEntry = ({
  onClick,
  icon,
  title,
  shortcut,
  disabled,
  width,
}: {
  onClick: () => void;
  icon: IconType;
  title: string;
  shortcut: string;
  disabled?: boolean;
  width?: number;
}) => {
  const Icon = icon;
  return (
    <>
      <MenuItem
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
        disabled={disabled}
        sx={{
          width: width ?? 300,
        }}
      >
        <ListItemIcon>
          <Icon fontSize="small" />
        </ListItemIcon>
        <ListItemText>{title}</ListItemText>{" "}
        <Typography variant="body2" color="text.secondary">
          {shortcut}
        </Typography>
      </MenuItem>
    </>
  );
};

export default MenuItemEntry;
