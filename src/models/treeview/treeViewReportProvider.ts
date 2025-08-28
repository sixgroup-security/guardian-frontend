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
import ProcedureSectionTreeNode from "../../components/inputs/dialogs/report/treeview/ProcedureSectionTreeNode";
import ProcedureTreeNode from "../../components/inputs/dialogs/report/treeview/ProcedureTreeNode";
import ReportSectionTreeNode from "../../components/inputs/dialogs/report/treeview/ReportSectionTreeNode";
import VulnerabilityTreeNode from "../../components/inputs/dialogs/report/treeview/VulnerabilityTreeNode";
import TreeViewModelProvider from "./treeViewModelProvider";
import PlaybookTreeNode from "../../components/inputs/dialogs/report/treeview/PlaybookTreeNode";

/*
 * Class that converts a JSON object into a custom tree structure.
 */
export class TreeViewReportProvider extends TreeViewModelProvider {
  constructor(jsonObject: any, ...args: any[]) {
    super(jsonObject, args[0], { projectId: args[1], reportId: args[2] });
    // This does not work because super() is already calling this._getObject()
    // this.projectId = args[1];
    // this.reportId = args[2];
  }

  /*
   * Instantiates a TreeNodeBase object based on the given key and value.
   */
  _getObject(item: any): TreeNodeBase {
    if (!item || typeof item !== "object" || !item.type) {
      throw new Error("Invalid item: " + item);
    }

    // We initialize the node variable with a new instance of the corresponding TreeNodeBase class
    let result;
    switch (item.type) {
      case "reportSection":
        result = new ReportSectionTreeNode(
          item.id,
          item.info.name,
          item.info,
          this.info.projectId,
          this.info.reportId
        );
        break;
      case "playbook":
        result = new PlaybookTreeNode(item.id, item.info.name, item.info);
        break;
      case "container":
        result = new ProcedureSectionTreeNode(
          item.id,
          item.info.name,
          item.info
        );
        break;
      case "procedure":
        result = new ProcedureTreeNode(
          item.id,
          item.name,
          item.priority,
          item.status,
          item.source_procedure_id
        );
        break;
      case "vulnerability":
        result = new VulnerabilityTreeNode(
          item.id,
          item.name,
          item.reference_str,
          item.vulnerability_id_str,
          item.severity,
          item.status,
          item.has_pdf,
          item.has_pdf_log,
          item.has_tex
        );
        break;
      default:
        throw new Error("Unknown type: " + item.type);
    }
    return result;
  }
}
