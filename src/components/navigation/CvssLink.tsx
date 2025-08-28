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
import { CVSS_CALCULATOR_URL } from "../../util/consts/common";
import { Link } from "@mui/material";

interface CvssLinkProps {
  vector: string;
  target?: React.HTMLAttributeAnchorTarget | undefined;
  rel: string;
}

const CvssLink = React.memo(({ vector, target, rel }: CvssLinkProps) => {
  return (
    <Link href={`${CVSS_CALCULATOR_URL}#${vector}`} target={target} rel={rel}>
      {vector}
    </Link>
  );
});

export default CvssLink;
