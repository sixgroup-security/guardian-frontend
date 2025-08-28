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

import {
  NamedModelBase,
  GridColInputControlProps,
  StateContentTypes,
  isValidString,
  isNotNullUndefined,
  getSingleAutoCompleteEnumId,
} from "./common";
import { URL_PATH_PREFIX } from "../util/consts/common";
import {
  AutoCompleteOption,
  getAutoCompleteOption,
  getAutoCompleteOptions,
  getEnumNames,
  ReportTemplateFileVersion,
} from "./enums";

// Query keys for report templates
export const queryKeyPenTestReportTemplates = ["report templates", "pentest"];

// Report templates REST API endpoints
const URL_PATH_REPORT_TEMPLATE_PREFIX = URL_PATH_PREFIX + "/templates";
export const URL_REPORT_TEMPLATE_FILES =
  URL_PATH_REPORT_TEMPLATE_PREFIX + "/{template_id}/files";
export const URL_REPORT_TEMPLATES = URL_PATH_REPORT_TEMPLATE_PREFIX;
export const URL_PENTEST_REPORT_TEMPLATES =
  URL_PATH_REPORT_TEMPLATE_PREFIX + "/pentest";
export const URL_PENTEST_REPORT_TEMPLATE_LOOKUP =
  URL_PENTEST_REPORT_TEMPLATES + "/lookup";

// Valid types are: export type GridNativeColTypes = 'string' | 'number' | 'date' | 'dateTime' | 'boolean' | 'singleSelect' | 'actions';
export const COLUMN_DEFINITION: GridColInputControlProps[] = [
  {
    field: "id",
    hideColumn: true,
    controlType: null,
  },
  {
    field: "name",
    headerName: "Name",
    type: "string",
    description: "The name of the measure.",
    errorText: "This field is required and cannot be empty.",
    width: 350,
    controlType: "TextField",
    required: true,
    isValid(value: StateContentTypes) {
      return isValidString(value);
    },
  },
  {
    field: "version",
    headerName: "Version",
    type: "singleSelect",
    valueOptions: getEnumNames(ReportTemplateFileVersion),
    description: "The version of the report template file to be used.",
    errorText: "This field is required and cannot be empty.",
    headerAlign: "center",
    align: "center",
    width: 150,
    controlType: "Autocomplete",
    options: getAutoCompleteOptions(ReportTemplateFileVersion),
    required: true,
    isValid(value: StateContentTypes) {
      return isNotNullUndefined(value);
    },
    getFinalValue(value: StateContentTypes) {
      return getSingleAutoCompleteEnumId(value);
    },
  },
  {
    field: "executive_summary",
    headerName: "Executive Summary",
    type: "string",
    description: "Template text for the executive summary.",
    errorText: "This field is required and cannot be empty.",
    width: 350,
    controlType: "MarkdownEditor",
    markdownMaxHeight: "750px",
    required: true,
    uploadUrl: undefined,
    // hideColumn: true,
    multiLanguage: true,
    isValid(value: StateContentTypes) {
      return isValidString(value);
    },
  },
  {
    field: "prefix_section_text",
    headerName: "Report Prefix",
    type: "string",
    description: "Report text before the vulnerability/TTP section.",
    errorText: "This field is required and cannot be empty.",
    width: 350,
    controlType: "MarkdownEditor",
    markdownMaxHeight: "750px",
    required: true,
    uploadUrl: undefined,
    // hideColumn: true,
    multiLanguage: true,
    isValid(value: StateContentTypes) {
      return isValidString(value);
    },
  },
  {
    field: "postfix_section_text",
    headerName: "Report Postfix",
    type: "string",
    description: "Report text after the vulnerability/TTP section.",
    errorText: "This field is required and cannot be empty.",
    width: 350,
    controlType: "MarkdownEditor",
    markdownMaxHeight: "750px",
    required: true,
    uploadUrl: undefined,
    // hideColumn: true,
    multiLanguage: true,
    isValid(value: StateContentTypes) {
      return isValidString(value);
    },
  },
  {
    field: "summary_template",
    headerName: "Summary Template",
    hideColumn: true,
    type: "string",
    description:
      "Defines how the various fields of a procedure shall be merged together.",
    errorText: "This field is required and cannot be empty.",
    controlType: "MarkdownEditor",
    markdownMaxHeight: "750px",
    required: false,
    uploadUrl: undefined,
    multiLanguage: true,
    defaultValue: `# {{.resolved}} {{.title}}

## Description

{{.description}}

## Observation / Proof of Concept

{{.observation}}

## Recommendation

{{.recommendation}}

## References

{{.references}}

## Rating

| **CVSS Score** | **Severity** | **CVSS Vector** |
| --------------------- | --------------------------- | ---------------------- |
| {{.cvss_score}} | {{.severity}} | {{.cvss_vector}} |

{{.rating_comment}}
`,
  },
];

export class ReportTemplateRead extends NamedModelBase {
  public version: AutoCompleteOption | null;
  public executive_summary: { [key: string]: string };
  public prefix_section_text: { [key: string]: string };
  public postfix_section_text: { [key: string]: string };
  public summary_template: { [key: string]: string };

  constructor(userData: any) {
    super(userData.name, userData.id);
    this.version = getAutoCompleteOption(
      ReportTemplateFileVersion,
      userData.version
    );
    this.executive_summary = userData.executive_summary;
    this.prefix_section_text = userData.prefix_section_text;
    this.postfix_section_text = userData.postfix_section_text;
    this.summary_template = userData.summary_template;
  }
}
