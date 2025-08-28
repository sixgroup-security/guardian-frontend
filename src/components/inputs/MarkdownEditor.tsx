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

import React from "react";
import {
  TextField,
  Stack,
  Paper,
  Box,
  AlertColor,
  TextFieldProps as MuiTextFieldProps,
  IconButton,
  Dialog,
  DialogContent,
  Tooltip,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import CodeIcon from "@mui/icons-material/Code";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import BorderAllIcon from "@mui/icons-material/BorderAll";
import TableChartIcon from "@mui/icons-material/TableChart";
import Divider, { dividerClasses } from "@mui/material/Divider";
import { styled } from "@mui/material/styles";
import SnackbarAlert from "../feedback/snackbar/SnackbarAlert";
import MarkdownField from "./MarkdownField";
import { OnChangeEventType } from "../../util/hooks/usePageManager";
import { StateContentTypes } from "../../models/common";
import { env } from "../../util/consts/common";

const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  // https://mui.com/system/spacing/
  paddingLeft: theme.spacing(2),
  color: theme.palette.text.secondary,
}));

type SubmissionErrorType = { severity?: AlertColor; message?: string };
const initialError: SubmissionErrorType = {
  severity: undefined,
  message: undefined,
};

const templateListing = `
\`\`\`{caption="Interesting HTML code." .html .numberLines startFrom="1" #lst:html}
<html>
    <body>
        <head>Hello</head>
    </body>
</html>
\`\`\`
`;

const templateMarkdownTable = `
| **Ref.** | **Column 1** | **Column 2** |
| - | -- | -- |
| 1 | Cell 1 | Cell 2 |
| 2 | Cell 3 | Cell 4 |

Table: TODO\\label{tbl:TODO}
`;

const templateLatexTable = `
\\begin{longtable}{p{1cm} p{7.9cm} p{7.9cm}}
\\caption{TODO\\label{tbl:TODO}}\\hline
\\textbf{Ref.} & \\textbf{Column 1} & \\textbf{Column 2} \\\\\\hline
1 & Cell 1 & Cell 2 \\\\\\hline
2 & Cell 3 & Cell 4 \\\\\\hline
\\end{longtable}
`;

const DEFAULT_MODE = "SplitPopout";
export type MarkdownEditorMode = "Plain" | "Split" | "Popout" | "SplitPopout";

export interface MarkdownProps {
  errorText?: string;
  readOnly?: boolean;
  uploadUrl?: string;
  // If set to true, then a \label{} will be inserted at the end of an image's caption.
  insertLabel?: boolean;
  mode?: MarkdownEditorMode;
  onChange: (
    event: OnChangeEventType,
    newValue?: StateContentTypes | null
  ) => void;
  maxHeight?: string;
}

export interface PopOutDialogProps extends MarkdownProps {
  open: boolean;
  onClose: () => void;
}

const TooltipIconButton = React.memo(
  (props: {
    toolTip: string;
    arialLabel: string;
    ml?: string;
    mr?: string;
    onClick: () => void;
    Icon: any;
  }) => {
    const { toolTip, arialLabel, ml, mr, onClick, Icon } = props;
    return (
      <Tooltip title={toolTip}>
        <IconButton
          size="small"
          aria-label={arialLabel}
          sx={{ ml, mr }}
          onClick={onClick}
        >
          {Icon}
        </IconButton>
      </Tooltip>
    );
  }
);

const MarkdownEditorDialog: React.FC<PopOutDialogProps & MuiTextFieldProps> =
  React.memo((props) => {
    const { onClose, open, mode, minRows, maxRows, maxHeight, ...newProps } = {
      ...props,
    };

    const insertListing = React.useCallback(
      () => document.execCommand("insertText", false, templateListing),
      []
    );
    const insertMarkdownTable = React.useCallback(
      () => document.execCommand("insertText", false, templateMarkdownTable),
      []
    );
    const insertLatexTable = React.useCallback(
      () => document.execCommand("insertText", false, templateLatexTable),
      []
    );

    return (
      <Dialog
        open={open}
        maxWidth="xl"
        fullWidth
        fullScreen
        onClose={onClose}
        scroll="paper"
        PaperProps={{
          style: {
            minHeight: "90%",
            maxHeight: "90%",
            display: "flex",
            flexDirection: "column",
            width: "90vw",
            height: "80vh",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            color: "text.secondary",
            "& svg": {
              m: 1,
            },
            [`& .${dividerClasses.root}`]: {
              mx: 0.5,
            },
          }}
        >
          <TooltipIconButton
            toolTip="Insert code listing"
            arialLabel="insert-listing"
            ml="20px"
            Icon={<CodeIcon />}
            onClick={insertListing}
          />
          <Divider orientation="vertical" flexItem />
          <TooltipIconButton
            toolTip="Insert Markdown table"
            arialLabel="insert-markdown-table"
            Icon={<BorderAllIcon />}
            onClick={insertMarkdownTable}
          />
          <TooltipIconButton
            toolTip="Insert Latex table"
            arialLabel="insert-latex-table"
            Icon={<TableChartIcon />}
            onClick={insertLatexTable}
          />
          <Box sx={{ flexGrow: 1 }} />
          <TooltipIconButton
            toolTip="Open documentation guidelines"
            arialLabel="documentation-guidelines"
            Icon={<InfoIcon />}
            onClick={() =>
              window.open(env.VITE_REPORTING_GUIDELINE_URL, "_blank")
            }
          />
          <TooltipIconButton
            toolTip="Close dialog"
            arialLabel="close-dialog"
            Icon={<CloseIcon />}
            mr="20px"
            onClick={onClose}
          />
        </Box>
        <DialogContent
          sx={{
            flex: 1, // Allow the content to take up the remaining height
            overflow: "auto", // Enable scrolling if content overflows
          }}
        >
          <MarkdownEditor mode="Split" maxHeight="75vh" {...newProps} />
        </DialogContent>
      </Dialog>
    );
  });

const MarkdownEditor: React.FC<MarkdownProps & MuiTextFieldProps> = React.memo(
  (props) => {
    const {
      helperText,
      errorText,
      readOnly,
      uploadUrl,
      label,
      onChange,
      onBlur,
      minRows,
      maxRows,
      insertLabel,
      maxHeight,
      mode,
      ...textFieldProps
    } = props;
    const [showDialog, setShowDialog] = React.useState(false);
    const [error, setError] = React.useState(initialError);
    const ref = React.useRef<{
      value: any;
      selectionStart: number;
      selectionEnd: number;
    }>();
    const displayRendering = React.useMemo(
      () => ["Split", "SplitPopout"].includes(mode ?? DEFAULT_MODE),
      [mode]
    );
    const finalMinRows = maxHeight ? undefined : minRows;
    const finalMaxRows = maxHeight ? undefined : maxRows;

    /*
     * Uploads the given image to the server and returns the URL to the uploaded image.
     */
    const uploadImage = React.useCallback(
      async (image: File) => {
        if (!uploadUrl) return null;
        const formData = new FormData();
        formData.append("file", image);

        try {
          const response = await fetch(uploadUrl, {
            method: "POST",
            body: formData,
          });
          if (!response.ok) throw new Error("Failed to upload file");

          const json = await response.json();
          return {
            url: `${uploadUrl}/${json.id}`,
            reference: json.reference,
          };
        } catch {
          setError({ message: "Could not upload file", severity: "error" });
          return null;
        }
      },
      [uploadUrl]
    );

    const insertText = React.useCallback((text: string) => {
      if (!text) return;
      if (document.execCommand) {
        document.execCommand("insertText", false, text);
      } else {
        setError({
          message: "Pasting not supported by browser.",
          severity: "error",
        });
      }
    }, []);

    const handlePaste = React.useCallback(
      (
        event:
          | React.DragEvent<HTMLDivElement>
          | React.ClipboardEvent<HTMLDivElement>
      ) => {
        let files: File[] = [];
        event.preventDefault();
        // Obtain list of File objects by handling both drag-and-drop and paste events.
        if (event.type === "drop") {
          files = Array.from(
            (event as React.DragEvent<HTMLDivElement>).dataTransfer.files
          );
        } else {
          const items = (event as React.ClipboardEvent<HTMLDivElement>)
            .clipboardData.items;
          for (const item of items) {
            if (item.type.startsWith("image")) {
              const file = item.getAsFile();
              if (file) files.push(file);
            } else if (item.type == "text/plain") {
              insertText(
                (
                  event as React.ClipboardEvent<HTMLDivElement>
                ).clipboardData.getData("text/plain")
              );
            }
          }
        }

        // Upload the images and insert the URLs into the editor.
        if (uploadUrl) {
          files.forEach((file) => {
            uploadImage(file).then((result) => {
              if (result) {
                const label = insertLabel
                  ? `\\label{fig:${result.reference}}`
                  : "";
                const text = `![${label}](${result.url}?w=)`;
                if (insertLabel) {
                  navigator.clipboard.writeText(
                    `\\ref{fig:${result.reference}}`
                  );
                }
                insertText(text);
              }
            });
          });
        } else {
          // TODO: Notify user that images cannot be uploaded.
          // TODO: You can use custom hook useDataSubmission together with the SnackbarAlertv2 component.
        }
      },
      [uploadUrl, insertLabel, uploadImage, insertText]
    );

    const clickShowDialogHandler = React.useCallback(
      () => setShowDialog(() => true),
      []
    );
    const clickCloseDialogHandler = React.useCallback(
      () => setShowDialog(() => false),
      []
    );
    const endAdornment = React.useMemo(
      () =>
        ["Popout", "SplitPopout"].includes(mode ?? DEFAULT_MODE) && (
          <IconButton aria-label="Pop out" onClick={clickShowDialogHandler}>
            <OpenInNewIcon />
          </IconButton>
        ),
      [mode, clickShowDialogHandler]
    );
    const inputPropsStyle = React.useMemo(() => {
      const result: React.CSSProperties = {
        fontSize: 14,
        fontFamily: "monospace",
      };
      if (maxHeight) {
        result.height = maxHeight;
        result.maxHeight = maxHeight;
        result.overflow = "auto";
      }
      return result;
    }, [maxHeight]);

    return (
      <>
        <SnackbarAlert
          severity={error.severity}
          message={error.message}
          resetFn={() => setError(initialError)}
        />
        <MarkdownEditorDialog
          open={showDialog}
          onClose={clickCloseDialogHandler}
          {...props}
        />
        <Box sx={{ mt: 1, mb: 1, width: "100%" }}>
          <Stack spacing={2} direction="row">
            <TextField
              multiline
              label={
                label + (uploadUrl ? " (drag-and-drop or paste images)" : "")
              }
              disabled={readOnly}
              inputRef={ref}
              {...textFieldProps}
              helperText={props.error ? errorText : helperText}
              inputProps={{
                style: inputPropsStyle,
              }}
              onChange={onChange}
              onBlur={onBlur}
              minRows={finalMinRows}
              maxRows={finalMaxRows}
              sx={{
                m: 2,
                width: displayRendering ?? true ? "50%" : "100%",
              }}
              onPaste={handlePaste}
              onDrop={handlePaste}
              InputProps={{
                endAdornment,
              }}
            />
            {(displayRendering ?? true) && (
              <Item sx={{ width: "50%", height: "inherit" }}>
                <MarkdownField
                  content={props.value?.toString() ?? ""}
                  maxHeight={maxHeight}
                />
              </Item>
            )}
          </Stack>
        </Box>
      </>
    );
  }
);

export default MarkdownEditor;
