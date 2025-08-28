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
import { Box, Divider } from "@mui/material";
import Typography from "@mui/material/Typography";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import MenuItemEntry from "../../../../data/treeview/MenuItemEntry";
import {
  ContainerTreeNode,
  EventHandlerType,
} from "../../../../../models/treeview/treeNodeBase";
import StyledTreeItem from "../../../../data/treeview/StyledTreeItem";
import TreeViewItemMenu from "../../../../data/treeview/TreeViewItemMenu";
import { useTreeViewItemMenu } from "../../../../../util/hooks/treeview/useTreeViewProvider";
import { URL_PATH_PREFIX } from "../../../../../util/consts/common";
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
      <Typography
        sx={{
          fontWeight: "bold",
          flexGrow: 1,
          color: object.info.hide == true ? "#bdbdbd" : undefined,
        }}
      >
        {`${object.name} ${object.info.hide == true ? " (hidden) " : ""}`}
      </Typography>
      <TreeViewItemMenu manager={treeViewItemMenuManager}>
        <MenuItemEntry
          disabled={readonly}
          onClick={() => {
            treeViewItemMenuManager.handleClose();
            handler.onEdit!(null, object);
          }}
          icon={EditIcon}
          title="Edit"
          shortcut="⌘E"
        />
        <MenuItemEntry
          onClick={() => {
            treeViewItemMenuManager.handleClose();
            navigator.clipboard.writeText(object.name);
          }}
          icon={ContentCopyIcon}
          title="Copy Title"
          shortcut="⌘C"
        />
        <Divider />
        <MenuItemEntry
          disabled={readonly}
          onClick={() => {
            treeViewItemMenuManager.handleClose();
            handler.additionalEvents?.onAddTestGuide(object);
          }}
          icon={AddIcon}
          title="Add Playbooks"
          shortcut="⌘A"
        />
        <MenuItemEntry
          onClick={() => {
            treeViewItemMenuManager.handleClose();
            handler.additionalEvents?.onAddVulnerability(object);
          }}
          icon={AddIcon}
          title="Add Vulnerability"
          shortcut="⌘V"
        />
        <MenuItemEntry
          onClick={() => {
            treeViewItemMenuManager.handleClose();
            handler.additionalEvents?.onAddNewVulnerability(object);
          }}
          icon={AddIcon}
          title="Add New Vulnerability"
          shortcut="⌘N"
        />
        <Divider />
        <MenuItemEntry
          disabled={!object.prev || readonly}
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
          disabled={!object.next || readonly}
          onClick={() => {
            treeViewItemMenuManager.handleClose();
            if (handler.onMoveDown) {
              handler.onMoveDown!(null);
            }
          }}
          icon={KeyboardArrowDownIcon}
          title="Move Down"
          shortcut="⌘D"
        />
        <Divider />
        <MenuItemEntry
          disabled={readonly}
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
export default class ReportSectionTreeNode extends ReportContainerTreeNode {
  private projectId: string;
  private reportId: string;
  /*
   * Constructor for SectionNode, setting type to 'section' and initializing the children array
   */
  constructor(
    uid: string,
    name: string,
    info: any = {},
    projectId: string,
    reportId: string
  ) {
    super(uid, name, info);
    this.projectId = projectId;
    this.reportId = reportId;
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
        onClick={
          handler.onClick ? (event) => handler.onClick!(event, this) : undefined
        }
      >
        {children}
      </StyledTreeItem>
    );
  }

  /*
   * Returns the URL for the current report section.
   *
   * baseUrl: /projects/{project_id}/reports/{report_id}
   * /report-sections/{section_id}
   */
  getUrl(): string {
    return `${URL_PATH_PREFIX}/projects/${this.projectId}/reports/${this.reportId}/report-sections/${this.id}`;
  }

  /*
   * Returns the type of the node.
   */
  getType(): string {
    return "reportSection";
  }

  static create(
    title: string,
    labelInfo = {},
    projectId: string,
    reportId: string
  ) {
    const node = new ReportSectionTreeNode(
      uuidv4(),
      title,
      labelInfo,
      projectId,
      reportId
    );
    return node;
  }
}
