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

import React from "react";
import { Box } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { TreeView as MuiTreeView } from "@mui/x-tree-view/TreeView";
import { TreeViewModelProviderProps } from "../../../../../util/hooks/treeview/useTreeViewProvider";
import {
  TreeNodeBase,
  TreeNodeEventType,
} from "../../../../../models/treeview/treeNodeBase";

interface TreeViewItemProps {
  treeViewProvider: TreeViewModelProviderProps;
  node: TreeNodeBase;
  onClick?: (event: TreeNodeEventType, node: TreeNodeBase) => void;
  onEdit?: (event: TreeNodeEventType | null, node: TreeNodeBase) => void;
  readonly?: boolean;
}

const TreeViewItem = ({
  treeViewProvider,
  node,
  onClick,
  onEdit,
  readonly,
}: TreeViewItemProps) => {
  const { provider: modelProvider, onTreeUpdateHandler: onUpdateHandler } =
    treeViewProvider;
  const onMoveLeftHandler = React.useCallback(
    (event: TreeNodeEventType) => {
      modelProvider.makeParent(node);
      onUpdateHandler();
      // Prevent the event from bubbling up to the parent.
      event.stopPropagation();
    },
    [node, modelProvider, onUpdateHandler]
  );

  const onMoveRightHandler = React.useCallback(
    (event: TreeNodeEventType) => {
      modelProvider.makeChild(node);
      onUpdateHandler();
      // Prevent the event from bubbling up to the parent.
      event.stopPropagation();
    },
    [node, modelProvider, onUpdateHandler]
  );

  const onMoveUpHandler = React.useCallback(
    (event: TreeNodeEventType | null) => {
      modelProvider.moveUp(node);
      onUpdateHandler();
      // Prevent the event from bubbling up to the parent.
      event?.stopPropagation();
    },
    [node, modelProvider, onUpdateHandler]
  );

  const onMoveDownHandler = React.useCallback(
    (event: TreeNodeEventType | null) => {
      modelProvider.moveDown(node);
      onUpdateHandler();
      // Prevent the event from bubbling up to the parent.
      event?.stopPropagation();
    },
    [node, modelProvider, onUpdateHandler]
  );

  const onDeleteHandler = React.useCallback(
    (event: TreeNodeEventType | null) => {
      // We need to check if the node is the selected node, and if so, we need to set the selected node to null.
      if (node.id === treeViewProvider.selectedNodeId.current) {
        treeViewProvider.selectedNodeId.current = null;
      }
      // We cannot directly call node.delete because if we delete the first root node, then we need to update the provider's pointer to the first element.
      modelProvider.deleteNode(node);
      onUpdateHandler();
      // Prevent the event from bubbling up to the parent.
      event?.stopPropagation();
    },
    [node, modelProvider, onUpdateHandler, treeViewProvider.selectedNodeId]
  );

  const children = node
    .getChildren()
    .map((item, index) => (
      <TreeViewItem
        key={index}
        treeViewProvider={treeViewProvider}
        node={item}
        onClick={onClick}
        onEdit={onEdit}
        readonly={readonly}
      />
    ));

  return node.getComponent(
    children,
    {
      onMoveUp: onMoveUpHandler,
      onMoveDown: onMoveDownHandler,
      onMoveLeft: onMoveLeftHandler,
      onMoveRight: onMoveRightHandler,
      onDelete: onDeleteHandler,
      onClick: onClick,
      onEdit: onEdit,
    },
    readonly ?? false
  );
};

interface TreeViewProps {
  treeViewProvider: TreeViewModelProviderProps;
  buttons?: JSX.Element[];
  onClick?: (event: TreeNodeEventType, node: TreeNodeBase) => void;
  onEdit?: (event: TreeNodeEventType | null, node: TreeNodeBase) => void;
  readonly?: boolean;
}

const TreeView = (props: TreeViewProps) => {
  const model = props.treeViewProvider.provider?.getAll() ?? [];
  const nodeIds =
    props.treeViewProvider.provider?.getNodeIds("containerOnly") ?? [];
  /*const [expanded, setExpanded] = React.useState(nodeIds);

  const handleExpandClick = () => {
    setExpanded((oldExpanded: string[]) =>
      oldExpanded.length === 0 ? nodeIds : []
    );
  };

  const handleToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
    setExpanded(nodeIds);
  };*/

  const siblings = model.map((item, index) => {
    return (
      <TreeViewItem
        key={index}
        treeViewProvider={props.treeViewProvider}
        node={item}
        onClick={props.onClick}
        onEdit={props.onEdit}
        readonly={props.readonly}
      />
    );
  });

  return (
    <Box>
      {(props.buttons?.length ?? 0) >= 0 && (
        <Box
          sx={{
            mb: 1,
            display: "flex",
            justifyContent: "center",
          }}
        >
          {/**/
          /*<Button
          variant="outlined"
          size="small"
          sx={{ mr: 2 }}
          onClick={handleExpandClick}
        >
          {expanded.length === 0 ? "Expand all" : "Collapse all"}
        </Button>*/}
          {props.buttons}
        </Box>
      )}
      <MuiTreeView
        // The expanded attribute prevents users from collapsing the tree.
        // expanded={nodeIds}
        defaultExpanded={nodeIds}
        // onNodeToggle={handleToggle}
        defaultCollapseIcon={<ArrowDropDownIcon />}
        defaultExpandIcon={<ArrowRightIcon />}
        defaultEndIcon={<div style={{ width: 24 }} />}
        sx={{ flexGrow: 1, overflowY: "auto", width: "100%" }}
      >
        {siblings}
      </MuiTreeView>
    </Box>
  );
};

export default TreeView;
