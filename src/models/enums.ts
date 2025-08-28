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

import { CUSTOMER_TITLE_NAME } from "../util/consts/common";

export type AutoCompleteEnumType = {
  id: number;
  label?: string;
  name?: string;
  app_id?: string;
};

export type AutoCompleteOption = {
  id: number;
  label: string;
};

export enum DetailsDialogMode {
  View,
  Create,
  Edit,
}

export enum TokenType {
  User = 1,
  API = 2,
}

export enum MainPages {
  Dashboard = "c33e5130-b9ca-4cc2-975a-bc4baec576b0",
  Projects = "6487d587-90a7-4da4-a180-e142bb4e7fae",
  Reports = "b421dd4f-19a9-4cbd-bfaa-53ee4ee27248",
  Applications = "8a681213-3e82-47b9-bdc6-724daf439f2a",
  ApplicationProjects = "cf30fb1c-97ba-4063-aee1-28d13dff6050",
  ReportLanguages = "5389527d-592c-4297-ad56-8b59f5cd3ac1",
  Measures = "2f36fb50-8920-4365-8b65-5a9535df43e3",
  TestProcedures = "024b28be-e613-4579-ac9e-3b6dcfa67af6",
  Ratings = "ae7b8e69-992c-4151-ba2c-72cbe9bc8a88",
  TestGuide = "161d2393-f52e-47d8-aa79-7671af872848",
  Users = "752e8fef-8074-4900-8f03-e0758c30c8f4",
  ReportTemplates = "de3da65b-eac0-4dd0-9f52-25f83da9c889",
  Vulnerability = "5364c198-e352-47ea-963d-c1e22f86a735",
  VulnerabilityTemplates = "8fe56a0e-0baf-490a-bd09-1ce7c900b707",
  Providers = "6849d75d-2e11-4201-9f8b-3c615b8b1de7",
  VulnerabilityMeasure = "8ecb5999-b234-42e1-82dd-3fb034c74051",
  Customers = "84124a92-6c67-40f4-bb41-9b224289713f",
  Calendar = "b2824417-9620-4170-b030-dd6b7f83d126",
  ReportVersion = "1c43bbc7-0d32-4841-b37f-8993a6906c7b",
  PenTestReport = "b0ca4b52-6843-4979-a15f-53748b6f791f",
  PdfPenTestReport = "c7e6ec5a-84ec-479c-839b-fd43e63c7184",
  XlsxPenTestReport = "34990dfa-0000-4faa-9a15-6b225ee2e7d",
  ProjectAccess = "c209691b-77d9-4195-bec1-56607ff1f6b8",
  WebSockets = "be542639-e338-4bcc-a561-c5fc2be86a0e",
  BugCrowdVrt = "881a511a-b9ae-4e5e-b0ba-609444ec781f",
  MitreCwe = "070dad11-fcb6-4102-a30d-a076d27374eb",
  ReportScope = "f3a0d2bd-90e5-442b-9423-fd218cb5001b",
  AccessTokens = "fedf5518-419d-4bac-97e6-002514a5156b",
}

export const getPageTitle = (pageType: MainPages) => {
  switch (pageType) {
    case MainPages.Dashboard:
      return "dashboard";
    case MainPages.Projects:
      return "project";
    case MainPages.Applications:
      return "application";
    case MainPages.ReportLanguages:
      return "report language";
    case MainPages.Measures:
      return "measure";
    case MainPages.TestProcedures:
      return "test procedure";
    case MainPages.Ratings:
      return "rating";
    case MainPages.TestGuide:
      return "test guide";
    case MainPages.Users:
      return "user";
    case MainPages.Providers:
      return "provider";
    case MainPages.Customers:
      return CUSTOMER_TITLE_NAME.toLowerCase();
    case MainPages.ReportTemplates:
      return "report template";
    case MainPages.VulnerabilityTemplates:
      return "vulnerability";
    case MainPages.ReportVersion:
      return "report version";
    case MainPages.ReportScope:
      return "report scope";
    case MainPages.AccessTokens:
      return "access token";
    default:
      throw new Error("Unknown page type: " + pageType);
  }
};

export enum UserRole {
  Admin = 100,
  Auditor = 200,
  Manager = 300,
  Leadpentester = 400,
  Pentester = 500,
  Customer = 600,
}

export enum ApplicationState {
  Planned = 0,
  Development = 10,
  Production = 20,
  Decomissioned = 30,
}

export enum OverdueType {
  No_Overdue = 10,
  Ongoing_Project = 20,
  No_Project = 30,
}

export enum PeriodicityParameterType {
  Manual = 10,
  Out_of_Scope = 20,
  Decommissioned = 100,
}

export enum ProjectType {
  Attack_Modelling = 10,
  Bug_Bounty = 20,
  Red_Team_Exercise = 30,
  Penetration_Test = 40,
  Purple_Team_Exercise = 50,
  Security_Assessment = 60,
}

export enum ProjectState {
  Backlog = 10,
  Planning = 20,
  Scheduled = 25,
  Running = 30,
  Reporting = 40,
  Completed = 50,
  Cancelled = 60,
  Archived = 70,
}

export enum EntityType {
  Customer = 0,
  Provider = 10,
}

export enum SeverityType {
  Unknown = -1,
  Info = 0,
  Low = 10,
  Medium = 20,
  High = 30,
  Critical = 40,
}

export enum CweStatusEnum {
  Draft = 10,
  Stable = 20,
  Deprecated = 30,
  Incomplete = 40,
}

export enum CweMappingEnum {
  Allowed = 10,
  Prohibited = 20,
  Discouraged = 30,
  Allowed_with_Review = 40,
}

export enum CweAbstractionEnum {
  Base = 10,
  Variant = 20,
  Class = 30,
  Pillar = 40,
  Compound = 50,
}

export const getSeverityValue = (name: string): SeverityType | undefined => {
  return SeverityType[name as keyof typeof SeverityType];
};

export enum ProcedureStatus {
  Pending = 0,
  Not_Applicable = 10,
  Work_in_Progress = 20,
  Not_Tested = 30,
  Review = 40,
  Completed = 50,
}

export enum ReportScopeView {
  Internal = 10,
  External = 20,
}

export enum AssetType {
  Domain = 10,
  Email_Address = 20,
  Hostname = 30,
  IP_Address = 40,
  Network_Range = 50,
  URL = 60,
  Other = 70,
}

export enum EnvironmentType {
  Development = 10,
  Testing = 20,
  Staging = 30,
  Integration = 40,
  Quality = 50,
  Production = 60,
}

export enum TemplateStatus {
  Draft = 0,
  Review = 10,
  Final = 20,
}

export enum VulnerabilityStatus {
  Draft = 0,
  Review = 10,
  Final = 20,
  Resolved = 100,
  Hide = 110,
}

export enum ProcedurePriority {
  Optional = 0,
  Nice_To_Have = 10,
  Mandatory = 20,
}

export enum ReportVersionStatus {
  Draft = 0,
  Final = 10,
}

export enum ReportCreationStatus {
  Scheduled = 5,
  Generating = 10,
  Successful = 20,
  Failed = 30,
}

export enum ApplicationSyncState {
  Successful = 0,
  Not_Synched = 10,
  Failed = 20,
}

export enum ApplicationAssessmentThisYearType {
  Nothing_Scheduled = 0,
  Scheduled = 50,
  Completed = 100,
}

export enum ReportTemplateFileVersion {
  v1 = 10,
}

type EnumTypes =
  | typeof UserRole
  | typeof ProjectType
  | typeof ProjectState
  | typeof ApplicationState
  | typeof OverdueType
  | typeof EntityType
  | typeof SeverityType
  | typeof CweStatusEnum
  | typeof CweMappingEnum
  | typeof CweAbstractionEnum
  | typeof VulnerabilityStatus
  | typeof TemplateStatus
  | typeof ProcedureStatus
  | typeof ReportVersionStatus
  | typeof ReportCreationStatus
  | typeof ReportTemplateFileVersion
  | typeof ReportScopeView
  | typeof AssetType
  | typeof EnvironmentType
  | typeof ApplicationSyncState
  | typeof TokenType
  | typeof PeriodicityParameterType
  | typeof ApplicationAssessmentThisYearType;

export const getAutoCompleteOption = (enumClass: EnumTypes, type?: any) => {
  return typeof type === "number"
    ? { id: type, label: enumClass[type]?.replace(/_/g, " ") ?? "" }
    : type;
};

/*
 * This function returns the names of the enum values.
 */
export const getEnumNames = (enumClass: EnumTypes) => {
  const result = Object.keys(enumClass)
    .filter((item) => isNaN(+item))
    .map((item) => item.replace(/_/g, " "));
  return result;
};

export const getEnumName = (enumClass: EnumTypes, value: number) =>
  enumClass[value]?.replace(/_/g, " ");

export const getEnumObject = (
  enumClass: EnumTypes,
  value: number,
  labelKeyName?: string
) => {
  return {
    id: value,
    [labelKeyName ?? "label"]:
      value in enumClass ? enumClass[value].replace(/_/g, " ") : "",
  };
};

/*
 * This function returns the enum values as an object.
 */
export const getEnumAsObject = (
  enumClass: EnumTypes,
  labelKeyName?: string,
  excludeItems?: number[]
): AutoCompleteEnumType[] => {
  const result = Object.entries(enumClass)
    .filter(
      (item) =>
        !isNaN(+item[0]) &&
        (!excludeItems || !excludeItems.includes(Number(item[0])))
    )
    .map((item) => {
      return {
        [labelKeyName ? labelKeyName : "label"]: item[1].replace(/_/g, " "),
        id: Number(item[0]),
      };
    });
  return result;
};

export const getAutoCompleteOptions = (
  enumClass: EnumTypes
): AutoCompleteOption[] =>
  getEnumAsObject(enumClass, "label") as AutoCompleteOption[];
