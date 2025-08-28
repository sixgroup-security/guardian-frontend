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

import { v4 as uuidv4 } from "uuid";
import React from "react";
import LabelIcon from "@mui/icons-material/Label";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import { Box, Divider, Typography } from "@mui/material";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import MenuItemEntry, {
  IconButton,
} from "../../../../data/treeview/MenuItemEntry";
import {
  ContainerTreeNode,
  EventHandlerType,
} from "../../../../../models/treeview/treeNodeBase";
import { IconType } from "../../../../../models/common";
import StyledTreeItem from "../../../../data/treeview/StyledTreeItem";
import TreeViewItemMenu from "../../../../data/treeview/TreeViewItemMenu";
import { useTreeViewItemMenu } from "../../../../../util/hooks/treeview/useTreeViewProvider";

export const NodeContent = ({
  object,
  handler,
  readonly,
  nodeIcon,
}: {
  object: ContainerTreeNode;
  handler: EventHandlerType;
  readonly: boolean;
  nodeIcon: IconType &
    (React.ElementType<any, keyof React.JSX.IntrinsicElements> | undefined);
}) => {
  const treeViewItemMenuManager = useTreeViewItemMenu();
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
          {/*TODO: If parent and a child container have the same name and a user clicks the left arrorw, then this leads to an unexpected behaviour at the moment.*/}
          <IconButton
            icon={KeyboardArrowLeftIcon}
            disabled={!object.parent}
            onClick={handler.onMoveLeft}
          />
          {/*TODO: If parent and a child container have the same name and a user clicks the right arrorw, then this leads to an unexpected behaviour at the moment.*/}
          <IconButton
            icon={KeyboardArrowRightIcon}
            disabled={!object.prev}
            onClick={handler.onMoveRight}
          />
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
          <TreeViewItemMenu manager={treeViewItemMenuManager}>
            <MenuItemEntry
              onClick={() => {
                treeViewItemMenuManager.handleClose();
                handler.onEdit?.(null, object);
              }}
              icon={EditIcon}
              title="Edit"
              shortcut="⌘E"
            />
            <Divider />
            <MenuItemEntry
              onClick={() => {
                treeViewItemMenuManager.handleClose();
                handler.onDelete?.(null);
              }}
              icon={DeleteOutlineIcon}
              title="Delete"
              shortcut="⌘D"
            />
          </TreeViewItemMenu>
        </>
      )}
    </Box>
  );
};

/*
 * Class for a tree node that can contain other nodes.
 */
export default class TemplateProcedureSectionTreeNode extends ContainerTreeNode {
  /*
   * Constructor for SectionNode, setting type to 'section' and initializing the children array
   */
  constructor(uid: string, name: string, info: any = {}) {
    super(uid, name, info);
  }

  /*
   * Returns a StyledTreeItem component for the node.
   */
  getComponent(
    children: JSX.Element[],
    handler: EventHandlerType,
    readonly: boolean
  ) {
    return (
      <StyledTreeItem
        key={this.id}
        nodeId={this.id}
        label={
          <NodeContent
            nodeIcon={
              this.firstContainerChild || this.firstLeafChild
                ? LabelIcon
                : LabelOutlinedIcon
            }
            object={this}
            handler={handler}
            readonly={readonly}
          />
        }
        onClick={
          handler.onClick ? (event) => handler.onClick!(event, this) : undefined
        }
      >
        {children}
      </StyledTreeItem>
    );
  }

  /*
   * Returns the type of the node.
   */
  getType(): string {
    return "container";
  }

  static create(title: string, labelInfo = {}) {
    const node = new TemplateProcedureSectionTreeNode(
      uuidv4(),
      title,
      labelInfo
    );
    return node;
  }
}
