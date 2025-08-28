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

import React from "react";
import {
  GridToolbarContainer,
  GridRowParams,
  GridValidRowModel,
} from "@mui/x-data-grid";
import { GridInitialStateCommunity } from "@mui/x-data-grid/models/gridStateCommunity";
import { GridActionsCellItemProps } from "@mui/x-data-grid/components/cell/GridActionsCellItem";
import { useQueryUserSettings } from "../../../util/hooks/tanstack/useQueryUserSettings";
import { useMutationUserSettings } from "../../../util/hooks/tanstack/useMutationUserSettings";
import DataGrid, { CustomPagination, DataGridProps } from "./DataGrid";
import { CellValueFnType } from "../../../models/common";
import { getDefaultGridToolbars } from "./getDefaultGridToolbars";
import { MainPages } from "../../../models/enums";
import { User } from "../../../models/user";
import { LuminaCoreReturn } from "../../../util/hooks/useLuminaCore";
import { ModelBase } from "../../../models/common";

interface PagesDataGridv2Props {
  context: LuminaCoreReturn;
  // Function to obtain the correct value for a cell.
  getCellValueFn?: CellValueFnType;
  // Function to correctly render all cells.
  renderCellFn?: CellValueFnType;
  // Function to obtain the correct actions for a row.
  getTableActions?: (
    params: GridRowParams<GridValidRowModel>
  ) => React.ReactElement<GridActionsCellItemProps>[];
  // Defines in which mode the details dialog should be displayed.
  onNewButtonClick?: () => void;
  newButtonName?: string;
  dataConvertFn: (data: any) => ModelBase;
  filterFn?: (row: any) => boolean;
}

export const PagesDataGridv2: React.FC<PagesDataGridv2Props> = React.memo(
  (props) => {
    const mainLanguage = props.context.mainLanguage?.language_code;
    const columnsObject = props.context.pageManagerContext.columnsObject;
    const resolveMultiLanguage =
      props.context.pageManagerContext.resolveMultiLanguage;
    const tableData = React.useMemo(
      () => props.context.query.data ?? [],
      [props]
    );
    const { dataConvertFn, filterFn } = props;

    // Here we apply additional modifications of the data rows before we display them.
    const data = React.useMemo(() => {
      // 1. If a filter function is present, then we apply it.
      const result = filterFn
        ? tableData.filter((item: any) => filterFn!(item))
        : tableData;
      // 2. If the respective COLUMNG_DEFINITION contains an entry with multiLanguage=true and hideColumn=false, then we have to resolve the multiLanguage value of
      //    the main language, else, we just return the data as it is.
      //    TODO: At the moment we use the main language to resolve the correct language value. We should use the user's language instead.
      return resolveMultiLanguage == true
        ? result?.map((item: any) => {
            const result = Object.fromEntries(
              Object.entries(item).map(([key, value]) => {
                if (
                  mainLanguage &&
                  key in columnsObject &&
                  columnsObject[key].multiLanguage === true
                ) {
                  return [
                    key,
                    (value as { [key: string]: string })[mainLanguage],
                  ];
                }
                return [key, value];
              })
            );
            return dataConvertFn(result);
          })
        : result;
    }, [
      filterFn,
      dataConvertFn,
      tableData,
      mainLanguage,
      columnsObject,
      resolveMultiLanguage,
    ]);

    return (
      <PagesDataGrid
        page={props.context.pageType}
        user={props.context.pageManagerContext.me!}
        columns={props.context.columnDefinition}
        isLoading={props.context.query.isLoading}
        rows={data}
        getCellValueFn={props.getCellValueFn}
        renderCellFn={props.renderCellFn}
        getTableActions={props.getTableActions}
        newButtonName={props.newButtonName}
        onNewButtonClick={props.onNewButtonClick}
      />
    );
  }
);

interface PagesDataGridProps extends DataGridProps {
  user?: User;
  page: MainPages;
  // The event that is called if the button is clicked.
  onNewButtonClick?: () => void;
  newButtonName?: string;
}

// TODO: Convert all components from PagesDataGrid to PagesDataGridv2 and afterwards merge PagesDataGrid and PagesDataGridv2
const PagesDataGrid: React.FC<PagesDataGridProps> = React.memo((props) => {
  const {
    page,
    user,
    slots,
    slotProps,
    configurationUpdateHandler,
    onNewButtonClick,
    newButtonName,
    ...other
  } = props;
  // Load the user's DataGrid settings.
  const settings = useQueryUserSettings({ settingsUid: page });
  // Mutation object to update the user's root layout settings.
  const settingsMutation = useMutationUserSettings({
    settingsUid: page,
  });
  const hasCreateAccess = user?.hasCreateAccess(page) ?? true;
  // Compiles the DataGrid's header and footer toolbars.
  const slotInfo = React.useMemo(() => {
    if (slots) {
      return {
        slots: { ...slots, footer: () => <CustomPagination /> },
        slotProps: slotProps,
      };
    } else {
      const properties = {
        hasCreateAccess: hasCreateAccess,
        onNewButtonClick: onNewButtonClick,
      };
      return {
        slots: {
          toolbar: (props: any) => (
            <GridToolbarContainer>
              {getDefaultGridToolbars({
                ...props,
                hasCreateAccess,
                newButtonName,
              })}
            </GridToolbarContainer>
          ),
          footer: () => <CustomPagination />,
        },
        slotProps: { toolbar: properties },
      };
    }
  }, [slots, slotProps, hasCreateAccess, onNewButtonClick, newButtonName]);

  // This function is used by the DataGrid component to handle configuration updates.
  const newHandleDataGridConfigurationUpdates = React.useCallback(
    (tableConfiguration: GridInitialStateCommunity) => {
      settingsMutation.mutate(tableConfiguration);
    },
    [settingsMutation]
  );

  return (
    <DataGrid
      autoPageSize
      disableRowGrouping
      settings={settings.data}
      density={user?.table_density}
      configurationUpdateHandler={
        configurationUpdateHandler ?? newHandleDataGridConfigurationUpdates
      }
      disableAggregation={true}
      {...slotInfo}
      {...other}
    />
  );
});

export default PagesDataGrid;
