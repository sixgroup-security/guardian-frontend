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

import { URL_PROJECTS } from "./project";
import {
  NamedModelBase,
  GridColInputControlProps,
  StateContentTypes,
  isValidString,
  isNotNullUndefined,
  getSingleAutoCompleteEnumId,
  isNonEmptyArray,
  getArrayAutoCompleteEnumId,
  ModelBase,
} from "./common";
import { ReportLanguageLookup } from "./reportLanguage";
import {
  AutoCompleteOption,
  getAutoCompleteOption,
  getAutoCompleteOptions,
  getEnumNames,
  ReportTemplateFileVersion,
} from "./enums";

// Query keys for projects
export const queryKeyReports = ["report"];
export const queryKeyReportMainSuffix = ["main"];
export const queryKeyReportGeneralSuffix = ["general"];
export const queryKeyReportOverviewSuffix = ["overview"];
export const queryKeyReportTestingSuffix = ["testing"];

export const URL_REPORTS = URL_PROJECTS + "/{project_id}/reports";
export const URL_REPORTS_MAIN_SUFFIX = "/main";
export const URL_REPORTS_GENERAL_SUFFIX = "/general";
export const URL_REPORTS_OVERVIEW_SUFFIX = "/overview";
export const URL_REPORTS_TESTING_SUFFIX = "/testing";

export const REPORT_UPDATE_COLUMNS: GridColInputControlProps[] = [
  {
    field: "id",
    hideColumn: true,
    controlType: null,
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
    description: "Text for the executive summary.",
    errorText: "This field is required and cannot be empty.",
    controlType: "MarkdownEditor",
    markdownMaxHeight: "750px",
    required: true,
    uploadUrl: undefined,
    hideColumn: true,
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
    controlType: "MarkdownEditor",
    markdownMaxHeight: "750px",
    required: true,
    uploadUrl: undefined,
    hideColumn: true,
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
    controlType: "MarkdownEditor",
    markdownMaxHeight: "750px",
    required: true,
    uploadUrl: undefined,
    hideColumn: true,
    isValid(value: StateContentTypes) {
      return isValidString(value);
    },
  },
];

// Valid types are: export type GridNativeColTypes = 'string' | 'number' | 'date' | 'dateTime' | 'boolean' | 'singleSeleact' | 'actions';
export const NEW_REPORT_COLUMN_DEFINITION: GridColInputControlProps[] = [
  {
    field: "id",
    hideColumn: true,
    controlType: null,
  },
  {
    field: "report_template",
    headerName: "Report Template",
    type: "singleSelect",
    description: "The template structure/text and subtitle used by the report.",
    errorText: "This field is required and cannot be empty.",
    headerAlign: "center",
    align: "center",
    width: 100,
    controlType: "Autocomplete",
    required: true,
    isValid(value: StateContentTypes) {
      return isNotNullUndefined(value);
    },
    getFinalValue(value: StateContentTypes) {
      return getSingleAutoCompleteEnumId(value);
    },
  },
  {
    field: "report_language",
    headerName: "Report Language",
    type: "singleSelect",
    description: "The language in which the report is written.",
    errorText: "This field is required and cannot be empty.",
    headerAlign: "center",
    align: "center",
    width: 100,
    controlType: "CountrySelect",
    required: true,
    isValid(value: StateContentTypes) {
      return isNotNullUndefined(value);
    },
    getFinalValue(value: StateContentTypes) {
      return getSingleAutoCompleteEnumId(value);
    },
  },
];

export const SECTION_ATTRIBUTES: GridColInputControlProps[] = [
  {
    field: "id",
    hideColumn: true,
    controlType: null,
  },
  {
    field: "name",
    headerName: "Section title",
    type: "string",
    description: "The title of the test guide section.",
    errorText: "This field is required and cannot be empty.",
    controlType: "TextField",
    required: true,
    isValid(value: StateContentTypes) {
      return isValidString(value);
    },
  },
  {
    field: "description",
    headerName: "Description",
    type: "string",
    description: "Description for the section.",
    errorText: "This field is required and cannot be empty.",
    controlType: "TextField",
    required: false,
    minRows: 4,
    maxRows: 4,
  },
  {
    field: "order",
    hideColumn: true,
    controlType: "TextField",
    noSubmit: true,
  },
  {
    field: "hide",
    hideColumn: true,
    headerName: "Hide Section",
    description: "Allows hiding the section.",
    controlType: "Switch",
  },
];

export const TEST_GUIDE_LOOKUP_ATTRIBUTES: GridColInputControlProps[] = [
  {
    field: "testGuides",
    headerName: "Playbooks",
    type: "string",
    description: "The playbooks that shall be added.",
    errorText: "Select at least one playbook.",
    width: 210,
    controlType: "Autocomplete",
    required: true,
    multiSelect: true,
    isValid(value: StateContentTypes) {
      return isNonEmptyArray(value);
    },
    getFinalValue(value: StateContentTypes) {
      return getArrayAutoCompleteEnumId(value);
    },
  },
];

export class ReportTemplate extends NamedModelBase {
  public summary_template: any;

  constructor(userData: any) {
    super(userData.name, userData.id);
    this.summary_template = userData?.summary_template ?? "";
  }
}

export class ReportTemplateLookup extends NamedModelBase {
  constructor(userData: any) {
    super(userData.name, userData.id);
  }
}

/*
 * Just contains the project ID and name. This information is displayed at the top
 * of the Reports page component.
 */
export class ReportGeneralRead extends NamedModelBase {
  public projectId: string;

  constructor(userData: any) {
    super(userData.project_name, userData.id);
    this.projectId = userData.project_id;
  }
}

export class ReportRead extends ReportGeneralRead {
  public version: AutoCompleteOption | null;
  public executiveSummary: string;
  public prefixSectionText: string;
  public postfixSectionText: string;

  constructor(userData: any) {
    super(userData);
    this.version = getAutoCompleteOption(
      ReportTemplateFileVersion,
      userData.version
    );
    this.executiveSummary = userData.executive_summary ?? "";
    this.prefixSectionText = userData.prefix_section_text ?? "";
    this.postfixSectionText = userData.postfix_section_text ?? "";
  }
}

/*
 * Contains the content of the Overview tab of the Reports page component.
 */
export class ReportOverviewRead extends ReportGeneralRead {
  public reportLanguage?: ReportLanguageLookup;
  public reportTemplate?: ReportTemplate;

  constructor(userData: any) {
    super(userData);
    this.reportLanguage = new ReportLanguageLookup(userData.report_language);
    this.reportTemplate = new ReportTemplate(userData.report_template_details);
  }
}

/*
 * Contains the content of the Testing tab of the Reports page component.
 */
export class ReportTestingRead extends ReportGeneralRead {
  public structure: any;
  public report_template: ReportTemplate;
  public report_language: ReportLanguageLookup;

  constructor(userData: any) {
    super(userData);
    this.structure = userData.structure;
    this.report_language = new ReportLanguageLookup(userData.report_language);
    this.report_template = new ReportTemplate(userData.report_template_details);
  }
}

export class ReportUpdate extends ModelBase {
  public version: AutoCompleteOption | null;
  public executive_summary: string;
  public prefix_section_text: string;
  public postfix_section_text: string;

  constructor(userData: any) {
    super(userData.id);
    this.version = getAutoCompleteOption(
      ReportTemplateFileVersion,
      userData.version
    );
    this.executive_summary = userData.executive_summary;
    this.prefix_section_text = userData.prefix_section_text;
    this.postfix_section_text = userData.postfix_section_text;
  }
}

export class ReportLookup extends ModelBase {
  public has_pdf: boolean;
  public has_xlsx: boolean;
  public report_template: ReportTemplateLookup;
  public report_language: ReportLanguageLookup;

  constructor(userData: any) {
    super(userData.id);
    this.report_template = new ReportTemplateLookup(userData.report_template);
    this.report_language = new ReportLanguageLookup(userData.report_language);
    this.has_pdf = userData.has_pdf;
    this.has_xlsx = userData.has_xlsx;
  }
}
