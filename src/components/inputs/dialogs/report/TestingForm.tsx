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
 * along with Guardian. If not, see <https://www.gnu.org/licenses/>.
 *
 * @author Lukas Reiter
 * @copyright Copyright (C) 2024 Lukas Reiter
 * @license GPLv3
 */

import React from "react";
import axios from "axios";
import { Grid, Button } from "@mui/material";
import { Item } from "../DetailsDialog";
import TreeView from "./treeview/TreeView";
import AddTestGuidesDialog from "./AddTestGuidesDialog";
import { useTreeViewProvider } from "../../../../util/hooks/treeview/useTreeViewProvider";
import {
  ContainerTreeNode,
  TreeNodeBase,
  TreeNodeEventType,
} from "../../../../models/treeview/treeNodeBase";
import { TreeViewReportProvider } from "../../../../models/treeview/treeViewReportProvider";
import { queryKeyVulnerabilities } from "../../../../models/vulnerability";
import {
  ReportProcedureRead,
  queryKeyReportProcedure,
  COLUMN_DEFINITION as REPORT_PROCEDURE_COLUMN_DEFINITION,
} from "../../../../models/reportProcedure";
import {
  SECTION_ATTRIBUTES,
  TEST_GUIDE_LOOKUP_ATTRIBUTES,
  ReportTestingRead,
} from "../../../../models/report";
import { TestGuideLookup } from "../../../../models/testguide";
import {
  usePageManager,
  onSubmitHandler,
} from "../../../../util/hooks/usePageManager";
import { UseQueryResult } from "../../../../util/hooks/tanstack/useQueryReportData";
import ReportSectionDialog from "./ReportSectionDialog";
import { useQueryReportLanguage } from "../../../../util/hooks/tanstack/useQueryReportLanguage";
import { DetailsDialogMode } from "../../../../models/enums";
import { useQuery } from "../../../../util/hooks/tanstack/useQuery";
import { useDataSubmission } from "../../../../util/hooks/useDataSubmission";
import { SnackbarAlertv2 } from "../../../feedback/snackbar/SnackbarAlert";
import ProcedureTreeNode from "./treeview/ProcedureTreeNode";
import VulnerabilityTreeNode from "./treeview/VulnerabilityTreeNode";
import AddVulnerabilitiesDialog from "./vulnerability/AddVulnerabilitiesDialog";
import ReportSectionTreeNode from "./treeview/ReportSectionTreeNode";
import VulnerabilityMarkdownForm from "./vulnerability/VulnerabilityMarkdownForm";
import ReportProcedureForm from "./reportprocedure/ReportProcedureForm";
import VulnerabilityDataGrid from "../vulnerability/VulnerabilityDataGrid";

interface TestingFormProps {
  data: UseQueryResult<unknown, Error, ReportTestingRead>;
  // This state is updated when the user selects a node in the tree view. This allows us to display the correct details page.
  selectedNodeId?: string;
  setSelectedNodeId: (value: string) => void;
}

const TestingForm = React.memo((props: TestingFormProps) => {
  const { selectedNodeId, setSelectedNodeId } = props;
  const {
    projectId,
    reportId,
    result: report,
    reportBaseUrl: baseUrl,
    queryKey,
  } = props.data;
  const [openAddVulnerabilitiesDialog, setOpenAddVulnerabilitiesDialog] =
    React.useState<string>();
  const { reportLanguages, mainLanguage } = useQueryReportLanguage({
    enabled: true,
  });
  // Used to refresh the entire report data
  const invalidateQueryKeys = React.useMemo(() => [queryKey], [queryKey]);
  const editMode = true;
  const submit = useDataSubmission();
  const reportSectionContext = usePageManager({ columns: SECTION_ATTRIBUTES });
  const {
    pageManager: reportSectionPageManager,
    dispatchPageManager: reportSectionDispatchPageManager,
    showNewDialog: showNewReportSectionDialog,
    showEditDialog: showEditReportSectionDialog,
    closeDialog: closeReportSectionDialog,
  } = reportSectionContext;
  const testGuideContext = usePageManager({
    columns: TEST_GUIDE_LOOKUP_ATTRIBUTES,
  });
  const {
    pageManager: addTestGuidePageManager,
    dispatchPageManager: addTestGuideDispatchPageManager,
    showNewDialog: showAddTestGuidesDialog,
    closeDialog: closeAddTestGuidesDialog,
  } = testGuideContext;
  const treeViewProvider = useTreeViewProvider(
    TreeViewReportProvider,
    React.useMemo(() => report?.structure ?? {}, [report]),
    (_id: string, defaultTitle?: string) => defaultTitle ?? "[New Section]",
    projectId,
    reportId
  );
  // We obtain the currently selected node object.
  const currentNode = React.useMemo(
    () => treeViewProvider.provider.find(selectedNodeId ?? ""),
    [
      // The following line causes an infinite loop in combination with React.useEffect
      //treeViewProvider.provider,
      selectedNodeId,
    ]
  );
  // If a vulnerability tree node was selected, then we need to load its data
  const vulnerabilityNode = React.useMemo(
    () =>
      currentNode instanceof VulnerabilityTreeNode
        ? (currentNode as VulnerabilityTreeNode)
        : undefined,
    [currentNode]
  );
  const vulnerabilityUrl = React.useMemo(
    () => vulnerabilityNode?.getUrl() ?? "",
    [vulnerabilityNode]
  );
  const vulnerabilityQueryKey = React.useMemo(
    () =>
      vulnerabilityNode
        ? [...queryKeyVulnerabilities, vulnerabilityNode.id]
        : [],
    [vulnerabilityNode]
  );
  // If a procedure tree node was selected, then we need to load its data
  const procedureNode = React.useMemo(
    () =>
      currentNode instanceof ProcedureTreeNode
        ? (currentNode as ProcedureTreeNode)
        : undefined,
    [currentNode]
  );
  const procedureUrl = React.useMemo(
    () => procedureNode?.getUrl() ?? "",
    [procedureNode]
  );
  const procedureQueryKey = React.useMemo(
    () => (procedureNode ? [...queryKeyReportProcedure, procedureNode.id] : []),
    [procedureNode]
  );
  // Obtain data from backend once a ProcedureTreeNode is selected.
  const queryProcedure = useQuery({
    path: procedureUrl,
    queryKey: procedureQueryKey,
    enabled: currentNode instanceof ProcedureTreeNode,
  });
  // The form/page manater for tracking the content of the VulnerabilityForm component
  const procedurePageManagerContext = usePageManager({
    columns: REPORT_PROCEDURE_COLUMN_DEFINITION,
    apiEndpoint: procedureUrl,
    queryKey: procedureQueryKey,
    switchToEditMode: false,
    navigateable: false,
    // Submissions must also invalidate the query cache to ensure the TreeView component is updated.
    invalidateQueryKeys: invalidateQueryKeys,
  });
  const procedure = React.useMemo(
    () =>
      procedurePageManagerContext.pageManager.mode
        ? new ReportProcedureRead(
            procedurePageManagerContext.pageManager.content
          )
        : undefined,
    [
      procedurePageManagerContext.pageManager.content,
      procedurePageManagerContext.pageManager.mode,
    ]
  );

  // This method creates a new empty vulnerability in the current report section.
  const handleNewVulnerabilityClick = React.useCallback(
    async (node: TreeNodeBase) => {
      if (node instanceof ReportSectionTreeNode) {
        const url = node.getUrl();
        if (url) {
          await submit.performSubmission({
            dataSubmissionFn: async () =>
              await axios.post(url + "/vulnerabilities/new"),
            queryKey: queryKey,
          });
        }
      }
    },
    [queryKey, submit]
  );

  // This method displays the AddVulnerabilititiesDialog allowing a user to add vulnerability templates to the current procedure
  const handleAddVulnerabilityClick = React.useCallback(
    (node: TreeNodeBase) => {
      if (node instanceof ReportSectionTreeNode) {
        const url = node.getUrl();
        if (url) {
          setOpenAddVulnerabilitiesDialog(url + "/vulnerabilities");
        }
      }
    },
    []
  );
  // This method hides the AddVulnerabilititiesDialog
  const closeAddVulnerabilityDialog = React.useCallback(() => {
    setOpenAddVulnerabilitiesDialog(undefined);
  }, []);

  // Open the dialog to add a new section
  const handleAddSectionClick = React.useCallback(() => {
    showNewReportSectionDialog("Create report section", reportLanguages);
  }, [showNewReportSectionDialog, reportLanguages]);

  // Open the dialog to add a new test guide
  const handleAddTestGuideClick = React.useCallback(
    (node: TreeNodeBase) => {
      treeViewProvider.selectedNodeId.current = node.id;
      showAddTestGuidesDialog("Add playbooks", reportLanguages);
    },
    [showAddTestGuidesDialog, reportLanguages, treeViewProvider]
  );

  // Handle user inputs in the new section dialog
  const handleOnEdit = React.useCallback(
    (_event: TreeNodeEventType | null, node: TreeNodeBase) => {
      // We also need to store the node's ID. This allows us to update the correct node, once the user clicks Save.
      const content = { ...(node as ContainerTreeNode).info, id: node.id };
      showEditReportSectionDialog(content.name, reportLanguages, content);
    },
    [showEditReportSectionDialog, reportLanguages]
  );

  // Handle submission of the new section dialog
  const handleSubmit = React.useCallback(async () => {
    const ok = onSubmitHandler({
      pageManager: reportSectionPageManager,
      dispatchPageManager: reportSectionDispatchPageManager, // We do not submit a post or put mutation object because we only want input validation
    });
    if (ok) {
      try {
        if (reportSectionPageManager.mode == DetailsDialogMode.Edit) {
          const content = reportSectionPageManager.content as any;

          // Here we update the backend
          await submit.performSubmission({
            dataSubmissionFn: async () =>
              await axios.put(baseUrl + "/report-sections", content, {
                headers: {
                  "Content-Type": "application/json",
                },
              }),
            queryKey: queryKey,
            throwException: true,
          });
        } else if (reportSectionPageManager.mode == DetailsDialogMode.Create) {
          const content = reportSectionPageManager.content as any;
          delete content.id;

          // Here we update the backend
          await submit.performSubmission({
            dataSubmissionFn: async () =>
              await axios.post(baseUrl + "/report-sections", content, {
                headers: {
                  "Content-Type": "application/json",
                },
              }),
            queryKey: queryKey,
            throwException: true,
          });
        }
        closeReportSectionDialog();
      } catch (ex) {
        console.error(ex);
      }
    }
  }, [
    baseUrl,
    queryKey,
    submit,
    reportSectionPageManager,
    reportSectionDispatchPageManager,
    closeReportSectionDialog,
  ]);

  // Handle submission of new test guides
  const handleAddTestGuideSubmit = React.useCallback(async () => {
    const ok = onSubmitHandler({
      pageManager: addTestGuidePageManager,
      dispatchPageManager: addTestGuideDispatchPageManager, // We do not submit a post or put mutation object because we only want input validation
    });
    if (ok) {
      const content = addTestGuidePageManager.content
        .testGuides as TestGuideLookup[];
      const testGuideIds = content.map((item) => item.id);
      if (
        treeViewProvider.selectedNodeId.current &&
        mainLanguage?.language_code
      ) {
        try {
          // Here we update the backend
          await submit.performSubmission({
            dataSubmissionFn: async () =>
              await axios.post(
                baseUrl +
                  "/report-sections/" +
                  treeViewProvider.selectedNodeId.current +
                  "/playbooks",
                testGuideIds,
                {
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              ),
            queryKey: queryKey,
            throwException: true,
          });
          closeAddTestGuidesDialog();
        } catch (ex) {
          console.error(ex);
        }
      }
    }
  }, [
    baseUrl,
    queryKey,
    submit,
    addTestGuidePageManager,
    addTestGuideDispatchPageManager,
    treeViewProvider,
    mainLanguage,
    closeAddTestGuidesDialog,
  ]);

  const handleTreeItemClicked = React.useCallback(
    (event: TreeNodeEventType | null, node: TreeNodeBase) => {
      treeViewProvider.selectedNodeId.current = node.id;
      // Prevent the event from bubbling up to the parent.
      event?.stopPropagation();
      // Update the selected node and display the correct details page.
      setSelectedNodeId(node.id);
    },
    [treeViewProvider.selectedNodeId, setSelectedNodeId]
  );

  const treeViewButtons = React.useMemo(
    () => [
      <Button
        key="AddSection"
        variant="outlined"
        size="small"
        disabled={!editMode}
        sx={{ ml: 2 }}
        onClick={handleAddSectionClick}
      >
        Add Section
      </Button>,
    ],
    [editMode, handleAddSectionClick]
  );

  const [detailsPageId, detailsPage] = React.useMemo(() => {
    if (currentNode instanceof ProcedureTreeNode && procedure) {
      return [
        `ptn_${currentNode.id}`,
        <ReportProcedureForm
          node={currentNode}
          baseUrl={baseUrl}
          queryKey={queryKey}
          queryUrl={procedureUrl}
          procedure={procedure}
          context={procedurePageManagerContext}
          onSubmit={() => onSubmitHandler(procedurePageManagerContext)}
        />,
      ];
    } else if (currentNode instanceof ReportSectionTreeNode) {
      const url = currentNode.getUrl();
      if (url) {
        return [
          `pstn_${currentNode.id}`,
          <Item style={{ height: "65vh" }}>
            <VulnerabilityDataGrid
              queryUrl={url + "/vulnerabilities"}
              queryKey={[...queryKey, "vulnerabilities"]}
            />
          </Item>,
        ];
      }
    } else if (vulnerabilityNode?.id) {
      return [
        `vmdf${vulnerabilityNode?.id}`,
        <VulnerabilityMarkdownForm
          vulnerabilityUrl={vulnerabilityUrl}
          vulnerabilityQueryKey={vulnerabilityQueryKey}
          invalidateQueryKeys={invalidateQueryKeys}
          enabled={currentNode instanceof VulnerabilityTreeNode}
          report={report}
        />,
      ];
    }
    return [null, null];
  }, [
    baseUrl,
    queryKey,
    currentNode,
    vulnerabilityQueryKey,
    invalidateQueryKeys,
    vulnerabilityNode,
    vulnerabilityUrl,
    report,
    procedure,
    procedureUrl,
    procedurePageManagerContext,
  ]);

  React.useEffect(() => {
    if (queryProcedure.isSuccess && procedureNode) {
      procedurePageManagerContext.showEditDialog(
        "Enter report procedure.",
        [],
        new ReportProcedureRead(queryProcedure.data)
      );
    } else {
      procedurePageManagerContext.closeDialog();
    }
  }, [
    // The following line causes an infinite loop.
    // procedurePageManagerContext,
    queryProcedure.isSuccess,
    queryProcedure.data,
    procedureNode,
  ]);

  return (
    <>
      <SnackbarAlertv2 context={submit} />
      {/* The AddVulnerabilitiesDialog is displayed when the user clicks the Add Vulnerability MenuItem of a Report Section tree node. */}
      <AddVulnerabilitiesDialog
        open={openAddVulnerabilitiesDialog !== undefined}
        onClose={closeAddVulnerabilityDialog}
        submissionBaseUrl={openAddVulnerabilitiesDialog}
        submissionBaseQueryKey={queryKey}
      />
      <ReportSectionDialog
        open={false}
        context={reportSectionContext}
        onSubmit={handleSubmit}
      />
      <AddTestGuidesDialog
        open={false}
        context={testGuideContext}
        onSubmit={handleAddTestGuideSubmit}
      />
      <Grid container spacing={1} columns={16} sx={{ height: "100%" }}>
        <Grid item xs={6} sx={{ height: "100%" }}>
          <Item sx={{ height: "100%", overflow: "auto" }}>
            <TreeView
              selectedNodeId={selectedNodeId}
              projectId={projectId ?? ""}
              reportId={reportId ?? ""}
              baseUrl={baseUrl}
              queryKey={queryKey}
              treeViewProvider={treeViewProvider}
              onClick={handleTreeItemClicked}
              onEdit={handleOnEdit}
              onAddTestGuide={handleAddTestGuideClick}
              onAddVulnerability={handleAddVulnerabilityClick}
              onAddNewVulnerability={handleNewVulnerabilityClick}
              readonly={!editMode}
              buttons={treeViewButtons}
            />
          </Item>
        </Grid>
        <Grid item xs={10} sx={{ height: "100%", overflow: "auto" }}>
          {
            // We need to set a unique key to force React removing all child states.
          }
          <Item key={detailsPageId}>{detailsPage}</Item>
        </Grid>
      </Grid>
    </>
  );
});

export default TestingForm;
