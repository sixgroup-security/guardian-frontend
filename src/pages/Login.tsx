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

import FingerprintIcon from "@mui/icons-material/Fingerprint";
import { Button, Paper, Box, Alert } from "@mui/material";
import { useLocation } from "react-router-dom";
import Stack from "@mui/material/Stack";
import { URL_LOGIN } from "../util/consts/auth.ts";
import Avatar from "@mui/material/Avatar";

const Login = () => {
  const location = useLocation();
  const message = new URLSearchParams(location.search).get("msg");
  const clickLoginHandler = () => {
    document.location.href = URL_LOGIN;
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        minWidth="100vh"
      >
        <Paper
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
            width: "300px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Stack
            spacing={4}
            sx={{
              alignItems: "center",
            }}
          >
            <Avatar
              alt="Guardian logo"
              sx={{ width: 180, height: 180 }}
              src="/logo.jpeg"
            />

            <Button
              variant="contained"
              onClick={clickLoginHandler}
              sx={{ width: "150px" }}
            >
              <FingerprintIcon style={{ marginRight: "8px" }} />
              Login
            </Button>
            {message && <Alert severity="error">{message}</Alert>}
          </Stack>
        </Paper>
      </Box>
    </>
  );
};

export default Login;
