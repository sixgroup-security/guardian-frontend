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
import { Grid, Paper, Button } from "@mui/material";
import {
  GridRowParams,
  GridValidRowModel,
  GridActionsCellItem,
  GridActionsCellItemProps,
} from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import {
  DefaultDetailsDialogProps,
  DetailsDialogv2 as DetailsDialog,
  Item,
} from "../DetailsDialog";
import { InputControlFieldWrapperv2 as InputControlFieldWrapper } from "../../InputControlWrapper";
import { useQuery } from "../../../../util/hooks/tanstack/useQuery";
import TreeView from "./treeview/TreeView";
import {
  TreeNodeBase,
  ContainerTreeNode,
  TreeNodeEventType,
} from "../../../../models/treeview/treeNodeBase";
import TemplateProcedureTreeNode from "../../../inputs/dialogs/testguide/treeview/TemplateProcedureTreeNode";
import PagesDataGrid from "../../../data/datagrid/PagesDataGrid";
import {
  queryKeyTestProcedures as queryKey,
  COLUMN_DEFINITION,
  URL_TEST_PROCEDURES as URL,
  TestProcedureRead as ObjectRead,
} from "../../../../models/testProcedure";
import { TreeViewTestGuideProvider } from "../../../../models/treeview/treeViewTestGuideProvider";
import { useTreeViewProvider } from "../../../../util/hooks/treeview/useTreeViewProvider";
import TestGuideSectionDialog from "./TestGuideSectionDialog";
import { SECTION_ATTRIBUTES } from "../../../../models/testguide";
import { DetailsDialogMode, MainPages } from "../../../../models/enums";
import {
  usePageManager,
  onSubmitHandler,
} from "../../../../util/hooks/usePageManager";
import TemplateProcedureSectionTreeNode from "../../../inputs/dialogs/testguide/treeview/TemplateProcedureSectionTreeNode";
import {
  renderCellTestProcedures as renderCell,
  valueGetterTestProcedures as valueGetter,
} from "../../../../pages/Common";

export interface TestGuideDetailsDialogProps extends DefaultDetailsDialogProps {
  // The REST API endpoint to upload files.
  apiEndpoint?: string;
}

const TestGuideDetailsDialog: React.FC<TestGuideDetailsDialogProps> =
  React.memo((props) => {
    const { context } = props;
    const { pageManager: parentPageManager } = context;
    const sectionDialogContext = usePageManager({
      columns: SECTION_ATTRIBUTES,
      navigateable: false,
    });
    const {
      pageManager,
      dispatchPageManager,
      showNewDialog,
      showEditDialog,
      closeDialog,
    } = sectionDialogContext;
    const {
      submitOnly: onSubmitTestGuideDialog,
      closeDialog: onCloseTestGuideDialog,
    } = context;
    if (!onSubmitTestGuideDialog || !onCloseTestGuideDialog) {
      throw new Error(
        "Attributes onSubmitTestGuideDialog and onCloseTestGuideDialog are required."
      );
    }
    // Obtain the user's preferred report language or the default language as default.
    const mainLanguage = context.preferredLanguage;
    // Query test procedure data from backend API
    const query = useQuery({
      queryKey: queryKey,
      path: URL,
      // Here, we convert the received list of data objects into a list of ProjectRead objects.
      convertFn: (data: any[]) => data.map((d) => new ObjectRead(d)),
    });
    const readonly = parentPageManager.mode == DetailsDialogMode.View;
    const procedureData = React.useMemo(
      () => (query.data as any[]) ?? [],
      [query.data]
    );

    const procedureLookupFn = React.useCallback(
      (id: string) => {
        return (
          procedureData.find((item) => item.id === id)?.name ??
          "[MEASURE NOT FOUND ANYMORE]"
        );
      },
      [procedureData]
    );

    const treeViewProvider = useTreeViewProvider(
      TreeViewTestGuideProvider,
      parentPageManager.content?.structure,
      mainLanguage,
      procedureLookupFn
    );

    const handleCreateDataGridRecord = React.useCallback(() => {
      showNewDialog(
        "Create new test guide section",
        context.languageQuery.reportLanguages
      );
    }, [showNewDialog, context.languageQuery.reportLanguages]);

    const handleOnEdit = React.useCallback(
      (_event: TreeNodeEventType | null, node: TreeNodeBase) => {
        // We also need to store the node's ID. This allows us to update the correct node, once the user clicks Save.
        const content = { ...(node as ContainerTreeNode).info, id: node.id };
        showEditDialog(
          content.name,
          context.languageQuery.reportLanguages,
          content
        );
      },
      [showEditDialog, context.languageQuery.reportLanguages]
    );

    /*
     * Method used by TestGuideSectionDialog component to add a new section to the tree structure.
     */
    const handleSubmit = React.useCallback(() => {
      const ok = onSubmitHandler({
        pageManager,
        dispatchPageManager, // We do not submit a post or put mutation object because we only want input validation
      });
      if (ok && mainLanguage) {
        if (pageManager.mode === DetailsDialogMode.Edit) {
          const content = pageManager.content as any;
          // We need to find the node that has been edited
          const currentNode = treeViewProvider.provider.find(
            content.id
          ) as ContainerTreeNode;
          currentNode.name = content.title[mainLanguage.language_code];
          delete content.id;
          currentNode.info = content;
        } else if (pageManager.mode === DetailsDialogMode.Create) {
          const node = TemplateProcedureSectionTreeNode.create(
            pageManager.content.title[mainLanguage.language_code],
            pageManager.content
          );

          if (treeViewProvider.selectedNodeId.current) {
            const currentNode = treeViewProvider.provider.find(
              treeViewProvider.selectedNodeId.current
            );
            if (currentNode) {
              treeViewProvider.provider.insertNextTo(node, currentNode);
            }
          } else {
            treeViewProvider.provider.insertLast(node);
          }
        }

        treeViewProvider.onTreeUpdateHandler();
        closeDialog();
      }
    }, [
      pageManager,
      dispatchPageManager,
      mainLanguage,
      treeViewProvider,
      closeDialog,
    ]);

    const handleTreeItemClicked = React.useCallback(
      (event: TreeNodeEventType, node: TreeNodeBase) => {
        treeViewProvider.selectedNodeId.current = node.id;
        // Prevent the event from bubbling up to the parent.
        event.stopPropagation();
      },
      [treeViewProvider.selectedNodeId]
    );

    const handleOnAddProcedure = React.useCallback(
      (selectedTableRow: GridRowParams<GridValidRowModel>) => {
        const title = procedureLookupFn(selectedTableRow.id.toString());
        const node = TemplateProcedureTreeNode.create(
          selectedTableRow.id.toString(),
          title
        );

        if (treeViewProvider.selectedNodeId.current) {
          const currentNode = treeViewProvider.provider.find(
            treeViewProvider.selectedNodeId.current
          ) as ContainerTreeNode;
          if (currentNode) {
            treeViewProvider.provider.addChild(node, currentNode);
          }
        } else {
          treeViewProvider.provider.insertLast(node);
        }

        treeViewProvider.onTreeUpdateHandler();
      },
      [procedureLookupFn, treeViewProvider]
    );

    // Create the DataGrid's Action column
    const getTableActions = React.useCallback(
      (
        params: GridRowParams<GridValidRowModel>
      ): React.ReactElement<GridActionsCellItemProps>[] => {
        const actions = [];
        actions.push(
          <GridActionsCellItem
            icon={<AddIcon />}
            label="View"
            onClick={() => handleOnAddProcedure(params)}
          />
        );
        return actions;
      },
      [handleOnAddProcedure]
    );

    //console.log("TestGuideDetailsDialog", parentPageManager, treeViewProvider);

    return (
      <>
        <TestGuideSectionDialog
          open={false}
          context={sectionDialogContext}
          onSubmit={handleSubmit}
        />
        <DetailsDialog
          disableEscapeKeyDown
          maxWidth="xl"
          fullWidth
          onSubmit={() => {
            parentPageManager.content.structure = treeViewProvider.model;
            onSubmitTestGuideDialog();
          }}
          onClose={() => {
            // We have to reset the TreeViewProvider content, else it is still set when a new dialog is opened.
            treeViewProvider.resetTreeViewProvider();
            onCloseTestGuideDialog();
          }}
          {...props}
        >
          <Grid container spacing={2} columns={16}>
            <Grid item xs={6}>
              <Item>
                <Paper sx={{ p: 2, minHeight: "calc(100vh - 175px)" }}>
                  <TreeView
                    treeViewProvider={treeViewProvider}
                    onClick={handleTreeItemClicked}
                    onEdit={handleOnEdit}
                    readonly={readonly}
                    buttons={
                      readonly
                        ? []
                        : [
                            <Button
                              key="AddSection"
                              variant="outlined"
                              size="small"
                              sx={{ mr: 2 }}
                              onClick={handleCreateDataGridRecord}
                            >
                              Add Section
                            </Button>,
                          ]
                    }
                  />
                </Paper>
              </Item>
            </Grid>
            <Grid item xs={10}>
              <Grid item xs>
                <Item>
                  <InputControlFieldWrapper
                    id="name"
                    size="small"
                    context={context}
                  />
                </Item>
              </Grid>
              <Grid item xs>
                <Item style={{ height: "calc(100vh - 230px)" }}>
                  <PagesDataGrid
                    page={MainPages.TestProcedures}
                    user={context.me!}
                    columns={COLUMN_DEFINITION}
                    isLoading={query.isLoading}
                    rows={procedureData}
                    getCellValueFn={valueGetter}
                    renderCellFn={renderCell}
                    getTableActions={getTableActions}
                    //onNewButtonClick={handleCreateDataGridRecord}
                  />
                </Item>
              </Grid>
            </Grid>
          </Grid>
        </DetailsDialog>
      </>
    );
  });

export default TestGuideDetailsDialog;
