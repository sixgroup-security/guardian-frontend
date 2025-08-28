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
import { useTheme } from "@mui/material/styles";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  AppBar,
  Typography,
  Toolbar,
  CircularProgress,
  DialogProps,
  styled,
  Portal,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import { DetailsDialogMode } from "../../../models/enums";
import {
  IPageManagerState,
  UsePageManagerReturn,
} from "../../../util/hooks/usePageManager";
import PageManagerSnackbarAlert from "../../feedback/snackbar/PageManagerSnackbarAlert";

/*
 * This method returns whether the dialog shall be shown.
 */
const isOpen = (pageManager: IPageManagerState, open: boolean) => {
  return (pageManager?.mode ?? null) !== null || open;
};

/*
 * This method returns whether the dialog is in read-only mode.
 */
const isReadOnly = (pageManager: IPageManagerState) => {
  return pageManager?.mode === DetailsDialogMode.View;
};

/*
 * This method returns the title the Save button.
 */
const getSaveButtonTitle = (pageManager: IPageManagerState) => {
  switch (pageManager.mode) {
    case DetailsDialogMode.Create:
      return "Add";
    case DetailsDialogMode.Edit:
      return "Save";
    default:
      return "";
  }
};

/*
 * This method returns the prefix for the dialog's title.
 */
const getDialogTitle = (pageManager: IPageManagerState) => {
  switch (pageManager.mode) {
    case DetailsDialogMode.Edit:
      return "Edit: " + pageManager.dialogTitle;
    case DetailsDialogMode.View:
      return "View: " + pageManager.dialogTitle;
    default:
      return pageManager.dialogTitle;
  }
};

export interface DefaultDetailsDialogProps extends DialogProps {
  context: UsePageManagerReturn;
  isPending?: boolean;
  fullScreen?: boolean;
  // Additional buttons to be displayed in the dialog.
  buttons?: JSX.Element[];
  // Allows overwriting the default submit handler provided by the context object.
  onSubmit?: () => void;
  // Allows overwriting the default submit handler provided by the context object.
  onClose?: () => void;
}

// TODO: Migrate to DetailsDialog once all DetailsDialog usages are removed.
export const DetailsDialogv2: React.FC<DefaultDetailsDialogProps> = (props) => {
  const theme = useTheme();
  const {
    open,
    context,
    isPending,
    buttons,
    children,
    onSubmit,
    onClose,
    ...other
  } = props;
  const { pageManager } = context;
  const openDialog = isOpen(pageManager, open);
  const buttonTitle = React.useMemo(
    () => getSaveButtonTitle(pageManager),
    [pageManager]
  );
  const saveButton = React.useMemo(() => {
    if (
      pageManager.mode === DetailsDialogMode.Create ||
      pageManager.mode === DetailsDialogMode.Edit
    ) {
      return (
        <Button
          onClick={onSubmit ?? context.submitOnly}
          startIcon={<SaveIcon />}
        >
          {buttonTitle}
        </Button>
      );
    }
  }, [pageManager.mode, onSubmit, context.submitOnly, buttonTitle]);

  return (
    <Portal container={document.getElementById("dialog")}>
      <PageManagerSnackbarAlert pageManagerContext={context} />
      <Dialog open={openDialog} {...other}>
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={onClose ?? context.closeDialog}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              {getDialogTitle(pageManager)}
            </Typography>
            {isPending && (
              <CircularProgress
                style={{ color: theme.palette.primary.contrastText }}
              />
            )}
          </Toolbar>
        </AppBar>
        <DialogContent>{children}</DialogContent>
        <DialogActions>
          <Button
            onClick={onClose ?? context.closeDialog}
            startIcon={<CloseIcon />}
          >
            Close
          </Button>
          {saveButton}
          {/*isReadOnly(pageManager) === false && (
            <Button
              onClick={() => context.submitAndCloseDialog()}
              startIcon={<SaveIcon />}
            >
              {buttonTitle + " & Close"}
            </Button>
          )*/}
          {buttons}
          {/* TODO: Ask whether changes shall be discarted: https://mui.com/material-ui/react-dialog/#non-modal-dialog*/}
        </DialogActions>
      </Dialog>
    </Portal>
  );
};

export interface DetailsDialogProps extends DialogProps {
  pageManager: IPageManagerState;
  isPending?: boolean;
  fullScreen?: boolean;
  // Additional buttons to be displayed in the dialog.
  buttons?: JSX.Element[];
  onClose: () => void;
  onSubmit: () => void;
  // Used in the onSubmit function to determine whether a redirect to ../ should be performed. This should not be the case for sub-dialogs (e.g., TestGuideSectionDialog) that are opened within details dialogs and are using the same pagemanager.
  navigatable?: boolean;
}

export const Item = styled("div")(({ theme }) => ({
  padding: theme.spacing(1),
  width: "100%",
}));

const DetailsDialog: React.FC<DetailsDialogProps> = (props) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const {
    open,
    pageManager,
    isPending,
    buttons,
    onClose,
    onSubmit,
    children,
    ...other
  } = props;
  const openDialog = isOpen(pageManager, open);

  const handleClose = () => {
    if (id && (props.navigatable ?? true) == true) {
      navigate("../");
    }
    onClose();
  };

  const handleSubmit = () => {
    if (id && (props.navigatable ?? true) == true) {
      navigate("../");
    }
    onSubmit();
  };

  return (
    <Dialog open={openDialog} {...other}>
      <AppBar sx={{ position: "relative" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            {getDialogTitle(pageManager)}
          </Typography>
          {isPending && (
            <CircularProgress
              style={{ color: theme.palette.primary.contrastText }}
            />
          )}
        </Toolbar>
      </AppBar>
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <Button onClick={handleClose} startIcon={<CloseIcon />}>
          Close
        </Button>
        {isReadOnly(pageManager) === false && (
          <Button onClick={handleSubmit} startIcon={<SaveIcon />}>
            {getSaveButtonTitle(pageManager)}
          </Button>
        )}
        {buttons}
        {/* TODO: Ask whether changes shall be discarted: https://mui.com/material-ui/react-dialog/#non-modal-dialog*/}
      </DialogActions>
    </Dialog>
  );
};

export default DetailsDialog;
