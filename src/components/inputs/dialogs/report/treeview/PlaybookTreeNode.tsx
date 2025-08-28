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
import { Box, Typography, Divider } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import MenuItemEntry from "../../../../data/treeview/MenuItemEntry";
import {
  ContainerTreeNode,
  EventHandlerType,
} from "../../../../../models/treeview/treeNodeBase";
import StyledTreeItem from "../../../../data/treeview/StyledTreeItem";
import TreeViewItemMenu from "../../../../data/treeview/TreeViewItemMenu";
import { useTreeViewItemMenu } from "../../../../../util/hooks/treeview/useTreeViewProvider";
import { ReportContainerTreeNode } from "./ReportContainerTreeNode";

export const NodeContent = ({
  object,
  handler,
  readonly,
}: {
  object: ContainerTreeNode;
  handler: EventHandlerType;
  readonly: boolean;
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
      <Typography sx={{ flexGrow: 1 }}>{object.name}</Typography>
      <TreeViewItemMenu manager={treeViewItemMenuManager} readonly={readonly}>
        <MenuItemEntry
          disabled={!object.prev}
          onClick={() => {
            treeViewItemMenuManager.handleClose();
            if (handler.onMoveUp) {
              handler.onMoveUp!(null);
            }
          }}
          icon={KeyboardArrowUpIcon}
          title="Move Up"
          shortcut="⌘U"
        />
        <MenuItemEntry
          disabled={!object.next}
          onClick={() => {
            treeViewItemMenuManager.handleClose();
            if (handler.onMoveDown) {
              handler.onMoveDown!(null);
            }
          }}
          icon={KeyboardArrowDownIcon}
          title="Move Down"
          shortcut="⌘U"
        />
        <Divider />
        <MenuItemEntry
          onClick={() => {
            treeViewItemMenuManager.handleClose();
            if (handler.onDelete) {
              handler.onDelete!(null);
            }
          }}
          icon={DeleteOutlineIcon}
          title="Delete"
          shortcut="⌘D"
        />
      </TreeViewItemMenu>
    </Box>
  );
};

/*
 * Class for a tree node that can contain other nodes.
 */
export default class PlaybookTreeNode extends ReportContainerTreeNode {
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
          <NodeContent object={this} handler={handler} readonly={readonly} />
        }
        // This event handler is called when the node is clicked.
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
    return "reportSection";
  }

  /*
   * Returns the URL for the current procedure.
   *
   * baseUrl: /projects/{project_id}/reports/{report_id}
   * /report-sections/{section_id}/playbooks/{playbook_id}
   */
  getUrl(): string {
    if (!this.parent || !(this.parent instanceof ReportContainerTreeNode)) {
      throw new Error("PlaybookTreeNode has no parent");
    }
    const parentUrl = (this.parent as ReportContainerTreeNode).getUrl();
    if (!parentUrl) {
      throw new Error("PlaybookTreeNode has no parent URL");
    }
    return parentUrl + "/playbooks/" + this.id;
  }

  static create(title: string, labelInfo = {}) {
    const node = new PlaybookTreeNode(uuidv4(), title, labelInfo);
    return node;
  }
}
