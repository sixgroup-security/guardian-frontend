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
  Dialog,
  DialogActions,
  Button,
  DialogContent,
  Portal,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { PdfViewerContext } from "../../../../util/hooks/usePdfViewerDialog";

export interface PdfViewerProps {
  context: PdfViewerContext;
}

const PdfViewer = React.memo(({ context }: PdfViewerProps) => {
  return (
    <Portal container={document.getElementById("dialog")}>
      <Dialog
        open={context.pdfViewer?.open === true}
        disableEscapeKeyDown={false}
        fullWidth
        fullScreen
        maxWidth="xl"
        PaperProps={{
          style: {
            minHeight: "90%",
            maxHeight: "90%",
            display: "flex",
            flexDirection: "column",
            width: "80vw",
            height: "80vh",
          },
        }}
        onClose={context.pdfViewerCloseHandler}
      >
        <DialogContent
          style={{
            padding: 0,
          }}
        >
          <iframe
            title="PDF Viewer"
            src={context.pdfViewer?.pdf}
            width="100%"
            height="100%"
            style={{ border: 0 }} // added to remove default border
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={context.pdfViewerCloseHandler}
            startIcon={<CloseIcon />}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Portal>
  );
});

export default PdfViewer;
