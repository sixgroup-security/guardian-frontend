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

import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  AppBar,
  Typography,
  Toolbar,
  Avatar,
  Card,
  CardHeader,
  CardContent,
} from "@mui/material";
import { UsePageManagerReturn } from "../../../util/hooks/usePageManager";
import CloseIcon from "@mui/icons-material/Close";
import React from "react";
import { Comment } from "../../../models/comment";
import { DetailsDialogMode } from "../../../models/enums";
import SaveIcon from "@mui/icons-material/Save";
import { InputControlFieldWrapperv2 } from "../../inputs/InputControlWrapper";

interface EditCommentProps {
  context: UsePageManagerReturn;
  comment: Comment;
  onSubmit: () => void;
}

const EditComment = React.memo((props: EditCommentProps) => {
  const { context, comment, onSubmit } = props;
  const { pageManager, closeDialog } = context;
  const formattedDate = new Intl.DateTimeFormat(navigator.language, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(comment.createdAt);
  return (
    <Dialog
      open={pageManager.mode == DetailsDialogMode.Edit}
      disableEscapeKeyDown
      maxWidth="md"
      fullWidth
    >
      <AppBar sx={{ position: "relative" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={closeDialog}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Edit comment ...
          </Typography>
        </Toolbar>
      </AppBar>
      <DialogContent>
        <Card>
          <CardHeader
            avatar={<Avatar>{comment.user.label?.[0] ?? ""}</Avatar>}
            title={comment.user.label}
            subheader={formattedDate}
          />
          <CardContent>
            <InputControlFieldWrapperv2
              id="comment"
              context={context}
              multiline
              minRows={4}
              maxRows={4}
            />
          </CardContent>
        </Card>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} startIcon={<CloseIcon />}>
          Close
        </Button>
        <Button onClick={onSubmit} startIcon={<SaveIcon />}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default EditComment;
