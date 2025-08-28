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
import { Box } from "@mui/material";
import Typography from "@mui/material/Typography";
import LabelIcon from "@mui/icons-material/Label";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import { IconType } from "../../../../../models/common";
import {
  ContainerTreeNode,
  EventHandlerType,
} from "../../../../../models/treeview/treeNodeBase";
import StyledTreeItem from "../../../../data/treeview/StyledTreeItem";
import { ReportContainerTreeNode } from "./ReportContainerTreeNode";

export const NodeContent = ({
  object,
  nodeIcon,
}: {
  object: ContainerTreeNode;
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
      <Typography sx={{ flexGrow: 1 }}>{object.name}</Typography>
    </Box>
  );
};

/*
 * Class for a tree node that can contain other nodes.
 */
export default class ProcedureSectionTreeNode extends ReportContainerTreeNode {
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

  getUrl(): string {
    throw new Error("Method not implemented.");
  }

  static create(title: string, labelInfo = {}) {
    const node = new ProcedureSectionTreeNode(uuidv4(), title, labelInfo);
    return node;
  }
}
