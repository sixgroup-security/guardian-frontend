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
import { Box, Alert, Tooltip, Stack, Typography } from "@mui/material";
import {
  GridRowParams,
  GridValidRowModel,
  GridToolbarContainer,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import {
  GridRowId,
  GridActionsCellItem,
  GridActionsCellItemProps,
} from "@mui/x-data-grid-pro";
import { useTheme } from "@mui/material/styles";
import {
  StateContentTypes,
  DataGridAutocompleteExtendedProps,
} from "../../../models/common";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { env, MuiLicenseType } from "../../../util/consts/common";
import DataGrid, { CustomPagination } from "./DataGrid";
import { useQuery } from "../../../util/hooks/tanstack/useQuery";
import { Item } from "../../inputs/dialogs/DetailsDialog";
import { OnChangeEventType } from "../../../util/hooks/usePageManager";

export interface DataGridAutocompleteProps {
  id: string;
  // List of UUIDs
  value: any;
  required?: boolean;
  helperText: string;
  errorText?: string;
  readOnly?: boolean;
  error?: boolean;
  multiSelect?: boolean;
  label: string;
  maxRows?: number;
  dataGridAutoCompleteSettings: DataGridAutocompleteExtendedProps;
  onChange: (event: OnChangeEventType, newValue: StateContentTypes) => void;
}

const DataGridAutocomplete = React.memo((props: DataGridAutocompleteProps) => {
  const theme = useTheme();
  const {
    readOnly,
    value,
    label,
    onChange,
    dataGridAutoCompleteSettings: dataGridProps,
  } = props;
  const {
    columns,
    getInitialValueFn,
    filterFn,
    apiEndpoint: path,
    queryKey,
    height,
    getCellValueFn,
    renderCellFn,
  } = dataGridProps;
  const initialRowIds = React.useMemo(
    () => (getInitialValueFn ? getInitialValueFn(value) : value),
    [getInitialValueFn, value]
  );
  const query = useQuery({
    path,
    queryKey,
    convertFn: dataGridProps.convertFn,
  });
  const rows = React.useMemo(
    () => (query.isSuccess ? (query.data as GridValidRowModel) : []),
    [query.isSuccess, query.data]
  );
  const [selectedRowIds, setSelectedRowIds] =
    React.useState<GridRowId[]>(initialRowIds);
  const message = props.error ? props.errorText : props.helperText;
  const selectedRows = React.useMemo(
    () => rows.filter((row: any) => filterFn(row, selectedRowIds)),
    [rows, filterFn, selectedRowIds]
  );
  const pinnedRows = React.useMemo(() => {
    return { top: selectedRows };
  }, [selectedRows]);

  const slotInfo = React.useMemo(() => {
    return {
      slots: {
        toolbar: (props: { label: string }) => (
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ pl: 2 }}
              gutterBottom
            >
              {props.label}
            </Typography>
            <GridToolbarContainer>
              <GridToolbarQuickFilter
                key={"GridToolbarQuickFilter"}
                debounceMs={1000}
              />
            </GridToolbarContainer>
          </Box>
        ),
        footer: (props: { message: string; isError: boolean }) => (
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              variant="caption"
              color={
                props.isError
                  ? theme.palette.error.main
                  : theme.palette.text.secondary
              }
              sx={{ pl: 2 }}
              gutterBottom
            >
              {props.message}
            </Typography>
            <CustomPagination />
          </Box>
        ),
      },
      slotProps: {
        toolbar: { label },
        footer: { message, isError: props.error ?? false },
      },
    };
  }, [
    label,
    message,
    props.error,
    theme.palette.error.main,
    theme.palette.text.secondary,
  ]);

  const addClickHandler = React.useCallback(
    (rowId: GridRowId, add: boolean) => {
      if (add) {
        setSelectedRowIds((selectedRowIds) => [...selectedRowIds, rowId]);
      } else {
        setSelectedRowIds((selectedRowIds) =>
          selectedRowIds.filter((rowId) => rowId !== rowId)
        );
      }
    },
    [setSelectedRowIds]
  );

  const tableActions = React.useCallback(
    (
      params: GridRowParams<GridValidRowModel>
    ): React.ReactElement<GridActionsCellItemProps>[] => {
      const isPinned = selectedRowIds?.includes(params.id) ?? false;
      if (readOnly) {
        return [];
      }
      if (isPinned) {
        return [
          <GridActionsCellItem
            label="Remove"
            icon={
              <Tooltip title="Remove">
                <RemoveIcon />
              </Tooltip>
            }
            onClick={() => addClickHandler(params.id, false)}
          />,
        ];
      } else if (
        props.multiSelect ||
        (!props.multiSelect && selectedRowIds.length === 0)
      ) {
        return [
          <GridActionsCellItem
            label="Add"
            icon={
              <Tooltip title="Add">
                <AddIcon />
              </Tooltip>
            }
            onClick={() => addClickHandler(params.id, true)}
          />,
        ];
      }
      return [];
    },
    [addClickHandler, selectedRowIds, readOnly, props.multiSelect]
  );

  React.useEffect(() => {
    onChange(null, selectedRowIds);
  }, [
    // Uncommenting onChange creates an infinite loop
    // onChange,
    selectedRowIds,
  ]);

  if (env.MUI_LICENSE_TYPE === MuiLicenseType.Community) {
    return (
      <Alert severity="error">
        DataGridAutocomplete component only supported with Material UI (MUI) Pro
        or Premium license.
      </Alert>
    );
  }

  return (
    <Stack>
      <Item sx={{ pl: 0, pr: 0, pb: 3 }} style={{ height: height }}>
        <DataGrid
          autoPageSize
          rows={rows}
          columns={columns}
          pinnedRows={pinnedRows}
          isLoading={query.isLoading}
          getTableActions={tableActions}
          density="compact"
          getCellValueFn={getCellValueFn}
          renderCellFn={renderCellFn}
          {...slotInfo}
        />
      </Item>
    </Stack>
  );
});

export default DataGridAutocomplete;
