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
  TextField as MuiTextField,
  TextFieldProps as MuiTextFieldProps,
} from "@mui/material";

interface TextFieldProps {
  errorText?: string;
  readOnly?: boolean;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

const TextField: React.FC<TextFieldProps & MuiTextFieldProps> = React.memo(
  (props) => {
    const {
      helperText,
      errorText,
      readOnly,
      startAdornment,
      endAdornment,
      ...textFieldProps
    } = props;
    return (
      <MuiTextField
        {...textFieldProps}
        disabled={readOnly}
        helperText={props.error ? errorText : helperText}
        InputProps={{
          startAdornment: startAdornment,
          endAdornment: endAdornment,
        }}
      />
    );
  }
);

export default TextField;
