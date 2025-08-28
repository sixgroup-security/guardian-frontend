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

import { GridColInputControlProps, ModelBase, NamedModelBase } from "../common";
import {
  CweAbstractionEnum,
  CweMappingEnum,
  CweStatusEnum,
  getEnumNames,
  AutoCompleteOption,
  getAutoCompleteOption,
} from "../enums";
import { URL_TAGS } from "./tag";

// Query keys for CWE weaknesses
export const queryKeyMitreCwe = ["mitre_cwe", "weakness"];

// Query keys for CWE weaknesses lookup tags
export const queryKeyCweWeaknessTagsGeneral = ["mitre_cwe", "weakness", "tags"];

// Country REST API endpoints
const URL_PATH_MITRE_CWE_PREFIX = "/cwe/weakness";
export const URL_MITRE_CWE_VRT = URL_TAGS + URL_PATH_MITRE_CWE_PREFIX;
export const URL_MITRE_CWE_WEAKNESS_LOOKUP = URL_MITRE_CWE_VRT + "/lookup";

// Valid types are: export type GridNativeColTypes = 'string' | 'number' | 'date' | 'dateTime' | 'boolean' | 'singleSelect' | 'actions';
export const COLUMN_DEFINITION: GridColInputControlProps[] = [
  {
    field: "id",
    hideColumn: true,
    controlType: null,
  },
  {
    field: "cwe_id",
    headerName: "ID",
    type: "string",
    // valueOptions: ["P1", "P2", "P3", "P4", "P5", "Varies"],
    description: "The CWE weakness' CWE ID",
    headerAlign: "center",
    align: "center",
    width: 100,
    controlType: null,
  },
  {
    field: "name",
    headerName: "Name",
    type: "string",
    description: "The CWE weakness' name",
    width: 350,
    controlType: null,
  },
  {
    field: "views",
    headerName: "Primary Views",
    type: "multiSelect",
    description:
      "Weaknesses belong to one of the following primary views: Hardware Design, Research Concepts or Software Development",
    headerAlign: "center",
    align: "center",
    width: 150,
    controlType: null,
  },
  {
    field: "categories",
    headerName: "Categories",
    type: "multiSelect",
    description: "All categories belonging to Software Development",
    headerAlign: "center",
    align: "center",
    width: 150,
    controlType: null,
  },
  {
    field: "status",
    headerName: "Status",
    type: "singleSelect",
    valueOptions: getEnumNames(CweStatusEnum),
    description: "The CWE weakness' status",
    headerAlign: "center",
    align: "center",
    width: 150,
    controlType: null,
  },
  {
    field: "mapping",
    headerName: "Mapping",
    type: "singleSelect",
    valueOptions: getEnumNames(CweMappingEnum),
    description:
      "Defines whether/how the weakness can be mapped to real-world vulnerabilities",
    headerAlign: "center",
    align: "center",
    width: 150,
    controlType: null,
  },
  {
    field: "abstraction",
    headerName: "Abstraction",
    type: "singleSelect",
    valueOptions: getEnumNames(CweAbstractionEnum),
    description:
      "Level of generalization used to describe a particular type of software weakness or vulnerability",
    headerAlign: "center",
    align: "center",
    width: 150,
    controlType: null,
  },
  {
    field: "description",
    headerName: "Description",
    type: "string",
    description: "The CWE weakness' description",
    width: 350,
    controlType: null,
  },
  {
    hideColumn: true,
    field: "abstraction_description",
    headerName: "Abstraction Description",
    type: "string",
    width: 100,
    controlType: null,
  },
];

export class CweLookup extends ModelBase {
  public cwe_id: number;
  public label: string;

  constructor(userData: any) {
    super(userData.id);
    this.label = userData.label;
    this.cwe_id = userData.cwe_id;
  }
}

export class CweWeaknessRead extends NamedModelBase {
  public cwe_id: number;
  public status: AutoCompleteOption | null;
  public mapping: AutoCompleteOption | null;
  public abstraction: AutoCompleteOption | null;
  public description: string;
  public views: CweLookup[];
  public categories: CweLookup[];

  constructor(userData: any) {
    super(userData.name, userData.id);
    this.cwe_id = userData.cwe_id;
    this.status = getAutoCompleteOption(CweStatusEnum, userData.status);
    this.mapping = getAutoCompleteOption(CweMappingEnum, userData.mapping);
    this.description = userData.description;
    this.abstraction = getAutoCompleteOption(
      CweAbstractionEnum,
      userData.abstraction
    );
    this.views = userData.views;
    this.categories = userData.categories;
  }
}
