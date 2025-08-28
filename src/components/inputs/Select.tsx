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

import React from "react";
import { useTheme } from "@mui/material/styles";
import {
  Select as MuiSelect,
  SelectProps as MuiSelectProps,
  InputLabel,
  FormHelperText,
  FormControl,
  SxProps,
} from "@mui/material";

interface SelectProps extends MuiSelectProps {
  sxFormControl?: SxProps;
  sxInputLabel?: SxProps;
  helperText?: string;
  errorText?: string;
}

const Select: React.FC<SelectProps> = React.memo((props) => {
  const theme = useTheme();
  const {
    sxFormControl,
    sxInputLabel,
    helperText,
    errorText,
    label,
    id,
    readOnly,
    required,
    ...other
  } = props;
  const labelId = `${props.id}-label`;
  const cbLabel = props.required ? `${label} *` : label;
  const message = props.error ? errorText : helperText;
  const sxUpdated: any = {
    ...sxInputLabel,
  };
  if (props.error) {
    sxUpdated["&.MuiInputLabel-outlined"] = {
      color: theme.palette.error.main,
    };
  }

  return (
    <FormControl
      required={required === true}
      color={props.error ? "error" : "primary"}
      sx={sxFormControl}
    >
      <InputLabel id={labelId} sx={sxUpdated}>
        {props.label}
      </InputLabel>
      <MuiSelect
        id={id}
        name={id}
        label={cbLabel}
        color={props.error ? "error" : "primary"}
        disabled={readOnly}
        {...other}
      >
        {props.children}
      </MuiSelect>
      {message && (
        <FormHelperText
          sx={props.error ? { color: theme.palette.error.main } : {}}
        >
          {message}
        </FormHelperText>
      )}
    </FormControl>
  );
});

export default Select;
