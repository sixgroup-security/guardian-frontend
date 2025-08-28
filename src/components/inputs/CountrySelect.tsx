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
import { Box, InputAdornment } from "@mui/material";
import Autocomplete, { AutocompleteProps } from "./Autocomplete";
import { ReportLanguageLookup } from "../../models/reportLanguage";

interface CountrySelectProps extends AutocompleteProps {
  impageApiEndpoint: string;
  value: ReportLanguageLookup;
}

const CountrySelect: React.FC<CountrySelectProps> = React.memo((props) => {
  const { impageApiEndpoint, ...other } = props;
  return (
    <Autocomplete
      {...other}
      startAdornment={
        props?.value &&
        props.value?.country_code && (
          <InputAdornment position="start">
            <img
              width="30"
              key={"img_" + props.id}
              srcSet={`${impageApiEndpoint}/${props.value.country_code.toLowerCase()} 2x`}
              src={`${impageApiEndpoint}/${props.value.country_code.toLowerCase()}`}
              alt={props.value.toString()}
            />
          </InputAdornment>
        )
      }
      renderOption={(
        props: React.HTMLAttributes<HTMLLIElement>,
        option: ReportLanguageLookup
      ) =>
        option.country_code ? (
          <Box
            component="li"
            key={"box_" + props.id}
            sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
            {...props}
          >
            <img
              loading="lazy"
              width="30"
              key={"img_" + props.id}
              srcSet={
                impageApiEndpoint +
                "/" +
                option.country_code.toLowerCase() +
                " 2x"
              }
              src={impageApiEndpoint + "/" + option.country_code.toLowerCase()}
            />
            {option.name} ({option.country_code})
          </Box>
        ) : null
      }
    />
  );
});

export default CountrySelect;
