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
import {
  Checkbox as MuiCheckBox,
  FormHelperText,
  FormControl,
  FormControlLabel,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { StateContentTypes } from "../../models/common";

type CheckboxProps = {
  id: string;
  required?: boolean;
  value: boolean | undefined;
  helperText: string;
  errorText?: string;
  readOnly?: boolean;
  error?: boolean;
  label: string;
  onChange: (
    event: React.SyntheticEvent<Element, Event>,
    newValue: StateContentTypes
  ) => void;
};

const Checkbox = React.memo((props: CheckboxProps) => {
  const theme = useTheme();
  const message = props.error ? props.errorText : props.helperText;
  const color = props.error
    ? theme.palette.error.main
    : theme.palette.text.secondary;
  return (
    <FormControl sx={{ color: color }}>
      <FormControlLabel
        required={props.required === true}
        disabled={props.readOnly === true}
        label={props.label}
        control={
          <MuiCheckBox
            size="small"
            sx={{ ml: 1.8, color: color }}
            id={props.id}
            checked={props.value ?? false}
            onChange={props.onChange}
          />
        }
      />
      <FormHelperText sx={{ color: color }}>{message}</FormHelperText>
    </FormControl>
  );
});
export default Checkbox;
