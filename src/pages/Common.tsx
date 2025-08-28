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

import { Chip, Stack, Tooltip } from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import DoneIcon from "@mui/icons-material/Done";
import CancelIcon from "@mui/icons-material/Cancel";
import WatchLaterIcon from "@mui/icons-material/WatchLater";
import HelpIcon from "@mui/icons-material/Help";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EditIcon from "@mui/icons-material/Edit";
import SyncIcon from "@mui/icons-material/Sync";
import { UserLookup } from "../models/user";
import { EntityLookup } from "../models/entity/entity";
import { ApplicationLookup } from "../models/application/application";
import { TagLookup } from "../models/tagging/tag";
import { CountryLookup } from "../models/country";
import { URL_COUNTRIES_FLAG } from "../models/reportLanguage";
import { ChipColorType } from "../models/common";
import { ratingColors } from "../layout/theme";
import {
  AutoCompleteEnumType,
  getSeverityValue,
  SeverityType,
} from "../models/enums";
import { MeasureLookup } from "../models/measure";
import { SHOW_MAX_TABLE_COLUMN_ITEMS } from "../util/consts/common";
import { CweLookup } from "../models/tagging/mitreCwe";
import { VrtLookup } from "../models/tagging/bugcrowdVrt";
import CvssLink from "../components/navigation/CvssLink";
import CweLink from "../components/navigation/CweLink";
import { InventoryLink } from "./Applications";

export const summarize_list = (value: string[]) => {
  const values = value?.slice(0, SHOW_MAX_TABLE_COLUMN_ITEMS) ?? [];
  if (value?.length > SHOW_MAX_TABLE_COLUMN_ITEMS) {
    values.push(`+${value.length - SHOW_MAX_TABLE_COLUMN_ITEMS}`);
  }
  return values;
};

/*
 *This function is used by the DataGrid component to custom-render cells.
 */
export const renderCellTestProcedures = (column: GridColDef) => {
  if (["project_types", "general_tags"].includes(column.field)) {
    return ({ value }: { value: string[] }) => {
      return renderDataGridCellTags(value);
    };
  }
};

export const valueGetterTestProcedures = (column: GridColDef) => {
  if (column.field === "general_tags") {
    return ({ value }: { value: TagLookup[] }) => {
      return value?.map((item) => item?.name) ?? [];
    };
  }
};

/*
 *This function is used by the DataGrid component to custom-render cells.
 */
export const renderCellVulnerabilityTemplate = (column: GridColDef) => {
  if (column.field === "general_tags") {
    return ({ value }: { value: string[] }) => {
      return renderDataGridCellTags(value);
    };
  } else if (column.field === "vrt") {
    return ({ value }: { value: string }) => {
      return renderDataGridCellTag(value);
    };
  } else if (column.field === "cwe_weakness") {
    return (props: GridRenderCellParams<any, CweLookup[]>) => {
      const value = props.row[column.field];
      return value && <CweLink value={value} />;
    };
  }
};

export const valueGetterVulnerabilityTemplate = (column: GridColDef) => {
  if (column.field === "measures") {
    return ({ value }: { value: MeasureLookup[] }) =>
      value?.map((item) => item.name);
  } else if (column.field === "general_tags") {
    return ({ value }: { value: TagLookup[] }) => {
      return value?.map((item) => item?.name) ?? [];
    };
  } else if (column.field === "vrt") {
    return ({ value }: { value: VrtLookup }) => {
      return value?.label;
    };
  } else if (column.field === "cwe_weakness") {
    return (props: GridRenderCellParams<any, CweLookup>) =>
      props.value?.label ?? "";
  }
};

/*
 *This function is used by the DataGrid component to custom-render cells.
 */
export const renderCellBugCrowdVrt = (column: GridColDef) => {
  if (column.field === "priority_str") {
    let color: any = null;
    let toolTipText: string;
    const chipWidth = "70px";
    return ({ value }: { value: string }) => {
      switch (value) {
        case "P1":
          toolTipText = "Critical";
          color = ratingColors[SeverityType.Critical];
          break;
        case "P2":
          toolTipText = "High";
          color = ratingColors[SeverityType.High];
          break;
        case "P3":
          toolTipText = "Medium";
          color = ratingColors[SeverityType.Medium];
          break;
        case "P4":
          toolTipText = "Low";
          color = ratingColors[SeverityType.Low];
          break;
        case "P5":
          toolTipText = "Informal";
          color = ratingColors[SeverityType.Info];
          break;
        case "Varies":
          color = null;
          break;
      }
      return color ? (
        <Tooltip title={toolTipText} arrow>
          <Chip
            label={value}
            variant="outlined"
            sx={{
              width: chipWidth,
              border: `1px solid ${color}`,
            }}
          />
        </Tooltip>
      ) : (
        value
      );
    };
  } else if (column.field === "cvss_base_vector") {
    return ({ value }: { value: string }) =>
      value && <CvssLink vector={value} target="_blank" rel="noreferrer" />;
  } else if (column.field === "cvss_base_severity") {
    return ({ value }: { value: string }) => {
      const ratingId = getSeverityValue(value);
      const color = ratingId ? ratingColors[ratingId] : undefined;
      return (
        color && (
          <Chip
            label={value}
            variant="outlined"
            sx={{
              width: "150px",
              // backgroundColor: color,
              border: `1px solid ${color}`,
            }}
          />
        )
      );
    };
  } else if (column.field === "cwes") {
    return (props: GridRenderCellParams<any, CweLookup>) => (
      <Stack direction="row" spacing={1}>
        {props.row[props.field]?.map((x: CweLookup) => (
          <CweLink key={x.id} value={x} />
        ))}
      </Stack>
    );
  }
};

export const valueGetterBugCrowdVrt = (column: GridColDef) => {
  if (column.field === "cvss_base_severity") {
    return ({ value }: { value: { id: SeverityType; label: string } }) =>
      value?.label ?? "";
  } else if (column.field === "cwes") {
    return (props: GridRenderCellParams<any, CweLookup[]>) =>
      props.value?.map((x: CweLookup) => x.label).join("; ") ?? "";
  }
};

/*
 This function is used by the DataGrid component to custom-render cells.

 For possible Chip colors, see https://mui.com/material-ui/api/chip/#Chip-prop-color
 */
export const renderCellProjects = (column: GridColDef) => {
  if (column.field === "applications") {
    return ({ value }: { value: string[] }) => {
      const result =
        value?.map((item) => (
          <InventoryLink key={item} application_id={item} />
        )) ?? [];
      return (
        <Stack direction="row" spacing={1}>
          {result}
        </Stack>
      );
    };
  } else if (column.field === "state") {
    return ({ value }: { value: string }) => {
      let color: ChipColorType = "default";
      let icon = <DoneIcon />;
      let tooltip = "";

      switch (value) {
        case "Backlog":
          color = "default"; // Grey
          tooltip = "Project is put on hold.";
          icon = <WatchLaterIcon />;
          break;
        case "Planning":
          color = "error"; // Red
          tooltip = "Determining the execution date is in progress.";
          icon = <HelpIcon />;
          break;
        case "Scheduled":
          color = "primary"; // Dark Blue
          tooltip = "Execution date successfully defined.";
          icon = <CalendarMonthIcon />;
          break;
        case "Running":
          color = "secondary"; // Purple
          tooltip = "The project is currently executed.";
          icon = <SyncIcon />;
          break;
        case "Cancelled":
          color = "error"; // Red
          tooltip = "Project is not conducted.";
          icon = <CancelIcon />;
          break;
        case "Archived":
          color = "error"; // Red
          tooltip = "Project is not conducted.";
          icon = <CancelIcon />;
          break;
        case "Reporting":
          color = "info"; // Light Blue
          tooltip = "Project completed and report is being created.";
          icon = <EditIcon />;
          break;
        case "Completed":
          color = "success"; // Green
          tooltip = "Project successfully completed.";
          icon = <DoneIcon />;
          break;
        default:
      }
      return (
        <Tooltip title={tooltip}>
          <Chip
            icon={icon}
            label={value}
            color={color}
            variant="outlined"
            sx={{ width: "150px" }}
          />
        </Tooltip>
      );
    };
  } else if (
    ["classifications", "reasons", "environments", "tags"].includes(
      column.field
    )
  ) {
    return ({ value }: { value: string[] }) => {
      const result = summarize_list(value).map((item) => {
        return (
          <Chip key={item} label={item} color="primary" variant="outlined" />
        );
      });
      return (
        <Stack direction="row" spacing={1}>
          {result}
        </Stack>
      );
    };
  } else if (column.field === "location") {
    return ({ value }: { value: string }) => (
      <img
        loading="lazy"
        width="30"
        key={"img_" + value}
        srcSet={`${URL_COUNTRIES_FLAG}/${value.toLowerCase()} 2x`}
        src={`${URL_COUNTRIES_FLAG}/${value.toLowerCase()}`}
        alt={value}
      />
    );
  }
};

export const valueGetterProjects = (column: GridColDef) => {
  // The REST API returns an object containing the enum information. For the DataGrid, we have to extract the name attribute.
  if (["state", "project_type", "manager"].includes(column.field)) {
    return ({ value }: { value: UserLookup }) => value?.label ?? "";
  } else if (["provider", "customer"].includes(column.field)) {
    return ({ value }: { value: EntityLookup }) => value?.name ?? "";
  } else if (column.field === "applications") {
    return ({ value }: { value: ApplicationLookup[] }) =>
      value?.map((item) => item?.app_id ?? "") ?? [];
  } else if (
    ["classifications", "reasons", "environments", "tags"].includes(
      column.field
    )
  ) {
    return ({ value }: { value: TagLookup[] }) =>
      value?.map((item) => item?.name ?? "") ?? [];
  } else if (column.field === "location") {
    return ({ value }: { value: CountryLookup }) => value?.country_code ?? "";
  } else if (column.field === "lead_tester") {
    return ({ value }: { value: UserLookup }) => value?.label ?? "";
  }
};

/*
 This function is used by the DataGrid component to custom-render cells.

 For possible Chip colors, see https://mui.com/material-ui/api/chip/#Chip-prop-color
 */
export const renderCellRatings = (
  column: GridColDef,
  columnNames?: string[]
) => {
  const severityColumns = columnNames ? columnNames : ["severity"];
  if (severityColumns.includes(column.field)) {
    return ({ value }: { value?: string }) => {
      if (!value) return;
      const ratingId = getSeverityValue(value);
      const color = ratingId ? ratingColors[ratingId] : undefined;
      return (
        <Chip
          label={value}
          variant="outlined"
          sx={{
            width: "150px",
            // backgroundColor: color,
            border: `1px solid ${color}`,
          }}
        />
      );
    };
  } else if (column.field === "cvss_vector") {
    return ({ value }: { value: string }) =>
      value && <CvssLink vector={value} target="_blank" rel="noreferrer" />;
  }
};

export const valueGetterRatings = (column: GridColDef) => {
  // The REST API returns an object containing the enum information. For the DataGrid, we have to extract the name attribute.
  const fieldsWithNames = ["severity", "status"];

  if (fieldsWithNames.includes(column.field)) {
    return ({ value }: { value: AutoCompleteEnumType }) => {
      const result = value?.name ?? value?.label ?? "";
      return result;
    };
  }
};

export const renderDataGridCellTags = (
  tags: string[],
  showMaxTags: number = 0
) => {
  const values = showMaxTags > 0 ? tags?.slice(0, showMaxTags) ?? [] : tags;
  if (tags?.length > showMaxTags && showMaxTags > 0) {
    values.push(`+${tags.length - showMaxTags}`);
  }
  const result = values.map((item, index) => {
    return <Chip key={index} label={item} color="primary" variant="outlined" />;
  });
  return (
    <Stack direction="row" spacing={1}>
      {result}
    </Stack>
  );
};

export const renderDataGridCellTag = (tag: string) =>
  tag ? <Chip label={tag} color="primary" variant="outlined" /> : undefined;
