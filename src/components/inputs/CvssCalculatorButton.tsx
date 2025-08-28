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
import { Tooltip, Button } from "@mui/material";
import CalculateIcon from "@mui/icons-material/Calculate";
import { CVSS_CALCULATOR_URL } from "../../util/consts/common";

const CvssCalculatorButton = React.memo((props: { cvss_vector?: string }) => {
  const url = React.useMemo(() => {
    if (props.cvss_vector) {
      return `${CVSS_CALCULATOR_URL}#${props.cvss_vector}`;
    }
    return CVSS_CALCULATOR_URL;
  }, [props.cvss_vector]);
  return (
    <Tooltip title="Open CVSS calculator">
      <Button
        size="large"
        variant="outlined"
        sx={{ height: "55px", width: "100%", fontSize: ".8rem" }}
        startIcon={<CalculateIcon />}
        onClick={() => window.open(url, "_blank")}
      >
        Open
      </Button>
    </Tooltip>
  );
});

export default CvssCalculatorButton;
