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
import { Alert } from "@mui/material";
import {
  queryKeyBugcrowdVrt as queryKey,
  COLUMN_DEFINITION,
  URL_BUGCROWD_VRT as URL,
  VrtRead as ObjectRead,
} from "../../models/tagging/bugcrowdVrt";
import { MainPages } from "../../models/enums";
import PagesDataGrid from "../../components/data/datagrid/PagesDataGrid";
import LoadingIndicator from "../../components/feedback/LoadingIndicator";
import { useLuminaCore } from "../../util/hooks/useLuminaCore";
import {
  renderCellBugCrowdVrt as renderCell,
  valueGetterBugCrowdVrt as valueGetter,
} from "../Common";

const BugCrowdVrt = React.memo(() => {
  const context = useLuminaCore({
    columnDefinition: COLUMN_DEFINITION,
    dataApiEndpoint: URL,
    dataQueryKey: queryKey,
    dataConvertFn: (data: any[]) => data.map((d) => new ObjectRead(d)),
    pageType: MainPages.BugCrowdVrt,
  });
  const { isLoadingAll, query, pageManagerContext } = context;
  // console.log("BugCrowdVrt", context);

  if (query.isError) {
    return <Alert severity="error">Error loading data</Alert>;
  }

  return (
    <>
      <LoadingIndicator open={isLoadingAll} />
      <PagesDataGrid
        page={MainPages.BugCrowdVrt}
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

export default BugCrowdVrt;
