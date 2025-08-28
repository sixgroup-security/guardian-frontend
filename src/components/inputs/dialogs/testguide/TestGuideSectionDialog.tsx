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

import {
  DefaultDetailsDialogProps,
  DetailsDialogv2 as DetailsDialog,
} from "../DetailsDialog";
import DetailsDialogPaper from "../../../surfaces/DetailsDialogPager";
import { InputControlFieldWrapperv2 as InputControlFieldWrapper } from "../../InputControlWrapper";

interface TestGuideSectionDialogProps extends DefaultDetailsDialogProps {
  // The REST API endpoint to upload files.
  apiEndpoint?: string;
}

const TestGuideSectionDialog: React.FC<TestGuideSectionDialogProps> = (
  props
) => {
  const { context } = props;
  return (
    <DetailsDialog disableEscapeKeyDown maxWidth="md" fullWidth {...props}>
      <DetailsDialogPaper>
        {/*Here, we create a language tab containing all multi-language controls. In this case, the InputControlFieldWrapper */}
        <InputControlFieldWrapper
          // id="project_types"
          context={context}
        />
      </DetailsDialogPaper>
    </DetailsDialog>
  );
};

export default TestGuideSectionDialog;
