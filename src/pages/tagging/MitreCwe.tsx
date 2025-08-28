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
import { Chip, Alert, Tooltip, Link as MuiLink, Stack } from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import {
  queryKeyMitreCwe as queryKey,
  COLUMN_DEFINITION,
  URL_MITRE_CWE_VRT as URL,
  CweWeaknessRead as ObjectRead,
  CweLookup,
} from "../../models/tagging/mitreCwe";
import { CweMappingEnum, CweStatusEnum, MainPages } from "../../models/enums";
import PagesDataGrid from "../../components/data/datagrid/PagesDataGrid";
import LoadingIndicator from "../../components/feedback/LoadingIndicator";
import { useLuminaCore } from "../../util/hooks/useLuminaCore";
import { ChipColorType } from "../../models/common";
import { CWE_DEFINITIONS_URL } from "../../util/consts/common";
import CweLink from "../../components/navigation/CweLink";

/*
 *This function is used by the DataGrid component to custom-render cells.
 */
const renderCell = (column: GridColDef) => {
  if (column.field === "status") {
    let color: ChipColorType | null;
    return ({ value }: { value: string }) => {
      switch (value) {
        case "Draft":
          color = "warning";
          break;
        case "Stable":
          color = "success";
          break;
        case "Deprecated":
          color = "error";
          break;
        case "Incomplete":
          color = "default";
          break;
        default:
          color = null;
      }
      return (
        color && (
          <Chip
            label={value}
            variant="outlined"
            color={color}
            sx={{ width: "150px" }}
          />
        )
      );
    };
  } else if (["views", "categories"].includes(column.field)) {
    return (props: GridRenderCellParams<any, CweLookup[]>) => (
      <Stack direction="row" spacing={1}>
        {props.row[column.field]?.map((x: CweLookup) => (
          <CweLink key={x.id} value={x} />
        ))}
      </Stack>
    );
  } else if (column.field === "cwe_id") {
    return ({ value }: { value: number }) =>
      value && (
        <MuiLink
          href={`${CWE_DEFINITIONS_URL}/${value}.html`}
          target="_blank"
          rel="noreferrer"
        >
          {value}
        </MuiLink>
      );
  } else if (column.field === "mapping") {
    let color: ChipColorType | null;
    let toolTipText: string;
    const chipWidth = "150px";
    return ({ value }: { value: string }) => {
      switch (value) {
        case "Allowed":
          toolTipText =
            "This CWE ID could be used to map to real-world vulnerabilities";
          color = "success";
          break;
        case "Prohibited":
          toolTipText =
            "This CWE ID must not be used to map to real-world vulnerabilities";
          color = "error";
          break;
        case "Discouraged":
          toolTipText =
            "This CWE ID should not be used to map to real-world vulnerabilities";
          color = "warning";
          break;
        case "Allowed with Review":
          toolTipText =
            "This CWE ID could be used to map to real-world vulnerabilities in limited situations requiring careful review";
          color = "primary";
          break;
        default:
          color = null;
      }
      return (
        color && (
          <Tooltip title={toolTipText} arrow>
            <Chip
              label={value}
              variant="outlined"
              color={color}
              sx={{
                width: chipWidth,
              }}
            />
          </Tooltip>
        )
      );
    };
  } else if (column.field === "abstraction") {
    let color: ChipColorType | null;
    let toolTipText: string;
    const chipWidth = "150px";
    return ({ value }: { value: string }) => {
      switch (value) {
        case "Base":
          toolTipText =
            "A weakness that is still mostly independent of a resource or technology, but with sufficient details to provide specific methods for detection and prevention. Base level weaknesses typically describe issues in terms of 2 or 3 of the following dimensions: behavior, property, technology, language, and resource";
          color = "primary";
          break;
        case "Variant":
          toolTipText =
            "A weakness that is linked to a certain type of product, typically involving a specific language or technology. More specific than a Base weakness. Variant level weaknesses typically describe issues in terms of 3 to 5 of the following dimensions: behavior, property, technology, language, and resource";
          color = "secondary";
          break;
        case "Class":
          toolTipText =
            "A weakness that is described in a very abstract fashion, typically independent of any specific language or technology. More specific than a Pillar Weakness, but more general than a Base Weakness. Class level weaknesses typically describe issues in terms of 1 or 2 of the following dimensions: behavior, property, and resource";
          color = "default";
          break;
        default:
          color = null;
      }
      return (
        color && (
          <Tooltip title={toolTipText} arrow>
            <Chip
              label={value}
              variant="outlined"
              color={color}
              sx={{
                width: chipWidth,
              }}
            />
          </Tooltip>
        )
      );
    };
  }
};

const valueGetter = (column: GridColDef) => {
  if (["status", "mapping", "abstraction"].includes(column.field)) {
    return ({
      value,
    }: {
      value: { id: CweStatusEnum | CweMappingEnum; label: string };
    }) => value?.label ?? "";
  } else if (["views", "categories"].includes(column.field)) {
    return (props: GridRenderCellParams<any, CweLookup[]>) =>
      props.value?.map((x: CweLookup) => x.label).join("; ") ?? "";
  }
};

const MitreCwe = React.memo(() => {
  const context = useLuminaCore({
    columnDefinition: COLUMN_DEFINITION,
    dataApiEndpoint: URL,
    dataQueryKey: queryKey,
    dataConvertFn: React.useCallback(
      (data: any[]) => data.map((d) => new ObjectRead(d)),
      []
    ),
    pageType: MainPages.MitreCwe,
  });
  const { isLoadingAll, query, pageManagerContext } = context;

  if (query.isError) {
    return <Alert severity="error">Error loading data</Alert>;
  }

  return (
    <>
      <LoadingIndicator open={isLoadingAll} />
      <PagesDataGrid
        page={MainPages.MitreCwe}
        user={pageManagerContext.me!}
        columns={COLUMN_DEFINITION}
        isLoading={query.isLoading}
        rows={query.data}
        renderCellFn={renderCell}
        getCellValueFn={valueGetter}
      />
    </>
  );
});

export default MitreCwe;
