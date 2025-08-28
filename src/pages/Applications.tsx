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
import {
  Link,
  Chip,
  Alert,
  IconButton,
  Menu,
  Stack,
  Tooltip,
} from "@mui/material";
import UpdateIcon from "@mui/icons-material/Update";
import ConstructionIcon from "@mui/icons-material/Construction";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import BugReportIcon from "@mui/icons-material/BugReport";
import LockResetIcon from "@mui/icons-material/LockReset";
import DoneIcon from "@mui/icons-material/Done";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import SyncIcon from "@mui/icons-material/Sync";
import {
  GridColDef,
  GridRowSelectionModel,
  GridToolbarContainer,
} from "@mui/x-data-grid";
import {
  ApplicationRead as ObjectRead,
  COLUMN_DEFINITION,
  URL_APPLICATIONS as URL,
  queryKeyApplications as queryKey,
} from "../models/application/application";
import { COLUMN_DEFINITION as CREATE_PROJECTS_VALUES } from "../models/application/projectCreation";
import { MainPages } from "../models/enums";
import ApplicationDetailsDialog from "../components/inputs/dialogs/application/ApplicationDetailsDialog";
import { ChipColorType, StateContentTypes } from "../models/common";
import PagesDataGrid from "../components/data/datagrid/PagesDataGrid";
import LoadingIndicator from "../components/feedback/LoadingIndicator";
import UseMutationSnackbarAlert from "../components/feedback/snackbar/UseMutationSnackbarAlert";
import MainPaper from "../layout/MainPaper";
import ConfirmationDialog from "../components/feedback/ConfirmationDialog";
import {
  DataGridActionSettingsType,
  useLuminaCore,
} from "../util/hooks/useLuminaCore";
// Remux related imports for managing the year state.
import { APP_INVENTORY_URL } from "../util/consts/common.js";
import MenuItemEntry from "../components/data/treeview/MenuItemEntry";
import { getDefaultGridToolbars } from "../components/data/datagrid/getDefaultGridToolbars";
import { usePageManager } from "../util/hooks/usePageManager.js";
import CreateProjectsDialog from "../components/inputs/dialogs/application/CreateProjectsDialog";
import { ProjectCreation } from "../models/application/projectCreation";
import { ProjectType } from "../models/enums";
import { EntityLookup } from "../models/entity/entity.js";
import { TagLookup } from "../models/tagging/tag";
import RefreshProgress from "../components/feedback/RefreshProgress.js";
import { summarize_list } from "./Common.js";

export const InventoryLink: React.FC<{ application_id: string }> = ({
  application_id,
}) =>
  APP_INVENTORY_URL && (
    <Link
      href={`${APP_INVENTORY_URL}/${application_id}`}
      target="_blank"
      rel="noreferrer"
    >
      {application_id}
    </Link>
  );

/*
 This function is used by the DataGrid component to custom-render cells.

 For possible Chip colors, see https://mui.com/material-ui/api/chip/#Chip-prop-color
 */
const renderCell = (column: GridColDef) => {
  if (column.field === "application_id") {
    return ({ value }: { value: string }) => (
      <InventoryLink application_id={value} />
    );
  }
  if (column.field === "state") {
    return ({ value }: { value?: string }) => {
      let color: ChipColorType = "default";
      let icon = <DeleteOutlineIcon />;

      switch (value) {
        case "Planned":
          color = "default"; // Grey
          icon = <UpdateIcon />;
          break;
        case "Development":
          color = "info"; // Light Blue
          icon = <ConstructionIcon />;
          break;
        case "Production":
          color = "primary"; // Dark Blue
          icon = <DirectionsRunIcon />;
          break;
        case "Decomissioned":
          color = "default"; // Grey
          icon = <DeleteOutlineIcon />;
          break;
        default:
      }
      return (
        <Chip
          icon={icon}
          label={value}
          color={color}
          variant="outlined"
          sx={{ width: "150px" }}
        />
      );
    };
  }
  if (column.field === "overdue") {
    return ({ value }: { value?: string }) => {
      let color: ChipColorType = "error";
      let icon = <WarningAmberIcon />;
      let tooltip =
        "A PT is overdue for this application and there is no corresponding ongoing project for this year.";

      if (!value) return;
      if (value === "No Overdue") {
        color = "success"; // Grey
        icon = <DoneIcon />;
        tooltip =
          "Either no PT is required, or the PT for this year has already been completed.";
      } else if (value === "Ongoing Project") {
        color = "warning"; // Grey
        icon = <SyncIcon />;
        tooltip =
          "A PT is overdue for this application but there is a corresponding ongoing project for this year.";
      }
      return (
        <Tooltip title={tooltip}>
          <Chip
            icon={icon}
            label={value}
            color={color}
            variant="outlined"
            sx={{ width: "150px" }}
          />
        </Tooltip>
      );
    };
  }
  if (
    [
      "general_tags",
      "inventory_tags",
      "classification_tags",
      "deployment_model_tags",
    ].includes(column.field)
  ) {
    return ({ value }: { value: string[] }) => {
      const result = summarize_list(value).map((item) => {
        return (
          <Chip key={item} label={item} color="primary" variant="outlined" />
        );
      });
      return (
        <Stack direction="row" spacing={1}>
          {result}
        </Stack>
      );
    };
  }
  if (column.field === "pentest_this_year") {
    return ({ value }: { value?: string }) => {
      const year = new Date(Date.now()).getFullYear();
      let tooltip = `In ${year}, no project is in status Planning, Scheduled, Running or Reporting.`;
      let color: ChipColorType = "default";

      if (value === "Scheduled") {
        tooltip = `In ${year}, there is at least one project in status Planning, Scheduled, Running or Reporting`;
        color = "primary";
      } else if (value === "Completed") {
        tooltip = `In ${year}, there is at least one project in status Completed.`;
        color = "success";
      }

      return (
        <Tooltip title={tooltip}>
          <Chip key={value} label={value} color={color} variant="outlined" />
        </Tooltip>
      );
    };
  }
  if (column.field === "periodicity_parameter") {
    return ({ value }: { value?: string }) => {
      return (
        value && (
          <Chip key={value} label={value} color="primary" variant="outlined" />
        )
      );
    };
  }
};

// Create function to obtain the correct value for a cell.
const valueGetter = (column: GridColDef) => {
  // The REST API returns an object containing the enum information. For the DataGrid, we have to extract the name attribute.
  if (
    [
      "state",
      "overdue",
      "in_scope",
      "pentest_this_year",
      "manual_pentest_periodicity",
      "periodicity_parameter",
    ].includes(column.field)
  ) {
    return ({ value }: { value: StateContentTypes }) => value?.label ?? "";
  }
  if (["owner", "manager"].includes(column.field)) {
    return ({ value }: { value: EntityLookup }) => value?.name ?? "";
  }
  if (
    [
      "general_tags",
      "inventory_tags",
      "classification_tags",
      "deployment_model_tags",
    ].includes(column.field)
  ) {
    return ({ value }: { value: TagLookup[] }) =>
      value?.map((item) => item?.name ?? "") ?? [];
  }
};

const ToolbarMenu = React.memo(
  (props: {
    model: GridRowSelectionModel;
    onClick: (type: ProjectType) => void;
  }) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
      setAnchorEl(null);
    };

    return (
      <>
        <IconButton
          aria-label="more"
          size="small"
          id="long-button"
          aria-controls={open ? "long-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-haspopup="true"
          onClick={handleClick}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          id="long-menu"
          MenuListProps={{
            "aria-labelledby": "long-button",
          }}
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
        >
          <MenuItemEntry
            key="create-penetration-test"
            onClick={() => {
              handleClose();
              props.onClick(ProjectType.Penetration_Test);
            }}
            title={`Create ${props.model.length} penetration test project${
              props.model.length > 1 ? "s" : ""
            }`}
            icon={BugReportIcon}
            shortcut=""
            disabled={props.model.length == 0}
            width={400}
          />
          <MenuItemEntry
            key="create-security-assessment"
            onClick={() => {
              handleClose();
              props.onClick(ProjectType.Security_Assessment);
            }}
            title={`Create ${props.model.length} security assessment project${
              props.model.length > 1 ? "s" : ""
            }`}
            icon={LockResetIcon}
            shortcut=""
            disabled={props.model.length == 0}
            width={400}
          />
        </Menu>
      </>
    );
  }
);

const dataGridActionSettings: DataGridActionSettingsType = {
  showDelete: false,
  showEdit: true,
  showView: true,
};

const Applications = React.memo(() => {
  const [rowSelectionModel, setRowSelectionModel] =
    React.useState<GridRowSelectionModel>([]);
  const {
    isLoadingAll,
    query,
    pageManagerContext,
    deletionMutation,
    confirmationDialogState,
    getDefaultDataGridActions,
    hasCreateAccess,
    handleCreateDataGridRecord,
  } = useLuminaCore({
    columnDefinition: COLUMN_DEFINITION,
    dataApiEndpoint: URL,
    dataGridActionSettings: dataGridActionSettings,
    dataQueryKey: queryKey,
    dataConvertFn: (data: any[]) => data.map((d) => new ObjectRead(d)),
    pageType: MainPages.Applications,
  });
  const { me } = pageManagerContext;
  const context = usePageManager({ columns: CREATE_PROJECTS_VALUES });
  const { showEditDialog } = context;

  const handleProjectCreationClick = React.useCallback(
    (type: ProjectType) => {
      const projectCreation = new ProjectCreation(
        rowSelectionModel,
        type,
        `${new Date().getFullYear() + 1}-01-01`
      );
      showEditDialog(
        `Creating ${rowSelectionModel.length} ${
          type === ProjectType.Penetration_Test
            ? "penetration test"
            : "security assessment"
        } project${rowSelectionModel.length > 1 ? "s" : ""}`,
        [],
        projectCreation
      );
    },
    [showEditDialog, rowSelectionModel]
  );

  const slots = React.useMemo(() => {
    // Load the default toolbar items.
    const toolbarItems = getDefaultGridToolbars({
      onNewButtonClick: handleCreateDataGridRecord,
      hasCreateAccess,
      newButtonName: "New",
    });
    if (me!.isAdmin() && rowSelectionModel.length > 0) {
      toolbarItems.push(
        <ToolbarMenu
          key="batch-creation-menu"
          model={rowSelectionModel}
          onClick={handleProjectCreationClick}
        />
      );
    }
    return {
      toolbar: () => (
        <GridToolbarContainer>{toolbarItems}</GridToolbarContainer>
      ),
    };
  }, [
    handleCreateDataGridRecord,
    handleProjectCreationClick,
    hasCreateAccess,
    rowSelectionModel,
    me,
  ]);
  const slotProps = React.useMemo(
    () => ({
      toolbar: {
        hasCreateAccess: hasCreateAccess,
        onNewButtonClick: handleCreateDataGridRecord,
      },
    }),
    [hasCreateAccess, handleCreateDataGridRecord]
  );

  if (query.isError) {
    return <Alert severity="error">Error loading data</Alert>;
  }

  return (
    <>
      <LoadingIndicator open={isLoadingAll} />
      <ConfirmationDialog {...confirmationDialogState} />
      {/*For each operation we maintain our own notification bar, which allows reseting the respective mutation status to its original state.*/}
      <UseMutationSnackbarAlert
        mutation={pageManagerContext.putMutation}
        successMessage="Application successfully updated."
      />
      <UseMutationSnackbarAlert
        mutation={pageManagerContext.postMutation}
        successMessage="Application successfully created."
      />
      <UseMutationSnackbarAlert
        mutation={deletionMutation}
        successMessage="Application successfully deleted."
      />
      <ApplicationDetailsDialog open={false} context={pageManagerContext} />
      <CreateProjectsDialog
        open={false}
        context={context}
        model={rowSelectionModel}
      />
      <MainPaper>
        <PagesDataGrid
          page={MainPages.Applications}
          user={me!}
          checkboxSelection={me!.isAdmin()}
          columns={COLUMN_DEFINITION}
          isLoading={query.isLoading}
          rows={query.data}
          getCellValueFn={valueGetter}
          renderCellFn={renderCell}
          getTableActions={getDefaultDataGridActions}
          slots={slots}
          slotProps={slotProps}
          onRowSelectionModelChange={(newRowSelectionModel) => {
            setRowSelectionModel(newRowSelectionModel);
          }}
          rowSelectionModel={rowSelectionModel}
        />
      </MainPaper>
      <RefreshProgress query={query} />
    </>
  );
});

export default Applications;
