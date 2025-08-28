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

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

export interface ConfirmationDialogType {
  // Defines whether the dialog should be displayed or not.
  open: boolean;
  // The title of the dialog.
  title: string;
  // The message of the dialog.
  message: string;
  // The function to be executed when the user cancels the dialog.
  onCancel: () => void;
  // Callback function to be executed when the user confirms the dialog.
  onConfirm: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogType> = (props) => {
  const handleConfirmation = () => {
    props.onConfirm();
    props.onCancel();
  };

  const handleCancel = () => {
    props.onCancel();
  };

  return (
    <Dialog
      open={props.open}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{props.title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {props.message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} autoFocus>
          No
        </Button>
        <Button onClick={handleConfirmation}>Yes</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
