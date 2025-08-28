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
import MenuItem from "./MenuItem";
import Divider from "@mui/material/Divider";
import ListSubheader from "@mui/material/ListSubheader";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import GridViewIcon from "@mui/icons-material/GridView";
import PeopleIcon from "@mui/icons-material/People";
import MediationIcon from "@mui/icons-material/Mediation";
import EngineeringIcon from "@mui/icons-material/Engineering";
import ChecklistIcon from "@mui/icons-material/Checklist";
import LanguageIcon from "@mui/icons-material/Language";
import BugReportIcon from "@mui/icons-material/BugReport";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import AutoAwesomeMotionIcon from "@mui/icons-material/AutoAwesomeMotion";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import EmojiNatureIcon from "@mui/icons-material/EmojiNature";
import { User } from "../models/user";
import { MainPages } from "../models/enums";
import { CUSTOMER_TITLE_NAME } from "../util/consts/common";
import { Tooltip } from "@mui/material";

const hasAccess = (me: User, page: MainPages) => me.hasAccess(page) ?? false;
const getMenuItem = (
  title: string,
  path: string,
  icon: React.ReactElement<any, any>
) => (
  <MenuItem
    to={title}
    key={title}
    primary={path}
    icon={
      <Tooltip title={title} placement="right">
        {icon}
      </Tooltip>
    }
  />
);

const SidebarItems: React.FC<{ open: boolean; me: User }> = (props) => {
  const { me } = props;

  const mainSection = React.useMemo(() => {
    const result: JSX.Element[] = [];
    if (hasAccess(me, MainPages.Dashboard)) {
      result.push(getMenuItem("Dashboard", "/", <DashboardIcon />));
    }
    if (hasAccess(me, MainPages.Calendar)) {
      result.push(getMenuItem("Calendar", "/calendar", <CalendarMonthIcon />));
    }
    return result;
  }, [me]);

  const managementSection = React.useMemo(() => {
    const result: JSX.Element[] = [];
    if (hasAccess(me, MainPages.Projects)) {
      result.push(getMenuItem("Projects", "/projects", <GridViewIcon />));
    }
    if (hasAccess(me, MainPages.Applications)) {
      result.push(
        getMenuItem("Applications", "/applications", <InventoryIcon />)
      );
    }
    return result;
  }, [me]);

  const penTestSection = React.useMemo(() => {
    const result: JSX.Element[] = [];
    if (hasAccess(me, MainPages.BugCrowdVrt)) {
      result.push(
        getMenuItem("Classifications", "/classifications", <EmojiNatureIcon />)
      );
    }
    if (hasAccess(me, MainPages.Measures)) {
      result.push(getMenuItem("Measures", "/measures", <EngineeringIcon />));
    }
    if (hasAccess(me, MainPages.ReportTemplates)) {
      result.push(
        getMenuItem("Report Templates", "/templates/pentest", <MediationIcon />)
      );
    }
    if (hasAccess(me, MainPages.TestGuide)) {
      result.push(
        getMenuItem(
          "Playbooks",
          "/playbooks/pentest",
          <AutoAwesomeMotionIcon />
        )
      );
    }
    if (hasAccess(me, MainPages.TestProcedures)) {
      result.push(getMenuItem("Procedures", "/procedures", <ChecklistIcon />));
    }
    if (hasAccess(me, MainPages.VulnerabilityTemplates)) {
      result.push(
        getMenuItem("Vulnerabilities", "/vulnerabilities", <BugReportIcon />)
      );
    }
    return result;
  }, [me]);

  const redTeamSection = React.useMemo(() => {
    const result: JSX.Element[] = [];
    return result;
  }, [me]);

  const adminSection = React.useMemo(() => {
    const result: JSX.Element[] = [];
    if (hasAccess(me, MainPages.Customers)) {
      result.push(
        getMenuItem(
          `${CUSTOMER_TITLE_NAME}s`,
          "/customers",
          <AccountBalanceIcon />
        )
      );
    }
    if (hasAccess(me, MainPages.Providers)) {
      result.push(getMenuItem("Providers", "/providers", <SupportAgentIcon />));
    }
    if (hasAccess(me, MainPages.ReportLanguages)) {
      result.push(
        getMenuItem("Report Languages", "/languages", <LanguageIcon />)
      );
    }
    if (hasAccess(me, MainPages.Users)) {
      result.push(getMenuItem("Users", "/users", <PeopleIcon />));
    }
    if (hasAccess(me, MainPages.AccessTokens)) {
      result.push(getMenuItem("Access Tokens", "/tokens", <VpnKeyIcon />));
    }
    return result;
  }, [me]);

  return (
    <>
      {mainSection}
      {mainSection.length > 0 && <Divider sx={{ my: 1 }} />}
      {managementSection.length > 0 && (
        <>
          {props.open && (
            <ListSubheader component="div" inset>
              Managing
            </ListSubheader>
          )}
          {managementSection}
        </>
      )}
      {penTestSection.length > 0 && (
        <>
          <Divider sx={{ my: 1 }} />
          {props.open && (
            <ListSubheader component="div" inset>
              Penetration Testing
            </ListSubheader>
          )}
          {penTestSection}
        </>
      )}
      {redTeamSection.length > 0 && (
        <>
          <Divider sx={{ my: 1 }} />
          {props.open && (
            <ListSubheader component="div" inset>
              Purple/Red Teaming
            </ListSubheader>
          )}
          {redTeamSection}
        </>
      )}
      {adminSection.length > 0 && (
        <>
          <Divider sx={{ my: 1 }} />
          {props.open && (
            <ListSubheader component="div" inset>
              General Settings
            </ListSubheader>
          )}
          {adminSection}
        </>
      )}
    </>
  );
};

export default SidebarItems;
