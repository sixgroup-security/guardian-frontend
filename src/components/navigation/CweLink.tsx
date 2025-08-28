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

import { Tooltip } from "@mui/material";
import { Link } from "@mui/material";
import React from "react";
import { CweLookup } from "../../models/tagging/mitreCwe";
import { CWE_DEFINITIONS_URL } from "../../util/consts/common";

const CweLink = React.memo(({ value }: { value?: CweLookup }) => {
  if (!value) return;
  return (
    <Tooltip title={value.label}>
      <Link
        href={`${CWE_DEFINITIONS_URL}/${value.cwe_id}.html`}
        target="_blank"
        rel="noreferrer"
      >
        {`CWE-${value.cwe_id}`}
      </Link>
    </Tooltip>
  );
});

export default CweLink;
