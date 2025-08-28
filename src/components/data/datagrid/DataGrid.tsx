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
import { Alert, Box, Pagination, Typography } from "@mui/material";
import { env, MuiLicenseType } from "../../../util/consts/common";
/*import {
  useGridApiRef,
  GridColDef,
  GridDensity,
  GridRowParams,
  useGridSelector,
  useGridApiContext,
  GridValidRowModel,
  DataGrid as MuiDataGrid,
  gridFilteredSortedRowIdsSelector,
  gridPageCountSelector,
  GridRowSelectionModel,
  gridPaginationModelSelector,
} from "@mui/x-data-grid";*/
import {
  DataGridPro as MuiDataGrid,
  useGridApiRef,
  GridColDef,
  GridDensity,
  GridRowParams,
  useGridSelector,
  useGridApiContext,
  GridValidRowModel,
  GridPinnedRowsProp,
  gridPageCountSelector,
  gridFilteredSortedRowIdsSelector,
  GridRowSelectionModel,
  gridPaginationModelSelector,
} from "@mui/x-data-grid-pro";
import LoadingIndicator from "../../feedback/LoadingIndicator";
import { GridInitialStateCommunity } from "@mui/x-data-grid/models/gridStateCommunity";
import { GridActionsCellItemProps } from "@mui/x-data-grid/components/cell/GridActionsCellItem";
import {
  GridColInputControlProps,
  CellValueFnType,
} from "../../../models/common";
import { SxProps, Theme } from "@mui/material";

export const CustomPagination = () => {
  const apiRef = useGridApiContext();
  const paginationModel = useGridSelector(apiRef, gridPaginationModelSelector);
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);
  const filteredRows = useGridSelector(
    apiRef,
    gridFilteredSortedRowIdsSelector
  );
  const rowCount = filteredRows.length;
  // Do not implement conditional hiding any of the elements below because this will cause an
  // exception once the datagrid only contains a single row that is than pinned/selected.
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Typography variant="body2" sx={{ m: 1, ml: 2 }}>
        Total Rows: {rowCount}
      </Typography>
      <Box sx={{ flexGrow: 1 }} />
      <Pagination
        count={pageCount}
        page={paginationModel.page + 1}
        onChange={(_: React.ChangeEvent<unknown>, page: number) =>
          apiRef.current.setPage(page - 1)
        }
      />
    </Box>
  );
};

export interface DataGridProps {
  // The DataGrid's initial configuration (e.g., hidden columns).
  settings?: unknown;
  // If true, the Data Grid is loading.
  isLoading: boolean;
  // Set of columns of type GridColDef[].
  columns: GridColInputControlProps[];
  // Set of rows of type GridRowsProp.
  rows: any; // GridRowsProp;
  // If true, the Data Grid height is dynamic and follow the number of rows in the Data Grid.
  autoHeight?: boolean;
  // Function to obtain the correct value for a cell.
  getCellValueFn?: CellValueFnType;
  // Function to correctly render all cells.
  renderCellFn?: CellValueFnType;
  // The DataGrid's toolbar buttons.
  slots?: any;
  // The DataGrid's toolbar's slot props.
  slotProps?: any;
  // Set the density of the Data Grid.
  density?: GridDensity;
  // If true, the selection on click on a row or cell is disabled.
  disableRowSelectionOnClick?: boolean;
  // If true, the selection on click on a row or cell is disabled.
  disableDensitySelector?: boolean;
  // If true, the Data Grid will automatically adjust the page size to fit the number of rows.
  autoPageSize?: boolean;
  // If true, pagination is enabled.
  pagination?: boolean;
  // If true, the Data Grid will display an extra column with checkboxes for selecting rows.
  checkboxSelection?: boolean;
  // Pinned (or frozen, locked, or floating) rows are those visible at all times while the user scrolls the data grid vertically.
  pinnedRows?: GridPinnedRowsProp;
  sx?: SxProps<Theme>;
  // Function to obtain the correct actions for a row.
  getTableActions?: (
    params: GridRowParams<GridValidRowModel>
  ) => React.ReactElement<GridActionsCellItemProps>[];
  configurationUpdateHandler?: (state: GridInitialStateCommunity) => void;
  onRowSelectionModelChange?: (
    newRowSelectionModel: GridRowSelectionModel
  ) => void;
  rowSelectionModel?: GridRowSelectionModel;
  // If true, the row grouping is disabled.
  disableRowGrouping?: boolean;
  disableAggregation?: boolean;
}

const DataGrid: React.FC<DataGridProps> = React.memo((props) => {
  // https://stackoverflow.com/questions/74046329/is-there-any-way-to-save-mui-datagrid-toolbars-state
  const apiRef = useGridApiRef();
  const {
    autoPageSize,
    pagination,
    disableAggregation,
    disableRowGrouping,
    getCellValueFn,
    renderCellFn,
    configurationUpdateHandler,
    pinnedRows,
  } = props;
  const exportState = apiRef.current.exportState;

  /*
   * This interates through all received table columns and where applicable, adds the valueGetter and renderCell functions.
   *
   * This is necessary because the DataGrid component requires these functions to properly present the data in the columns.
   */
  const updateColumnAttributes = React.useCallback(
    (column: GridColDef) => {
      let result = { ...column };

      // Add valueGetter functions
      const valueGetter = getCellValueFn && getCellValueFn(column);
      if (valueGetter) {
        result = { ...column, valueGetter };
      } else if (column.type === "date") {
        result = {
          ...column,
          valueGetter: ({ value }: { value: string }) =>
            value && new Date(value),
          valueFormatter: (value) =>
            value && value.value
              ? new Intl.DateTimeFormat("en-gb").format(value.value)
              : "",
        };
      }

      // Add renderCell functions
      const renderCell = renderCellFn && renderCellFn(column);
      if (renderCell) {
        result = { ...result, renderCell };
      }
      return result;
    },
    [getCellValueFn, renderCellFn]
  );

  /*
   * Add the actions column at the end of the columns array
   *
   * https://mui.com/x/react-data-grid/column-definition/#special-properties
   */
  const columns: GridColDef<GridValidRowModel>[] = React.useMemo(() => {
    const result = [
      ...props.columns
        .filter((item) => item.hideColumn !== true)
        .map((column: GridColDef) => updateColumnAttributes(column)),
    ];

    if (props.getTableActions) {
      result.unshift({
        field: "actions",
        type: "actions",
        headerName: "Actions",
        getActions: props.getTableActions,
      });
    }
    return result;
  }, [props.columns, updateColumnAttributes, props.getTableActions]);

  const dataGridProps = React.useMemo(() => {
    return env.MUI_LICENSE_TYPE !== MuiLicenseType.Community
      ? {
          pagination: autoPageSize || pagination || false,
          disableRowGrouping: disableRowGrouping,
          disableAggregation: disableAggregation,
          onColumnWidthChange: () =>
            configurationUpdateHandler &&
            configurationUpdateHandler(exportState()),
          onPinnedColumnsChange: () =>
            configurationUpdateHandler &&
            configurationUpdateHandler(exportState()),
        }
      : {};
  }, [
    autoPageSize,
    pagination,
    disableAggregation,
    disableRowGrouping,
    configurationUpdateHandler,
    exportState,
  ]);

  // We wait for the data to be loaded before rendering the page.
  if (props.isLoading) {
    return <LoadingIndicator open={true} />;
  }

  if (!props.rows) {
    return <Alert severity="error">No data received.</Alert>;
  }

  return (
    <MuiDataGrid
      {...dataGridProps}
      sx={{ ...props.sx }}
      autoHeight={props.autoHeight ?? false}
      autoPageSize={props.autoPageSize ?? false}
      apiRef={apiRef}
      columns={columns}
      rows={props.rows}
      initialState={props?.settings ?? {}}
      density={props.density ?? "standard"}
      slots={props.slots}
      slotProps={props.slotProps}
      disableRowSelectionOnClick={props.disableRowSelectionOnClick ?? true}
      disableDensitySelector={props.disableDensitySelector ?? true}
      checkboxSelection={props.checkboxSelection ?? false}
      // Events to update updates on the DataGrid configuration in the backend.
      onColumnVisibilityModelChange={() =>
        props.configurationUpdateHandler &&
        props.configurationUpdateHandler(apiRef.current.exportState())
      }
      onFilterModelChange={() =>
        // If details.reason is not set, then this indicates that the user just clicked on the filter dialog but haven't set a filter yet.
        //details?.reason &&
        props.configurationUpdateHandler &&
        props.configurationUpdateHandler(apiRef.current.exportState())
      }
      onSortModelChange={() =>
        props.configurationUpdateHandler &&
        props.configurationUpdateHandler(apiRef.current.exportState())
      }
      onColumnOrderChange={() =>
        props.configurationUpdateHandler &&
        props.configurationUpdateHandler(apiRef.current.exportState())
      }
      onColumnWidthChange={() =>
        props.configurationUpdateHandler &&
        props.configurationUpdateHandler(apiRef.current.exportState())
      }
      onPinnedColumnsChange={() =>
        props.configurationUpdateHandler &&
        props.configurationUpdateHandler(apiRef.current.exportState())
      }
      onPaginationModelChange={() =>
        props.configurationUpdateHandler &&
        props.configurationUpdateHandler(apiRef.current.exportState())
      }
      onRowSelectionModelChange={props.onRowSelectionModelChange}
      rowSelectionModel={props.rowSelectionModel}
      pinnedRows={pinnedRows}
    />
  );
});

export default DataGrid;
