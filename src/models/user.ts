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

import { GridDensity } from "@mui/x-data-grid";
import { URL_PATH_PREFIX } from "../util/consts/common";
import {
  NamedModelBase,
  GridColInputControlProps,
  StateContentTypes,
  isValidString,
  isNonEmptyArray,
  getSingleAutoCompleteEnumId,
  isValidBoolean,
  getBoolean,
  isValidDate,
} from "./common";
import {
  UserRole,
  AutoCompleteEnumType,
  MainPages,
  getEnumNames,
  getAutoCompleteOption,
} from "./enums";
import { ReportLanguageLookup } from "./reportLanguage";
import { CUSTOMER_TITLE_NAME } from "../util/consts/common";

// Query keys for users
export const queryKeyUsers = ["users"];
export const queryKeyUserMe = ["userMe"];
export const queryKeyUserMeNotifications = ["userMe", "notifications"];
export const queryKeyUserMeApiPermissions = ["userMe", "api-permissions"];
export const queryKeyUserMeSettings = ["userSettings"];
export const queryKeyManagers = ["users", "managers"];
export const queryKeyPenTesters = ["users", "pentesters"];

// REST API endpoints for users
const URL_PATH_USERS_PREFIX = URL_PATH_PREFIX + "/users";
export const URL_USERS_ME = URL_PATH_USERS_PREFIX + "/me";
export const URL_USERS_ME_SETTINGS = URL_USERS_ME + "/settings";
export const URL_USERS_ME_LIGHTMODE = URL_USERS_ME_SETTINGS + "/lightmode";
export const URL_USERS_ME_TOGGLE_MENU = URL_USERS_ME_SETTINGS + "/toggle-menu";
export const URL_USERS_ME_TABLE_DENSITY =
  URL_USERS_ME_SETTINGS + "/table-density";
export const URL_USERS_ME_REPORT_LANGUAGE =
  URL_USERS_ME_SETTINGS + "/report-language";
export const URL_USERS_ME_AVATAR = URL_USERS_ME_SETTINGS + "/avatar";
export const URL_USERS_ME_SELECTED_YEAR =
  URL_USERS_ME_SETTINGS + "/selected-year";
export const URL_MANAGERS = URL_PATH_USERS_PREFIX + "/managers";
export const URL_PENTESTERS = URL_PATH_USERS_PREFIX + "/pentesters";
export const URL_USERS = URL_PATH_USERS_PREFIX;
// Notifications
export const URL_ME_NOTIFICATIONS = URL_USERS_ME + "/notifications";
export const URL_ME_API_PERMISSIONS = URL_USERS_ME + "/api-permissions";

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
    description: "The name of the user.",
    errorText: "This field is required and cannot be empty.",
    width: 250,
    controlType: "TextField",
    required: true,
    isValid(value: StateContentTypes) {
      return isValidString(value);
    },
  },
  {
    field: "email",
    headerName: "Email",
    type: "string",
    description: "The user's email address.",
    errorText: "This field must be a valid email address and cannot be empty.",
    width: 250,
    controlType: "TextField",
    required: true,
    isValid(value: StateContentTypes) {
      // Create a regex for email validation
      return RegExp("^[a-zA-Z0-9._:$!%-]+@[a-zA-Z0-9.-]+.[a-zA-Z]$").test(
        value?.toString() ?? ""
      );
    },
  },
  {
    field: "locked",
    headerName: "Locked",
    type: "boolean",
    description: "Defines whether the user is locked.",
    errorText: "The checkbox is currently undefined. Check or uncheck it.",
    headerAlign: "center",
    align: "center",
    width: 100,
    controlType: "Switch",
    required: true,
    isValid(value: StateContentTypes) {
      return isValidBoolean(value);
    },
    getFinalValue(value: StateContentTypes) {
      return getBoolean(value);
    },
  },
  {
    field: "show_in_dropdowns",
    headerName: "Show Dropdown",
    type: "boolean",
    description: "Defines whether the user is displayed in dropdown menus.",
    errorText: "The checkbox is currently undefined. Check or uncheck it.",
    headerAlign: "center",
    align: "center",
    width: 100,
    controlType: "Switch",
    required: true,
    isValid(value: StateContentTypes) {
      return isValidBoolean(value);
    },
    getFinalValue(value: StateContentTypes) {
      return getBoolean(value);
    },
  },
  {
    field: "roles",
    headerName: "Roles",
    type: "singleSelect",
    valueOptions: getEnumNames(UserRole),
    description: "The user's role memberships.",
    errorText: "Select at least of role.",
    headerAlign: "center",
    align: "center",
    width: 200,
    controlType: "Autocomplete",
    required: true,
    multiSelect: true,
    isValid(value: StateContentTypes) {
      return isNonEmptyArray(value);
    },
    getFinalValue(value: StateContentTypes) {
      return getSingleAutoCompleteEnumId(value);
    },
  },
  {
    field: "active_from",
    headerName: "Active From",
    type: "date",
    description: "The date from which onward the account can be used.",
    errorText: "This field is required and must contain a valid date.",
    controlType: "DatePicker",
    required: true,
    isValid(value: StateContentTypes) {
      return isValidDate(value);
    },
  },
  {
    field: "active_until",
    headerName: "Expires",
    type: "date",
    description: "The date the account expires.",
    errorText: "This field must contain a valid date.",
    controlType: "DatePicker",
  },
  {
    field: "customer",
    headerName: CUSTOMER_TITLE_NAME,
    type: "string",
    description: `The ${CUSTOMER_TITLE_NAME} the user is working for.`,
    width: 200,
    controlType: "Autocomplete",
    required: false,
    getFinalValue(value: StateContentTypes) {
      return getSingleAutoCompleteEnumId(value);
    },
  },
  {
    field: "provider",
    headerName: "Provider",
    type: "string",
    description: "The service provider the user is working for.",
    width: 200,
    controlType: "Autocomplete",
    getFinalValue(value: StateContentTypes) {
      return getSingleAutoCompleteEnumId(value);
    },
  },
  {
    field: "last_login",
    headerName: "Last Login",
    type: "dateTime",
    description: "The date [UTC] the user logged in the last time.",
    width: 200,
    controlType: "DatePicker",
  },
];

export class SelectedYear {
  year: string;
  constructor(year: string) {
    this.year = year;
  }
}

export class UserLookup {
  public id: string;
  public label: string;

  constructor(userData: any) {
    this.id = userData.id;
    this.label = userData.full_name;
  }
}

export class UserRead extends NamedModelBase {
  email: string;
  roles: UserRole[];
  locked: boolean;
  show_in_dropdowns: boolean;
  active_from: Date | null;
  active_until: Date | null;
  last_login: Date | null;
  customer?: AutoCompleteEnumType;
  provider?: AutoCompleteEnumType;

  constructor(userData: any) {
    super(userData.full_name, userData.id);
    this.email = userData.email;
    this.roles =
      userData.roles?.map((x: UserRole) =>
        getAutoCompleteOption(UserRole, x)
      ) ?? [];
    this.locked = userData.locked;
    this.show_in_dropdowns = userData.show_in_dropdowns;
    this.active_from = userData.active_from
      ? new Date(userData.active_from)
      : null;
    this.active_until = userData.active_until
      ? new Date(userData.active_until)
      : null;
    this.last_login = userData.last_login
      ? new Date(userData.last_login)
      : null;
    this.customer = userData.customer;
    this.provider = userData.provider;
  }
}

export class Notification extends NamedModelBase {
  public message: string;
  public date: Date;
  public read: boolean;

  constructor(notificationData: any) {
    super(notificationData.subject, notificationData.id);
    const createdAt =
      notificationData.created_at.replace(/(\.\d{3})\d*/, "$1") + "Z";
    this.message = notificationData.message;
    this.date = new Date(createdAt);
    this.read = notificationData.read;
  }
}

export class User extends UserRead {
  private _roles: number[];
  lightMode: boolean;
  has_avatar: boolean;
  toggle_menu: boolean;
  table_density: GridDensity;
  selected_year: string;
  report_language?: ReportLanguageLookup | null;

  constructor(userData: any) {
    super(userData);
    if (userData instanceof User || userData instanceof UserRead)
      throw new Error("userData is already a User object.");
    this._roles = userData.roles;
    this.lightMode = userData.light_mode;
    this.has_avatar = userData.has_avatar;
    this.toggle_menu = userData.toggle_menu;
    this.table_density = userData.table_density;
    this.selected_year = userData.selected_year;
    this.report_language = userData.report_language
      ? new ReportLanguageLookup(userData.report_language)
      : null;
  }

  isAdmin() {
    return this._roles.includes(UserRole.Admin);
  }

  isAuditor() {
    return this._roles.includes(UserRole.Auditor);
  }

  isCustomer() {
    return this._roles.includes(UserRole.Customer);
  }

  isManager() {
    return this._roles.includes(UserRole.Manager);
  }

  isPenTester() {
    return this._roles.includes(UserRole.Pentester);
  }

  isSeniorPenTester() {
    return this._roles.includes(UserRole.Leadpentester);
  }

  hasAccess(page: MainPages) {
    return this.hasReadAccess(page);
  }

  hasReadAccess(page: MainPages) {
    return (
      (this.isAdmin() &&
        ![MainPages.Dashboard, MainPages.Calendar].includes(page)) ||
      ((this.isManager() || this.isAuditor()) &&
        [
          MainPages.Applications,
          MainPages.ApplicationProjects,
          // MainPages.Dashboard,
          // MainPages.Calendar,
          MainPages.Customers,
          MainPages.PdfPenTestReport,
          MainPages.XlsxPenTestReport,
          MainPages.Projects,
          MainPages.ProjectAccess,
          MainPages.Providers,
          MainPages.Users,
          MainPages.AccessTokens,
        ].includes(page)) ||
      (this.isCustomer() &&
        [
          MainPages.Applications,
          MainPages.ApplicationProjects,
          MainPages.Customers,
          // MainPages.PenTestReport,
          MainPages.Projects,
          MainPages.Providers,
        ].includes(page))
    );
  }

  hasWriteAccess(page: MainPages) {
    return (
      this.isAdmin() ||
      (this.isManager() &&
        [MainPages.Projects, MainPages.AccessTokens, MainPages.Applications].includes(page)) ||
      (this.isPenTester() && [MainPages.Reports].includes(page)) ||
      (this.isSeniorPenTester() && [MainPages.Reports].includes(page))
    );
  }

  hasCreateAccess(page: MainPages) {
    return (
      this.isAdmin() ||
      (this.isManager() &&
        [MainPages.Projects, MainPages.AccessTokens].includes(page)) ||
      (this.isPenTester() && [MainPages.Reports].includes(page)) ||
      (this.isSeniorPenTester() && [MainPages.Reports].includes(page))
    );
  }

  hasDeleteAccess(page: MainPages) {
    return (
      this.isAdmin() ||
      (this.isManager() && [MainPages.AccessTokens].includes(page)) ||
      (this.isSeniorPenTester() && [MainPages.Measures].includes(page))
    );
  }
}
