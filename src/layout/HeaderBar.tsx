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
import {
  Toolbar,
  Typography,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Theme,
  Portal,
  ButtonBase,
  SelectChangeEvent,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import MuiAppBar from "@mui/material/AppBar";
import { styled } from "@mui/material/styles";
import { drawerWidth, SidebarProps } from "./Sidebar";
import Select from "../components/inputs/Select.js";
import { URL_LOGOUT } from "../util/consts/auth.ts";
import { APP_NAME } from "../util/consts/common";
import { useUserProfileDialog } from "../util/hooks/useUserProfileDialog.ts";
import UserProfileDialog from "../components/inputs/dialogs/user/UserProfileDialog.tsx";
import {
  URL_USERS_ME_AVATAR,
  URL_USERS_ME_SELECTED_YEAR,
  User,
  queryKeyUserMe,
} from "../models/user";
import { UseDataSubmissionReturn } from "../util/hooks/useDataSubmission.ts";
import axios from "axios";
import { queryKeyProjects } from "../models/project.ts";
import NotificationsList from "../components/data/comment/NotificationsList.tsx";

interface HeaderBarProps extends SidebarProps {
  submit: UseDataSubmissionReturn;
  years: string[];
  user: User;
  toggleDrawer: () => void;
}

export const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})((props: { open: boolean; theme: Theme }) => ({
  zIndex: props.theme.zIndex.drawer + 1,
  transition: props.theme.transitions.create(["width", "margin"], {
    easing: props.theme.transitions.easing.sharp,
    duration: props.theme.transitions.duration.leavingScreen,
  }),
  ...(props.open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: props.theme.transitions.create(["width", "margin"], {
      easing: props.theme.transitions.easing.sharp,
      duration: props.theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const menuId = "primary-search-account-menu";

const HeaderBar = React.memo((props: HeaderBarProps) => {
  const theme = useTheme();
  const userProfileContext = useUserProfileDialog();
  const lightMode = theme.palette.mode === "light";
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const isMenuOpen = Boolean(anchorEl);
  const years = props.years ?? [];
  const { submit } = props;

  const handleYearSelect = React.useCallback(
    (event: SelectChangeEvent<any>) => {
      submit.performSubmission({
        dataSubmissionFn: async () =>
          await axios.put(
            URL_USERS_ME_SELECTED_YEAR + "/" + event.target.value
          ),
        // We need to ensure the User object is reloaded to contain the selected year.
        queryKey: queryKeyUserMe,
        // We need to reload all data that depends on the year selection.
        additionalQueryKeys: [queryKeyProjects],
      });
    },
    [submit]
  );

  const handleProfileMenuOpen = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    },
    []
  );

  const openProfileDialogHandler = React.useCallback(() => {
    closeProfileDialog();
    userProfileContext.handleOpen();
  }, []);

  const closeProfileDialog = React.useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleLogout = React.useCallback(() => {
    document.location.href = URL_LOGOUT;
  }, []);

  const renderMenu = React.useMemo(
    () => (
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        id={menuId}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={isMenuOpen}
        onClose={closeProfileDialog}
      >
        <MenuItem onClick={openProfileDialogHandler}>Profile</MenuItem>
        <MenuItem onClick={handleLogout}>Sign out</MenuItem>
      </Menu>
    ),
    [
      anchorEl,
      isMenuOpen,
      closeProfileDialog,
      openProfileDialogHandler,
      handleLogout,
    ]
  );

  return (
    <>
      {userProfileContext.open && (
        <Portal container={document.body}>
          <UserProfileDialog context={userProfileContext} submission={submit} />
        </Portal>
      )}
      <AppBar position="absolute" open={props.open} theme={theme}>
        <Toolbar
          sx={{
            pr: "24px", // keep right padding when drawer closed
          }}
        >
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={props.toggleDrawer}
            sx={{
              marginRight: "36px",
              ...(props.open && { display: "none" }),
            }}
          >
            <MenuIcon />
          </IconButton>

          <Avatar
            alt="Guardian logo"
            sx={{ width: 70, height: 70, ml: 1, mr: 1 }}
            src="/logo-plain.jpeg"
          />
          <Typography
            component="h1"
            variant="h5"
            color="inherit"
            noWrap
            sx={{ flexGrow: 1 }}
          >
            {APP_NAME}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            <Select
              id="headerbar-year-select"
              label="Year"
              size="small"
              sxFormControl={{ mt: 1, minWidth: 80 }}
              sxInputLabel={{
                color: lightMode
                  ? theme.palette.primary.contrastText
                  : theme.palette.text.primary,
                "&.Mui-focused": {
                  color: lightMode
                    ? theme.palette.primary.contrastText
                    : theme.palette.text.primary,
                },
              }}
              sx={{
                color: lightMode
                  ? theme.palette.primary.contrastText
                  : theme.palette.text.primary,
                ".MuiOutlinedInput-notchedOutline": { border: 0 },
                ".Mui-focused": { border: 10 },
                ".MuiSelect-icon": {
                  color: lightMode
                    ? theme.palette.primary.contrastText
                    : theme.palette.text.primary,
                },
                textAlign: "center",
              }}
              value={props.user.selected_year ?? "All"}
              onChange={handleYearSelect}
            >
              {years.map((year, index) => (
                <MenuItem key={index} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
            <NotificationsList isAuthenticated={props.user !== undefined} />
            <ButtonBase
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              sx={{ ml: 2 }}
            >
              <Avatar
                alt={props.user.name ?? "User Profile"}
                src={props.user.has_avatar ? URL_USERS_ME_AVATAR : undefined}
              />
            </ButtonBase>
          </Box>
          {renderMenu}
        </Toolbar>
      </AppBar>
    </>
  );
});

export default HeaderBar;
