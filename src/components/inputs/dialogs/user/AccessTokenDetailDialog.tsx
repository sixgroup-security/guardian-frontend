import React, { useEffect } from "react";
import { Grid, IconButton, InputAdornment } from "@mui/material";
import {
  DefaultDetailsDialogProps,
  DetailsDialogv2 as DetailsDialog,
  Item,
} from "../DetailsDialog";
import DetailsDialogPaper from "../../../surfaces/DetailsDialogPager";
import { InputControlFieldWrapperv2 as InputControlFieldWrapper } from "../../InputControlWrapper";
import { CopyAll } from "@mui/icons-material";
import { DetailsDialogMode } from "../../../../models/enums";
import { isOptionEqualToValue } from "../../../../models/common";

const AccessTokenDetailsDialog: React.FC<DefaultDetailsDialogProps> =
  React.memo((props) => {
    const { context } = props;
    const { pageManager, updateContent } = context;
    const copyAccessTokenHandler = React.useCallback(() => {
      navigator.clipboard.writeText(context.pageManager.content.value);
    }, [context.pageManager.content]);

    /**
     * Specifying a scope is mandatory but in edit mode the scope is not displayed anymore. Hence, we need to fake a value.
     */
    useEffect(() => {
      if (pageManager.mode === DetailsDialogMode.Edit) {
        updateContent({ ...pageManager.content, scope: [{}] });
      }
    }, [pageManager.mode, updateContent, pageManager.content]);

    context.pageManager.mode === DetailsDialogMode.Edit;
    return (
      <DetailsDialog disableEscapeKeyDown maxWidth="sm" fullWidth {...props}>
        <DetailsDialogPaper>
          <Grid container spacing={2}>
            {/* Line 1 */}
            <Grid item xs={12}>
              <Item>
                <InputControlFieldWrapper
                  id="name"
                  context={context}
                  readonly={
                    context.pageManager.mode !== DetailsDialogMode.Create
                  }
                />
              </Item>
            </Grid>
            {/* Line 2 */}
            {context.pageManager.mode === DetailsDialogMode.Create && (
              <Grid item xs={12}>
                <Item>
                  <InputControlFieldWrapper
                    id="scope"
                    context={context}
                    readonly={
                      context.pageManager.mode !== DetailsDialogMode.Create
                    }
                    getOptionLabel={(option) => option.name}
                    isOptionEqualToValue={isOptionEqualToValue}
                  />
                </Item>
              </Grid>
            )}
            {/* Line 3 */}
            <Grid item xs={6}>
              <Item>
                <InputControlFieldWrapper
                  id="expiration"
                  context={context}
                  readonly={
                    context.pageManager.mode !== DetailsDialogMode.Create
                  }
                />
              </Item>
            </Grid>
            <Grid item xs={6}>
              <Item>
                <InputControlFieldWrapper
                  id="revoked"
                  context={context}
                  readonly={
                    context.pageManager.mode === DetailsDialogMode.Create
                  }
                />
              </Item>
            </Grid>
            {/* Line 4 - Conditional Rendering of Value with Copy Button */}
            {context.pageManager.content.value && (
              <Grid item xs={12}>
                <Item>
                  <InputControlFieldWrapper
                    id="value"
                    context={context}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="copy"
                          size="small"
                          onClick={copyAccessTokenHandler}
                        >
                          <CopyAll fontSize="inherit" />
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </Item>
              </Grid>
            )}
          </Grid>
        </DetailsDialogPaper>
      </DetailsDialog>
    );
  });

export default AccessTokenDetailsDialog;
