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
import { useQuery } from "./useQuery";
import {
  queryKeyReportLanguages,
  URL_REPORT_LANGUAGES_LOOKUP,
  ReportLanguageLookup,
} from "../../../models/reportLanguage";
import { QueryObserverBaseResult } from "@tanstack/react-query";

export interface UseQueryReportLanguageReturn {
  languageQuery: QueryObserverBaseResult<unknown, Error>;
  reportLanguages: ReportLanguageLookup[];
  mainLanguage: ReportLanguageLookup | null;
}

export const useQueryReportLanguage = ({
  enabled,
}: {
  enabled: boolean;
}): UseQueryReportLanguageReturn => {
  const languageQuery = useQuery({
    queryKey: React.useMemo(() => [...queryKeyReportLanguages], []),
    path: URL_REPORT_LANGUAGES_LOOKUP,
    enabled,
    staleTime: 1000 * 60 * 25, // 25 minutes
    // Here, we convert the received list of data objects into a list of ProjectRead objects.
    convertFn: React.useCallback(
      (data: any[]) => data.map((d) => new ReportLanguageLookup(d)),
      []
    ),
  });

  const reportLanguages = React.useMemo(
    () => (languageQuery.data ?? []) as ReportLanguageLookup[],
    [languageQuery.data]
  );

  const mainLanguage = React.useMemo(
    () => reportLanguages.find((lang) => lang.is_default) ?? null,
    [reportLanguages]
  );

  return React.useMemo(
    () => ({ languageQuery, reportLanguages, mainLanguage }),
    [languageQuery, reportLanguages, mainLanguage]
  );
};
