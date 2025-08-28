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

import React, { SyntheticEvent } from "react";
import axios from "axios";
import {
  Box,
  Stack,
  Button,
  Dialog,
  Avatar,
  styled,
  Tooltip,
  Typography,
  ButtonBase,
  ToggleButton,
  DialogActions,
  DialogContent,
  FormControlLabel,
  ToggleButtonGroup,
  IconButton,
  Portal,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import DensityLargeIcon from "@mui/icons-material/DensityLarge";
import DensitySmallIcon from "@mui/icons-material/DensitySmall";
import DensityMediumIcon from "@mui/icons-material/DensityMedium";
import { Item } from "../DetailsDialog";
import {
  URL_USERS_ME_AVATAR,
  URL_USERS_ME_LIGHTMODE,
  URL_USERS_ME_TABLE_DENSITY,
  URL_USERS_ME_REPORT_LANGUAGE,
  queryKeyUserMe,
} from "../../../../models/user";
import { UserProfileDialogContext } from "../../../../util/hooks/useUserProfileDialog";
import { useQueryUserMe } from "../../../../util/hooks/tanstack/useQueryUserMe";
import { UseDataSubmissionReturn } from "../../../../util/hooks/useDataSubmission.ts";
import { SnackbarAlertv2 } from "../../../feedback/snackbar/SnackbarAlert";
import ReportLanguageSelect from "../../ReportLanguageSelect";
import { StateContentTypes } from "../../../../models/common";
import { MainPages } from "../../../../models/enums";

export const ItemBox = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

interface UserProfileDialogProps {
  context: UserProfileDialogContext;
  submission: UseDataSubmissionReturn;
}

const UserProfileDialog = React.memo((props: UserProfileDialogProps) => {
  const user = useQueryUserMe();
  const { context } = props;
  const tableDensity = user.data?.table_density;
  const lightMode = user.data?.lightMode ? "lightmode" : "darkmode";

  const handleModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: string
  ) => {
    if (newMode === null) return;
    props.submission.performSubmission({
      dataSubmissionFn: async () =>
        await axios.put(
          URL_USERS_ME_LIGHTMODE + "/" + (newMode === "lightmode").toString()
        ),
      queryKey: queryKeyUserMe,
    });
  };

  const handleTableDensityChange = (
    _event: React.MouseEvent<HTMLElement>,
    density: string
  ) => {
    if (density === null) return;
    props.submission.performSubmission({
      dataSubmissionFn: async () =>
        await axios.put(URL_USERS_ME_TABLE_DENSITY + "/" + density),
      queryKey: queryKeyUserMe,
    });
  };

  const handleReportLanguageChange = (
    _event: SyntheticEvent<Element, Event>,
    newValue: StateContentTypes
  ) => {
    // console.log("UserProfileDialog.handleReportLanguageChange", newValue);
    if (newValue === null) return;

    props.submission.performSubmission({
      dataSubmissionFn: async () =>
        await axios.put(URL_USERS_ME_REPORT_LANGUAGE + "/" + newValue.id),
      queryKey: queryKeyUserMe,
    });
  };

  const handleDeleteAvatar = () => {
    props.submission.performSubmission({
      dataSubmissionFn: async () =>
        await axios.put(URL_USERS_ME_AVATAR + "/reset"),
      queryKey: queryKeyUserMe,
    });
  };

  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      // Prepare the file for upload
      const formData = new FormData();
      formData.append("file", file);

      props.submission.performSubmission({
        dataSubmissionFn: async () =>
          await axios.put(URL_USERS_ME_AVATAR, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }),
        queryKey: queryKeyUserMe,
      });
    }
  };

  //console.log("UserProfileDialog", user.data);

  return (
    <Portal container={document.getElementById("dialog")}>
      <SnackbarAlertv2 context={props.submission} />
      <Dialog
        fullWidth={true}
        maxWidth="sm"
        open={context.open}
        onClose={context.handleClose}
      >
        <DialogContent>
          <Stack>
            <Item sx={{ mb: 3 }}>
              <Stack direction="row" spacing={2}>
                <ItemBox>
                  <ButtonBase
                    onClick={() =>
                      document.getElementById("file-input")?.click()
                    }
                  >
                    <Avatar
                      alt={user.data?.name ?? "User Profile"}
                      src={
                        user.data?.has_avatar ? URL_USERS_ME_AVATAR : undefined
                      }
                      sx={{ width: 150, height: 150 }}
                    />
                  </ButtonBase>
                  <input
                    accept="image/png"
                    style={{ display: "none" }}
                    id="file-input"
                    type="file"
                    onChange={handleFileChange}
                  />
                  {user.data?.has_avatar && (
                    <IconButton size="small" onClick={handleDeleteAvatar}>
                      <DeleteIcon />
                    </IconButton>
                  )}
                </ItemBox>
                <ItemBox>
                  <Typography variant="h4">
                    {user.data?.name ?? "User Profile"}
                  </Typography>
                </ItemBox>
              </Stack>
            </Item>
            <Item sx={{ mb: 2 }}>
              <FormControlLabel
                label="Mode"
                labelPlacement="bottom"
                sx={{ m: 0 }}
                control={
                  <ToggleButtonGroup
                    value={lightMode}
                    exclusive
                    size="small"
                    onChange={handleModeChange}
                    aria-label="mode"
                  >
                    <ToggleButton value="darkmode">
                      <Tooltip describeChild title="Switch to darkmode.">
                        <DarkModeIcon />
                      </Tooltip>
                    </ToggleButton>
                    <ToggleButton value="lightmode">
                      <Tooltip describeChild title="Switch to lightmode.">
                        <LightModeIcon />
                      </Tooltip>
                    </ToggleButton>
                  </ToggleButtonGroup>
                }
              />
              <FormControlLabel
                label="Table Density"
                labelPlacement="bottom"
                control={
                  <ToggleButtonGroup
                    value={tableDensity}
                    exclusive
                    size="small"
                    onChange={handleTableDensityChange}
                    aria-label="mode"
                  >
                    <ToggleButton
                      value="comfortable"
                      aria-label="density comportable"
                    >
                      <Tooltip
                        describeChild
                        title="Use table row density: Comportable"
                      >
                        <DensityLargeIcon />
                      </Tooltip>
                    </ToggleButton>
                    <ToggleButton
                      value="standard"
                      aria-label="density standard"
                    >
                      <Tooltip
                        describeChild
                        title="Use table row density: Standard"
                      >
                        <DensityMediumIcon />
                      </Tooltip>
                    </ToggleButton>
                    <ToggleButton value="compact" aria-label="density compact">
                      <Tooltip
                        describeChild
                        title="Use table row density: Compact"
                      >
                        <DensitySmallIcon />
                      </Tooltip>
                    </ToggleButton>
                  </ToggleButtonGroup>
                }
              />
            </Item>
            {user.data?.hasAccess(MainPages.ReportLanguages) &&
              user.data?.report_language && (
                <Item>
                  <ReportLanguageSelect
                    id="reportLanguage"
                    label="Report Language"
                    helperText="Select your prefered report language."
                    value={user.data?.report_language ?? []}
                    onChange={handleReportLanguageChange}
                  />
                </Item>
              )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={context.handleClose} autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Portal>
  );
});

export default UserProfileDialog;
