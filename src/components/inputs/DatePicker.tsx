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
import { FormHelperText, FormControl } from "@mui/material";
import { DatePicker as MuiDatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  DateValidationError,
  PickerChangeHandlerContext,
} from "@mui/x-date-pickers";

type DatePickerProps = {
  id: string;
  helperText?: string;
  errorText?: string;
  required?: boolean;
  onChange: (
    value: Date | null,
    context: PickerChangeHandlerContext<DateValidationError>
  ) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: boolean;
  value?: Date | null;
  label?: string;
  minDate?: Date;
  maxDate?: Date;
  disablePast?: boolean;
  disableFuture?: boolean;
  format?: string;
  size?: "small" | "medium";
  readOnly: boolean;
};

const DatePicker = React.memo((props: DatePickerProps) => {
  const theme = useTheme();
  const { required, label, helperText, errorText, error, readOnly, ...other } =
    props;
  const datePickerLabel = required ? label + " *" : label;
  return (
    <FormControl sx={{ width: "100%" }}>
      <MuiDatePicker
        slotProps={{
          textField: {
            error,
          },
        }}
        label={datePickerLabel}
        value={props.value ?? new Date()}
        readOnly={readOnly}
        disabled={readOnly}
        {...other}
      />
      <FormHelperText
        sx={props.error ? { color: theme.palette.error.main } : {}}
      >
        {props.error ? errorText : helperText}
      </FormHelperText>
    </FormControl>
  );
});

export default DatePicker;
