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

import { TreeNodeBase } from "./treeNodeBase";
import TemplateProcedureSectionTreeNode from "../../components/inputs/dialogs/testguide/treeview/TemplateProcedureSectionTreeNode";
import TemplateProcedureTreeNode from "../../components/inputs/dialogs/testguide/treeview/TemplateProcedureTreeNode";
import TreeViewModelProvider from "./treeViewModelProvider";
import { TreeViewProviderClass } from "../../util/hooks/treeview/useTreeViewProvider";

/*
 * Class that converts a JSON object into a custom tree structure.
 */
export class TreeViewTestGuideProvider extends TreeViewModelProvider {
  constructor(jsonObject: TreeViewProviderClass, ...args: any[]) {
    super(jsonObject, args[0], {}, args[1]);
  }

  /*
   * Instantiates a TreeNodeBase object based on the given key and value.
   */
  _getObject(item: any): TreeNodeBase {
    if (!item || typeof item !== "object" || !item.type) {
      throw new Error("Invalid item: " + item);
    }

    // We initialize the node variable with a new instance of the corresponding TreeNodeBase class
    if (item.type === "container") {
      // Lookup the language-specific name of the tree node.
      const title =
        this.reportLanguage.language_code &&
        this.reportLanguage.language_code in (item.info?.title ?? [])
          ? item.info?.title[this.reportLanguage.language_code]
          : "";
      return new TemplateProcedureSectionTreeNode(item.id, title, item.info);
    } else if (item.type === "procedure") {
      if (!this.procedureNameLookupFn) {
        throw new Error(
          "procedureNameLookupFn is mandatory for TemplateProcedureSectionTreeNode"
        );
      }
      const title = this.procedureNameLookupFn(item.id);
      return new TemplateProcedureTreeNode(item.id, title);
    }
    throw new Error("Unknown type: " + item.type);
  }
}
