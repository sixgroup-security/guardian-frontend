import { URL_PATH_PREFIX } from "../util/consts/common";
import {
  GridColInputControlProps,
  StateContentTypes,
  isValidString,
  getArrayAutoCompleteEnumId,
  isNonEmptyArray,
  NamedModelBase,
} from "./common";
import { TagLookup } from "./tagging/tag";
import { queryKeyUserMeApiPermissions, URL_ME_API_PERMISSIONS } from "./user";

// Query keys for scopes
export const queryKeyAccessTokens = ["token"];
export const URL_ACCESS_TOKENS = URL_PATH_PREFIX + "/tokens";
export const URL_TOKEN_SCOPES = URL_ACCESS_TOKENS;
export const URL_TOKEN_LOOKUP = URL_ACCESS_TOKENS + "/lookup";

export const COLUMN_DEFINITION: GridColInputControlProps[] = [
  {
    field: "id",
    hideColumn: true,
    controlType: null,
  },
  {
    field: "value",
    headerName: "Access Token",
    type: "string",
    hideColumn: true,
    description:
      "The access token to be used for authentication. This is the only time you can copy it.",
    controlType: "TextField",
    noSubmit: true,
  },
  {
    field: "name",
    headerName: "Name",
    type: "string",
    required: true,
    description: "The name associated with the JWT.",
    errorText: "This field is required and cannot be empty.",
    controlType: "TextField",
    isValid(value: StateContentTypes) {
      return isValidString(value);
    },
  },
  {
    field: "revoked",
    headerName: "Revoked",
    type: "boolean",
    description: "Whether the JWT is revoked.",
    errorText: "The checkbox is currently undefined. Check or uncheck it.",
    controlType: "Checkbox",
  },
  {
    field: "expiration",
    headerName: "Expiration",
    type: "dateTime",
    required: true,
    description:
      "The expiration date of the JWT. The date must be in the future.",
    errorText: "This field must be a valid future data and cannot be empty.",
    controlType: "DatePicker",
    isValid(value: StateContentTypes) {
      return value > new Date();
    },
  },
  {
    field: "scope",
    headerName: "Scope",
    type: "string",
    description: "The access token's permissions.",
    errorText: "This field is required and cannot be empty.",
    width: 150,
    controlType: "Autocomplete",
    hideColumn: true,
    apiEndpoint: URL_ME_API_PERMISSIONS,
    queryKey: queryKeyUserMeApiPermissions,
    freeSolo: false,
    multiSelect: true,
    isValid(value: StateContentTypes) {
      return isNonEmptyArray(value);
    },
    getFinalValue(value: StateContentTypes) {
      return getArrayAutoCompleteEnumId(value);
    },
  },
  {
    field: "created_at",
    headerName: "Created At",
    type: "dateTime",
    description: "The date when the JWT was created.",
    controlType: "DatePicker",
    readonly: true,
    noSubmit: true,
  },
];

// JsonWebToken Model
export class AccessToken extends NamedModelBase {
  public revoked: boolean;
  public expiration: Date;
  public scope: TagLookup[];
  public created_at: Date;

  constructor(userData: any) {
    super(userData.name, userData.id);
    this.revoked = userData.revoked;
    this.expiration = new Date(userData.expiration);
    this.scope = userData.scope ?? [];
    this.created_at = new Date(userData.created_at);
  }
}
