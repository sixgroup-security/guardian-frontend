import axios from "axios";
import {
  Box,
  Card,
  Menu,
  Badge,
  AppBar,
  Switch,
  Toolbar,
  FormGroup,
  ListItem,
  Typography,
  CardHeader,
  IconButton,
  CardContent,
  FormControlLabel,
  List,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import NotificationsIcon from "@mui/icons-material/Notifications";
import {
  queryKeyUserMeNotifications,
  URL_ME_NOTIFICATIONS,
  Notification,
} from "../../../models/user";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useQuery } from "../../../util/hooks/tanstack/useQuery";
import React from "react";
import MarkdownField from "../../inputs/MarkdownField";
import { useDataSubmission } from "../../../util/hooks/useDataSubmission";
import { useConfirmationDialog } from "../../../util/hooks/useConfirmationDialog";
import ConfirmationDialog from "../../feedback/ConfirmationDialog";

interface NotificationsListProps {
  isAuthenticated?: boolean;
}

const NotificationsList = (props: NotificationsListProps) => {
  const theme = useTheme();
  const submit = useDataSubmission();

  const [unreadOnly, setUnreadOnly] = React.useState(true);
  const lightMode = theme.palette.mode === "light";
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  // We obtain the user's notifications.
  const query = useQuery({
    path: URL_ME_NOTIFICATIONS,
    queryKey: queryKeyUserMeNotifications,
    enabled: props.isAuthenticated === true,
    convertFn: (data: any[]) => data.map((x) => new Notification(x)),
    refetchOnWindowFocus: false,
  });
  const confirmationContext = useConfirmationDialog({
    title: "Delete notification ...",
    message: "Are you sure you want to permanently delete this notification?",
  });

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const onDelete = React.useCallback(
    (notification: Notification) => {
      confirmationContext.showDialog(async () => {
        // Here we update the backend
        await submit.performSubmission({
          dataSubmissionFn: async () =>
            await axios.delete(URL_ME_NOTIFICATIONS + "/" + notification.id),
          queryKey: queryKeyUserMeNotifications,
        });
      });
    },
    [confirmationContext, submit]
  );
  const onToggle = React.useCallback(
    async (notification: Notification) => {
      await submit.performSubmission({
        dataSubmissionFn: async () =>
          await axios.put(
            URL_ME_NOTIFICATIONS + "/" + notification.id + "/toggle-read"
          ),
        queryKey: queryKeyUserMeNotifications,
      });
    },
    [submit]
  );

  const notifications = React.useMemo(
    () =>
      (query.data as Notification[])
        ?.filter((x) => (unreadOnly && !x.read) || !unreadOnly)
        .map((notification: Notification) => {
          const createdAt = new Intl.DateTimeFormat(navigator.language, {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          }).format(notification.date);

          return (
            <ListItem key={notification.id}>
              <Card sx={{ maxWidth: 400 }} variant="outlined">
                <CardHeader
                  title={notification.name}
                  subheader={createdAt}
                  titleTypographyProps={{ variant: "subtitle1" }}
                  subheaderTypographyProps={{ variant: "subtitle2" }}
                  sx={{ pb: 0 }}
                  action={
                    <>
                      <Tooltip
                        title={
                          notification.read ? "Mark as unread" : "Mark as read"
                        }
                      >
                        <IconButton
                          aria-label={
                            notification.read ? "mark unread" : "mark read"
                          }
                          onClick={() => onToggle(notification)}
                        >
                          <CheckCircleIcon
                            color={notification.read ? undefined : "success"}
                          />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete item">
                        <IconButton
                          aria-label="delete"
                          onClick={() => onDelete(notification)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  }
                />
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    <MarkdownField content={notification.message} />
                  </Typography>
                </CardContent>
              </Card>
            </ListItem>
          );
        }) ?? [],
    [query.data, unreadOnly]
  );

  if (!query.isSuccess) {
    return;
  }

  return (
    <>
      <ConfirmationDialog {...confirmationContext} />
      <IconButton
        size="large"
        aria-label="account of current user"
        aria-controls="menu-notificationbar"
        aria-haspopup="true"
        onClick={handleMenu}
        color="inherit"
      >
        <Badge
          badgeContent={
            (query.data as Notification[]).filter((x) => !x.read).length
          }
          color="error"
        >
          <NotificationsIcon
            color="action"
            sx={{
              color: lightMode
                ? theme.palette.primary.contrastText
                : theme.palette.text.primary,
            }}
          />
        </Badge>
      </IconButton>
      <Menu
        id="menu-notificationbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        sx={{
          display: "flex",
          flexDirection: "column",
          pt: 0,
        }}
        disableScrollLock={true}
        MenuListProps={{ sx: { padding: 0 } }}
      >
        <AppBar position="static" sx={{ minWidth: "432px" }}>
          <Toolbar>
            <Typography variant="h5">Notifications</Typography>
            <Box sx={{ flexGrow: 1 }} />
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    defaultChecked
                    size="small"
                    color="success"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setUnreadOnly(() => event.target.checked);
                    }}
                  />
                }
                label={unreadOnly ? "Unread only" : "Show all"}
                slotProps={{ typography: { variant: "caption" } }}
                sx={{ width: "70px" }}
                labelPlacement="bottom"
              />
            </FormGroup>
          </Toolbar>
        </AppBar>
        <Box sx={{ height: "70vh", overflowY: "auto" }}>
          <List>{notifications}</List>
        </Box>
      </Menu>
    </>
  );
};

export default NotificationsList;
