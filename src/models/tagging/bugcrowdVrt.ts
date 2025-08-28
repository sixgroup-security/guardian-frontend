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

import { GridColInputControlProps, ModelBase } from "../common";
import { getAutoCompleteOption, getEnumNames, SeverityType } from "../enums";
import { CweLookup } from "./mitreCwe";
import { URL_TAGS } from "./tag";

// Query keys for VRT
export const queryKeyBugcrowdVrt = ["bugcrowd_vrt"];
export const queryKeyBugcrowdVrtLookup = ["bugcrowd_vrt", "lookup"];

// Country REST API endpoints
const URL_PATH_BUGCROWD_VRT_PREFIX = "/vrt";
export const URL_BUGCROWD_VRT = URL_TAGS + URL_PATH_BUGCROWD_VRT_PREFIX;
export const URL_BUGCROWD_VRT_LOOKUP = URL_BUGCROWD_VRT + "/lookup";

// Valid types are: export type GridNativeColTypes = 'string' | 'number' | 'date' | 'dateTime' | 'boolean' | 'singleSelect' | 'actions';
export const COLUMN_DEFINITION: GridColInputControlProps[] = [
  {
    field: "id",
    hideColumn: true,
    controlType: null,
  },
  {
    field: "category_id",
    hideColumn: true,
    controlType: null,
  },
  {
    field: "sub_category_id",
    hideColumn: true,
    controlType: null,
  },
  {
    field: "variant_id",
    hideColumn: true,
    controlType: null,
  },
  {
    field: "priority_str",
    headerName: "Technical Severity",
    type: "singleSelect",
    valueOptions: ["P1", "P2", "P3", "P4", "P5", "Varies"],
    description:
      "The priority represents Bugcrowd's suggested baseline technical severity of the vulnerability on a P1 (Critical) to P5 (Informational) scale.",
    headerAlign: "center",
    align: "center",
    width: 180,
    controlType: null,
  },
  {
    field: "category_name",
    headerName: "Category",
    type: "string",
    description:
      "These comprise the top level of the VRT. They describe entire classes of vulnerabilities. (e.g., Server-Side Injection)",
    width: 300,
    controlType: null,
  },
  {
    field: "sub_category_name",
    headerName: "Sub-Categories",
    type: "string",
    description:
      "Many Sub-Categories are nested within a Category. They describe individual vulnerabilities within a Category. (e.g., SQL Injection)",
    width: 300,
    controlType: null,
  },
  {
    field: "variant_name",
    headerName: "Variants",
    type: "string",
    description:
      "Many Variants are nested within a Sub-Category. They describe specific sub-cases of an individual vulnerability. (e.g., Blind)",
    width: 300,
    controlType: null,
  },
  {
    field: "cvss_base_score",
    headerName: "CVSSv3 Base Score",
    type: "number",
    description:
      "The CVSS Base Score is a metric that represents the intrinsic characteristics of a vulnerability.",
    headerAlign: "center",
    align: "center",
    width: 150,
    controlType: null,
  },
  {
    field: "cvss_base_severity",
    headerName: "CVSSv3 Base Severity",
    type: "singleSelect",
    valueOptions: getEnumNames(SeverityType).filter((x) => x != "Unknown"),
    description:
      "The CVSS severity is derived from the CVSS Base Score. It is CVSS' quantitative metric that represents the severity of a vulnerability.",
    headerAlign: "center",
    align: "center",
    width: 150,
    controlType: null,
  },
  {
    field: "cvss_base_vector",
    headerName: "CVSSv3 Base Vector",
    type: "string",
    description:
      "The CVSS Base Vector is a textual representation of the CVSS Base Score.",
    width: 330,
    controlType: null,
  },
  {
    field: "cwes",
    headerName: "CWEs",
    type: "string",
    description: "List of CWEs that are associated with this vulnerability.",
    width: 330,
    controlType: null,
  },
];

export class VrtLookup extends ModelBase {
  public label: string;

  constructor(userData: any) {
    super(userData.id);
    this.label = userData.label;
  }
}

export class VrtRead extends ModelBase {
  public priority_str: string;
  public category_id: string | null;
  public category_name: string | null;
  public sub_category_id: string | null;
  public sub_category_name: string | null;
  public variant_id: string | null;
  public variant_name: string | null;
  public cvss_base_score: string | null;
  public cvss_base_vector: string | null;
  public cvss_base_severity: { id: SeverityType; label: string } | null;
  public cwes: CweLookup | null;

  constructor(userData: any) {
    super(userData.id);
    this.priority_str = userData.priority_str;
    this.category_id = userData.category_id;
    this.category_name = userData.category_name;
    this.sub_category_id = userData.sub_category_id;
    this.sub_category_name = userData.sub_category_name;
    this.variant_id = userData.variant_id;
    this.variant_name = userData.variant_name;
    this.cvss_base_score = userData.cvss_base_score;
    this.cvss_base_vector = userData.cvss_base_vector;
    this.cvss_base_severity =
      typeof userData.cvss_base_severity === "number"
        ? getAutoCompleteOption(SeverityType, userData.cvss_base_severity)
        : userData.cvss_base_severity;
    this.cwes = userData.cwes;
  }
}
