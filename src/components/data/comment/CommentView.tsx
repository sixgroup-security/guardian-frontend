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
import {
  Stack,
  Box,
  Avatar,
  Card,
  CardHeader,
  IconButton,
  CardContent,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Comment, CommentUpdate } from "../../../models/comment";
import { styled } from "@mui/material/styles";
import { User } from "../../../models/user";
import EditComment from "./EditComment";
import {
  onSubmitHandler,
  usePageManager,
} from "../../../util/hooks/usePageManager";
import { COLUMN_DEFINITION } from "../../../models/comment";
import { QueryKey } from "@tanstack/react-query";
import MarkdownField from "../../inputs/MarkdownField";
import {
  useDataSubmission,
  UseDataSubmissionReturn,
} from "../../../util/hooks/useDataSubmission";
import { SnackbarAlertv2 } from "../../feedback/snackbar/SnackbarAlert";
import {
  useConfirmationDialog,
  UseConfirmationDialogReturn,
} from "../../../util/hooks/useConfirmationDialog";
import ConfirmationDialog from "../../feedback/ConfirmationDialog";

const Item = styled("div")(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1),
  flexGrow: 1,
}));

interface CommentBaseProps {
  // Default is true
  readonly?: boolean;
  currentUser?: User;
  // Base URL for updating and deleting a comment
  apiEndpoint?: string;
  // Query Key for updating and deleting a comment
  queryKey?: QueryKey;
}

interface CommentDetailsProps extends CommentBaseProps {
  comment: Comment;
  submit: UseDataSubmissionReturn;
  confirmationContext: UseConfirmationDialogReturn;
}

interface CommentViewProps extends CommentBaseProps {
  comments: Comment[];
}

const CommentDetails = (props: CommentDetailsProps) => {
  const {
    comment,
    currentUser,
    confirmationContext,
    submit,
    queryKey,
    apiEndpoint,
  } = props;
  const currentUserSid = React.useMemo(
    () => currentUser?.id ?? "",
    [currentUser]
  );
  const readonly = React.useMemo(
    () => props.readonly ?? true,
    [props.readonly]
  );
  const url = React.useMemo(
    () => (apiEndpoint ? apiEndpoint + "/" + comment.id : undefined),
    [apiEndpoint, comment.id]
  );
  const formattedDate = React.useMemo(
    () =>
      new Intl.DateTimeFormat(navigator.language, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).format(comment.createdAt),
    [comment.createdAt]
  );
  // Required to delete or edit the comment
  const context = usePageManager({
    columns: COLUMN_DEFINITION,
  });
  const { showEditDialog } = context;

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const onEditHandler = React.useCallback(() => {
    showEditDialog("", [], new CommentUpdate(comment));
  }, [showEditDialog, comment]);

  const onDeleteHander = React.useCallback(() => {
    confirmationContext.showDialog(async () => {
      if (url) {
        // Here we update the backend
        await submit.performSubmission({
          dataSubmissionFn: async () => await axios.delete(url),
          queryKey: queryKey,
        });
      }
    });
  }, [url, queryKey, submit, confirmationContext]);

  const onSubmit = React.useCallback(async () => {
    const ok = onSubmitHandler({
      pageManager: context.pageManager,
      dispatchPageManager: context.dispatchPageManager, // We do not submit a post or put mutation object because we only want input validation
    });

    if (ok && apiEndpoint) {
      try {
        const content = context.pageManager.content as any;
        // Here we update the backend
        await submit.performSubmission({
          dataSubmissionFn: async () =>
            await axios.put(apiEndpoint, content, {
              headers: {
                "Content-Type": "application/json",
              },
            }),
          queryKey: queryKey,
          throwException: true,
        });
        context.closeDialog();
      } catch (ex) {
        console.error(ex);
      }
    }
  }, [apiEndpoint, context, queryKey, submit]);
  return (
    <>
      {comment && props.queryKey && (
        <EditComment context={context} comment={comment} onSubmit={onSubmit} />
      )}
      <Card>
        <CardHeader
          avatar={<Avatar>{comment.user.label?.[0] ?? ""}</Avatar>}
          action={
            readonly === false &&
            apiEndpoint &&
            currentUserSid === comment.user.id ? (
              <IconButton
                onClick={handleClick}
                size="small"
                sx={{ ml: 2 }}
                aria-controls={open ? "account-menu" : undefined}
                aria-haspopup="true"
                aria-label="settings"
                aria-expanded={open ? "true" : undefined}
              >
                <MoreVertIcon />
              </IconButton>
            ) : undefined
          }
          title={comment.user.label}
          subheader={formattedDate}
        />
        <CardContent>
          <MarkdownField content={comment.comment} />
        </CardContent>
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem
            onClick={() => {
              handleClose();
              onEditHandler();
            }}
          >
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            Edit
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              handleClose();
              onDeleteHander();
            }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            Delete
          </MenuItem>
        </Menu>
      </Card>
    </>
  );
};

const CommentView = React.memo((props: CommentViewProps) => {
  const { comments, currentUser, readonly, apiEndpoint, queryKey } = props;
  const submit = useDataSubmission();
  const confirmationContext = useConfirmationDialog({
    title: "Delete comment ...",
    message: "Are you sure you want to permanently delete this comment?",
  });
  const content = React.useMemo(
    () =>
      Array.isArray(comments)
        ? comments.map((item: any) => (
            <Item key={item.id} sx={{ width: "100%", m: 0, p: 0, pb: 2 }}>
              <CommentDetails
                comment={item}
                submit={submit}
                confirmationContext={confirmationContext}
                currentUser={currentUser}
                apiEndpoint={apiEndpoint}
                queryKey={queryKey}
                readonly={readonly}
              />
            </Item>
          ))
        : [],
    [
      comments,
      currentUser,
      readonly,
      apiEndpoint,
      confirmationContext,
      submit,
      queryKey,
    ]
  );

  return (
    <>
      <SnackbarAlertv2 context={submit} />
      <ConfirmationDialog {...confirmationContext} />
      <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
        <Stack direction="row" useFlexGap flexWrap="wrap">
          {content}
        </Stack>
      </Box>
    </>
  );
});

export default CommentView;
