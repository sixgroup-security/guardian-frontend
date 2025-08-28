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

import { TabPanel } from "@mui/lab";
import { Tab } from "@mui/material";
import React from "react";
import MitreCwe from "./MitreCwe";
import BugCrowdVrt from "./BugCrowdVrt";
import TabbedPane from "../../components/navigation/TabbedPane";
import MainPaper from "../../layout/MainPaper";

const Overview = React.memo(() => {
  const tabTitles = React.useMemo(
    () => [
      <Tab id={"vrt"} key={"vrt"} label={"VRT"} value={"0"} />,
      <Tab id={"cwe"} key={"cwe"} label={"CWE"} value={"1"} />,
    ],
    []
  );

  const tabContents = React.useMemo(
    () => [
      <TabPanel
        id={"vrt"}
        key={"vrt"}
        value={"0"}
        sx={{ p: 1, height: "calc(100% - 48px)" }}
      >
        <BugCrowdVrt />
      </TabPanel>,
      <TabPanel
        id={"cwe"}
        key={"cwe"}
        value={"1"}
        sx={{ p: 1, height: "calc(100% - 48px)" }}
      >
        <MitreCwe />
      </TabPanel>,
    ],
    []
  );

  return (
    <MainPaper>
      <TabbedPane
        sx={{
          height: "100%",
        }}
        tabTitles={tabTitles}
        tabContents={tabContents}
      />
    </MainPaper>
  );
});

export default Overview;
