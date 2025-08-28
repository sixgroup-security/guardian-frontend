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

import ChecklistIcon from "@mui/icons-material/Checklist";
import { Box, Typography } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  LeafTreeNode,
  EventHandlerType,
} from "../../../../../models/treeview/treeNodeBase";
import { IconType } from "../../../../../models/common";
import StyledTreeItem from "../../../../data/treeview/StyledTreeItem";
import { IconButton } from "../../../../data/treeview/MenuItemEntry";

export const NodeContent = ({
  object,
  handler,
  readonly,
  nodeIcon,
}: {
  object: LeafTreeNode;
  handler: EventHandlerType;
  readonly: boolean;
  nodeIcon: IconType &
    (React.ElementType<any, keyof React.JSX.IntrinsicElements> | undefined);
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        p: 1,
        pr: 0,
      }}
    >
      <Box component={nodeIcon} size="small" color="inherit" sx={{ mr: 1 }} />
      <Typography variant="body2" sx={{ flexGrow: 1 }}>
        {object.name}
      </Typography>
      {!readonly && (
        <>
          <IconButton
            icon={KeyboardArrowDownIcon}
            disabled={!object.next}
            onClick={handler.onMoveDown}
          />
          <IconButton
            icon={KeyboardArrowUpIcon}
            disabled={!object.prev}
            onClick={handler.onMoveUp}
          />
          <IconButton icon={DeleteOutlineIcon} onClick={handler.onDelete} />
        </>
      )}
    </Box>
  );
};

export default class TemplateProcedureTreeNode extends LeafTreeNode {
  /*
   * Constructor for ProcedureNode, setting type to 'procedure'
   */
  constructor(uid: string, name: string) {
    super(uid, name);
  }

  /*
   * Returns a StyledTreeItem component for the node.
   */
  getComponent(
    children: JSX.Element[],
    handler: EventHandlerType,
    readonly: boolean
  ): JSX.Element {
    return (
      <StyledTreeItem
        key={this.id}
        nodeId={this.id}
        label={
          <NodeContent
            nodeIcon={ChecklistIcon}
            object={this}
            handler={handler}
            readonly={readonly}
          />
        }
        disabled={true}
      >
        {children}
      </StyledTreeItem>
    );
  }

  /*
   * Returns the type of the node.
   */
  getType(): string {
    return "procedure";
  }

  static create(id: string, title: string) {
    const node = new TemplateProcedureTreeNode(id, title);
    return node;
  }
}
