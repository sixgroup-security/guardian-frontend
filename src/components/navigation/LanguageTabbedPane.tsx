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

import Tab from "@mui/material/Tab";
import TabPanel from "@mui/lab/TabPanel";
import TabbedPane from "./TabbedPane";
import { InputControlFieldWrapperv2 as InputControlFieldWrapper } from "../inputs/InputControlWrapper";
import { UsePageManagerReturn } from "../../util/hooks/usePageManager";
import { Stack } from "@mui/material";
import { Item } from "../inputs/dialogs/DetailsDialog";

export interface LanguageTabbedPaneProps {
  context: UsePageManagerReturn;
  // Additional settings used for MarkdownEditor.
  uploadUrl?: string;
  // If set to true, then a \label{} will be inserted at the end of an image's caption.
  insertLabel?: boolean;
}

const LanguageTabbedPane = (props: LanguageTabbedPaneProps) => {
  const { context } = props;
  const {
    pageManager,
    languageQuery: { reportLanguages: languages },
  } = context;
  // Obtain all column definitions that are multi-language.
  const multiLanguageColumns = Object.values(pageManager.columns).filter(
    (value) => value.multiLanguage ?? false
  );

  const tabTitles = languages.map((language, index) => {
    const error = Object.entries(pageManager.flags ?? [])
      .filter(([key]) =>
        multiLanguageColumns.find((i) => i.field === key && i.multiLanguage)
      )
      .reduce(
        (error, [, value]) =>
          error ||
          (value[language.language_code]?.error &&
            value[language.language_code]?.edited),
        false
      );
    return (
      <Tab
        id={language.id}
        key={language.id}
        label={language.name}
        value={index.toString()}
        sx={{
          color: error ? "error.main" : "inherit",
          "&.Mui-selected": {
            color: error ? "error.main" : "inherit",
          },
        }}
      />
    );
  });
  const tabContents = languages.map((language, index) => {
    return (
      <TabPanel
        id={language.id}
        key={language.id}
        value={index.toString()}
        sx={{ pl: 0, pr: 0 }}
      >
        <Stack>
          {multiLanguageColumns.map((column) => {
            if (
              column.controlType !== "MarkdownEditor" &&
              column.controlType !== "TextField"
            )
              throw new Error(
                "Invalid control type " +
                  column.controlType +
                  " for language tabbed pane."
              );
            return (
              <Item key={"item_" + column.field + "/" + language.language_code}>
                <InputControlFieldWrapper
                  context={context}
                  id={column.field + "/" + language.language_code}
                  key={column.field + "/" + language.language_code}
                  minRows={column.minRows}
                  maxRows={column.maxRows}
                  uploadUrl={props.uploadUrl}
                  insertLabel={props.insertLabel}
                />
              </Item>
            );
          })}
        </Stack>
      </TabPanel>
    );
  });

  return (
    <TabbedPane
      tabTitles={tabTitles}
      tabContents={tabContents}
      sx={{ flexGrow: 1 }}
    />
  );
};

export default LanguageTabbedPane;
