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
import LoopIcon from "@mui/icons-material/Loop";
import NotInterestedIcon from "@mui/icons-material/NotInterested";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import {
  EventHandlerType,
  TreeNodeBase,
} from "../../../../../models/treeview/treeNodeBase";
import StyledTreeItem from "../../../../data/treeview/StyledTreeItem";
import {
  ProcedurePriority,
  ProcedureStatus,
} from "../../../../../models/enums";
import { IconType } from "../../../../../models/common";
import PlaybookTreeNode from "./PlaybookTreeNode";
import ReportSectionTreeNode from "./ReportSectionTreeNode";
import { red, blue, green } from "@mui/material/colors";
import { ReportContainerTreeNode } from "./ReportContainerTreeNode";

const ICON_MAP: {
  [key in ProcedureStatus]?: IconType;
} = {
  // [ProcedureStatus.Pending]: LoopIcon,
  [ProcedureStatus.Not_Applicable]: DoneAllIcon,
  [ProcedureStatus.Work_in_Progress]: LoopIcon,
  [ProcedureStatus.Not_Tested]: NotInterestedIcon,
  [ProcedureStatus.Review]: PriorityHighIcon,
  [ProcedureStatus.Completed]: DoneAllIcon,
};

const COLOR_MAP: {
  [key in ProcedureStatus]?: string;
} = {
  // [ProcedureStatus.Not_Applicable]: ratingColors.Info,
  [ProcedureStatus.Work_in_Progress]: blue[800],
  // [ProcedureStatus.Not_Tested]: ratingColors.Low,
  [ProcedureStatus.Review]: red[800],
  [ProcedureStatus.Completed]: green[800],
};

export const NodeContent = ({
  object,
}: {
  object: ProcedureTreeNode;
  handler: EventHandlerType;
  readonly: boolean;
}) => {
  const StatusIcon =
    object.status in ICON_MAP ? ICON_MAP[object.status] : ChecklistIcon;
  const statusColor =
    object.status in COLOR_MAP ? COLOR_MAP[object.status] : undefined;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        p: 1,
        pr: 0,
      }}
    >
      <Box component={StatusIcon} sx={{ mr: 1, color: statusColor }} />
      <Typography variant="body2" sx={{ flexGrow: 1 }}>
        {object.name}
      </Typography>
    </Box>
  );
};

export default class ProcedureTreeNode extends ReportContainerTreeNode {
  public priority: ProcedurePriority;
  public status: ProcedureStatus;
  public sourceProcedureId: string;
  /*
   * Constructor for ProcedureNode, setting type to 'procedure'
   */
  constructor(
    uid: string,
    name: string,
    priority: number,
    status: number,
    sourceId: string
  ) {
    super(uid, name);
    this.priority = priority;
    this.status = status;
    this.sourceProcedureId = sourceId;
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
    return "procedure";
  }

  /*
   * Returns the test guide node containing the procedure.
   */
  getTestGuide(): PlaybookTreeNode | null | undefined {
    let parent: TreeNodeBase | null | undefined = this.parent;
    while (parent) {
      if (parent instanceof PlaybookTreeNode) {
        return parent;
      }
      parent = parent.parent;
    }
    return null;
  }

  getReportSection(): ReportSectionTreeNode | null | undefined {
    let parent: TreeNodeBase | null | undefined = this.parent;
    while (parent) {
      if (parent instanceof ReportSectionTreeNode) {
        return parent;
      }
      parent = parent.parent;
    }
    return null;
  }

  /*
   * Returns the URL for the curren procedure.
   *
   * baseUrl: /projects/{project_id}/reports/{report_id}
   * /report-sections/{section_id}/playbooks/{playbook_id}/sections/{section_id}/procedures/{procedure_id}
   */
  getUrl(): string {
    const playbook = this.getTestGuide();
    const reportSection = this.getReportSection();
    if (!playbook || !reportSection || !this.parent) {
      throw new Error("ProcedureTreeNode has no parent");
    }
    return (
      (playbook.getUrl() ?? "") +
      "/sections/" +
      this.parent.id +
      "/procedures/" +
      this.id
    );
  }

  static create(
    id: string,
    title: string,
    priority: number,
    status: number,
    sourceId: string
  ) {
    const node = new ProcedureTreeNode(id, title, priority, status, sourceId);
    return node;
  }
}
