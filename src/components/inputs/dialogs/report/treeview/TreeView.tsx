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
import axios from "axios";
import { Box } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { TreeView as MuiTreeView } from "@mui/x-tree-view/TreeView";
import { TreeViewModelProviderProps } from "../../../../../util/hooks/treeview/useTreeViewProvider";
import {
  TreeNodeBase,
  TreeNodeEventType,
} from "../../../../../models/treeview/treeNodeBase";
import {
  useDataSubmission,
  UseDataSubmissionReturn,
} from "../../../../../util/hooks/useDataSubmission";
import ReportSectionTreeNode from "./ReportSectionTreeNode";
import ConfirmationDialog from "../../../../feedback/ConfirmationDialog";
import {
  useConfirmationDialog,
  UseConfirmationDialogReturn,
} from "../../../../../util/hooks/useConfirmationDialog";
import { SnackbarAlertv2 } from "../../../../feedback/snackbar/SnackbarAlert";
import PlaybookTreeNode from "./PlaybookTreeNode";
import VulnerabilityTreeNode from "./VulnerabilityTreeNode";
import { QueryKey } from "@tanstack/react-query";

interface TreeViewItemProps {
  projectId: string;
  reportId: string;
  baseUrl: string;
  queryKey: QueryKey;
  confirmationContext: UseConfirmationDialogReturn;
  treeViewProvider: TreeViewModelProviderProps;
  submit: UseDataSubmissionReturn;
  node: TreeNodeBase;
  onClick?: (event: TreeNodeEventType, node: TreeNodeBase) => void;
  onEdit?: (event: TreeNodeEventType | null, node: TreeNodeBase) => void;
  onAddTestGuide: (node: TreeNodeBase, event?: TreeNodeEventType) => void;
  onAddVulnerability: (node: TreeNodeBase, event?: TreeNodeEventType) => void;
  onAddNewVulnerability: (
    node: TreeNodeBase,
    event?: TreeNodeEventType
  ) => void;
  readonly?: boolean;
}

const TreeViewItem = ({
  projectId,
  reportId,
  baseUrl,
  queryKey,
  confirmationContext,
  treeViewProvider,
  submit,
  node,
  onClick,
  onEdit,
  onAddTestGuide,
  onAddVulnerability,
  onAddNewVulnerability,
  readonly,
}: TreeViewItemProps) => {
  /**
   * This function is used to get the URL of the node.
   */
  const getUrl = React.useCallback((node: TreeNodeBase) => {
    let url: string | null = null;
    if (
      node instanceof ReportSectionTreeNode ||
      node instanceof PlaybookTreeNode ||
      node instanceof VulnerabilityTreeNode
    ) {
      url = node.getUrl();
    } else {
      console.error("Node type not supported for move-up operation.");
    }
    return url;
  }, []);

  const onMoveUpHandler = React.useCallback(
    async (event: TreeNodeEventType | null) => {
      const url = getUrl(node);
      if (url) {
        // Here we update the backend
        await submit.performSubmission({
          dataSubmissionFn: async () => await axios.put(url + "/move-up"),
          queryKey: queryKey,
        });
      }
      // Prevent the event from bubbling up to the parent.
      event?.stopPropagation();
    },
    [queryKey, submit, node, getUrl]
  );

  const onMoveDownHandler = React.useCallback(
    async (event: TreeNodeEventType | null) => {
      const url = getUrl(node);
      if (url) {
        // Here we update the backend
        await submit.performSubmission({
          dataSubmissionFn: async () => await axios.put(url + "/move-down"),
          queryKey: queryKey,
        });
      }
      // Prevent the event from bubbling up to the parent.
      event?.stopPropagation();
    },
    [queryKey, submit, node, getUrl]
  );

  const onDeleteHandler = React.useCallback(
    async (event: TreeNodeEventType | null) => {
      // We need to check if the node is the selected node, and if so, we need to set the selected node to null.
      if (node.id === treeViewProvider.selectedNodeId.current) {
        treeViewProvider.selectedNodeId.current = null;
      }
      // We display the confirmation dialog and if the user confirms, then we send the request to the backend to delete the item.
      confirmationContext.showDialog(async () => {
        const url = getUrl(node);
        if (url) {
          // Here we update the backend
          await submit.performSubmission({
            dataSubmissionFn: async () => await axios.delete(url),
            queryKey: queryKey,
          });
        }
      });
      // Prevent the event from bubbling up to the parent.
      event?.stopPropagation();
    },
    [
      node,
      getUrl,
      queryKey,
      confirmationContext,
      submit,
      treeViewProvider.selectedNodeId,
    ]
  );

  const children = node
    .getChildren()
    .map((item, index) => (
      <TreeViewItem
        projectId={projectId}
        reportId={reportId}
        baseUrl={baseUrl}
        queryKey={queryKey}
        key={index}
        submit={submit}
        confirmationContext={confirmationContext}
        treeViewProvider={treeViewProvider}
        node={item}
        onClick={onClick}
        onEdit={onEdit}
        onAddTestGuide={onAddTestGuide}
        onAddVulnerability={onAddVulnerability}
        onAddNewVulnerability={onAddNewVulnerability}
        readonly={readonly}
      />
    ));

  return node.getComponent(
    children,
    {
      onMoveUp: onMoveUpHandler,
      onMoveDown: onMoveDownHandler,
      onDelete: onDeleteHandler,
      onClick: onClick,
      onEdit: onEdit,
      additionalEvents: {
        onAddTestGuide,
        onAddVulnerability,
        onAddNewVulnerability,
      },
    },
    readonly ?? false
  );
};

interface TreeViewProps {
  projectId: string;
  reportId: string;
  baseUrl: string;
  selectedNodeId?: string;
  queryKey: QueryKey;
  treeViewProvider: TreeViewModelProviderProps;
  buttons?: JSX.Element[];
  onClick?: (event: TreeNodeEventType, node: TreeNodeBase) => void;
  onEdit?: (event: TreeNodeEventType | null, node: TreeNodeBase) => void;
  onAddTestGuide: (node: TreeNodeBase) => void;
  onAddVulnerability: (node: TreeNodeBase) => void;
  onAddNewVulnerability: (node: TreeNodeBase) => void;
  readonly?: boolean;
}

const TreeView = (props: TreeViewProps) => {
  const model = props.treeViewProvider.provider?.getAll() ?? [];
  const nodeIds =
    props.treeViewProvider.provider?.getNodeIds("containerOnly") ?? [];
  const submit = useDataSubmission();
  const confirmationContext = useConfirmationDialog({
    title: "Delete item ...",
    message:
      "Are you sure you want to permanently delete this item together with all its child nodes and vulnerabilities?",
  });

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
        projectId={props.projectId}
        reportId={props.reportId}
        baseUrl={props.baseUrl}
        queryKey={props.queryKey}
        confirmationContext={confirmationContext}
        submit={submit}
        key={index}
        treeViewProvider={props.treeViewProvider}
        node={item}
        onClick={props.onClick}
        onEdit={props.onEdit}
        onAddTestGuide={props.onAddTestGuide}
        onAddVulnerability={props.onAddVulnerability}
        onAddNewVulnerability={props.onAddNewVulnerability}
        readonly={props.readonly}
      />
    );
  });

  return (
    <>
      <SnackbarAlertv2 context={submit} />
      <ConfirmationDialog {...confirmationContext} />
      <Box style={{ flexShrink: 0 }}>
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
          expanded={nodeIds}
          defaultExpanded={nodeIds}
          // onNodeToggle={handleToggle}
          selected={props.selectedNodeId ?? ""}
          defaultCollapseIcon={<ArrowDropDownIcon />}
          defaultExpandIcon={<ArrowRightIcon />}
          defaultEndIcon={<div style={{ width: 24 }} />}
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            width: "100%",
          }}
        >
          {siblings}
        </MuiTreeView>
      </Box>
    </>
  );
};

export default TreeView;
