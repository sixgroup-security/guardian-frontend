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

import { Menu, IconButton } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { TreeViewItemMenuManagerProps } from "../../../util/hooks/treeview/useTreeViewProvider";

interface TreeViewItemMenuProps {
  manager: TreeViewItemMenuManagerProps;
  children: React.ReactNode[];
  readonly?: boolean;
}

const TreeViewItemMenu: React.FC<TreeViewItemMenuProps> = ({
  manager,
  readonly,
  children,
}) => {
  return (
    <>
      <IconButton
        id="basic-button"
        aria-controls={manager.menuOpen ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={manager.menuOpen ? "true" : undefined}
        onClick={(event) => {
          manager.handleClick(event);
          // Prevent the event from bubbling up to the parent.
          event.stopPropagation();
        }}
        disabled={readonly}
        sx={{
          m: 0,
          p: 0,
        }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={manager.anchorElement}
        open={manager.menuOpen}
        onClose={() => {
          manager.handleClose();
        }}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        {children}
      </Menu>
    </>
  );
};

export default TreeViewItemMenu;
