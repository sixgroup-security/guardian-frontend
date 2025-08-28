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

import { TreeNodeBase, ContainerTreeNode } from "./treeNodeBase";
import TemplateProcedureTreeNode from "../../components/inputs/dialogs/testguide/treeview/TemplateProcedureTreeNode";
import { ReportLanguageLookup } from "../reportLanguage";

/*
 * Class that converts a JSON object into a custom tree structure.
 */
export default abstract class TreeViewModelProvider {
  private model: TreeNodeBase | null | undefined;
  // Attribute that stores additional information that might be needed for the tree structure.
  protected info: any;
  protected reportLanguage: ReportLanguageLookup;
  protected procedureNameLookupFn?: (id: string) => string;

  constructor(
    jsonObject: any,
    reportLanguage: ReportLanguageLookup,
    info: any,
    procedureNameLookupFn?: (id: string) => string
  ) {
    this.info = info;
    this.reportLanguage = reportLanguage;
    this.procedureNameLookupFn = procedureNameLookupFn;
    // Initialize the model by loading the data
    this.model = this.parse(jsonObject);
  }

  getAll() {
    return this.model?.getAll() ?? [];
  }

  getModel() {
    return this.model;
  }

  /*
   * Returns an array of all node IDs.
   */
  getNodeIds(
    filter: "containerOnly" | "procedureOnly" | undefined = undefined
  ) {
    const result: string[] = [];
    this.getAll().forEach((node: TreeNodeBase) => {
      result.push(...this._getNodeById(node, filter));
    });
    return result;
  }

  _getNodeById(
    node: TreeNodeBase,
    filter: "containerOnly" | "procedureOnly" | undefined = undefined
  ) {
    let result: string[] = [];
    if (
      !filter ||
      (node instanceof ContainerTreeNode && filter === "containerOnly") ||
      (node instanceof TemplateProcedureTreeNode && filter === "procedureOnly")
    ) {
      result.push(node.id);
    }
    node.getChildren().forEach((item) => {
      result = [...result, ...this._getNodeById(item, filter)];
    });
    return result;
  }

  find(id: string) {
    return this.model?.find(id);
  }

  deleteNode(node: TreeNodeBase) {
    // Case 0: If we delete the first root element, then we need to update the model.
    if (this.model === node) {
      if (node.next && node.next.prev) node.next.prev = null;
      this.model = node.next;
    } else {
      node.delete();
    }
  }

  moveUp(node: TreeNodeBase) {
    // If we move the second root element to the first position, the we need to update the model.
    if (this.model?.next === node) {
      this.model = node.moveUp();
    } else {
      node.moveUp();
    }
  }

  moveDown(node: TreeNodeBase) {
    // If we move the first root element to the second position, the we need to update the model.
    if (this.model === node) {
      this.model = node.moveDown();
    } else {
      node.moveDown();
    }
  }

  makeChild(node: TreeNodeBase) {
    // The first root element cannot become a child.
    if (this.model === node) return;
    // At the moment, we only support moving container nodes.
    if (node instanceof ContainerTreeNode) {
      let firstContainerSibling = node.prev;
      // Obtain the first container sibling before the current node. This node will become the new parent.
      while (firstContainerSibling) {
        if (firstContainerSibling instanceof ContainerTreeNode) {
          node.makeChildOf(firstContainerSibling);
          break;
        }
        firstContainerSibling = firstContainerSibling.prev;
      }
    }
  }

  makeParent(node: TreeNodeBase) {
    // Root elements cannot be promoted to parents.
    if (!node.parent) return;
    const originalParent = node.parent;
    // At the moment, we only support moving container nodes.
    if (node instanceof ContainerTreeNode) {
      // Remove the node from its current position.
      node.delete();
      // If the node is not promoted to a root element.
      if (originalParent?.parent) {
        node.makeChildOf(originalParent.parent);
      }
      // If the node is promoted to a root element.
      else {
        node.insertNextTo(originalParent);
      }
    }
  }

  /*
   * Instantiates a TreeNodeBase object based on the given key and value.
   */
  abstract _getObject(item: any): TreeNodeBase;

  /*
   * Iterates through the elements of the json object and creates a tree structure.
   */
  parse(jsonObject?: any[]): TreeNodeBase | null {
    if (!jsonObject || !Array.isArray(jsonObject)) {
      return null;
    }

    let firstItem: TreeNodeBase | null = null;
    let previousElement: TreeNodeBase | null = null;
    jsonObject?.forEach((item) => {
      const node = this._getObject(item);
      if (node) {
        if (previousElement) {
          previousElement.next = node;
          node.prev = previousElement;
        }
        if (!firstItem) {
          firstItem = node;
        }
        previousElement = node;
      }
      this._parse(item.children, node);
    });
    return firstItem;
  }

  /*
   * Recursively iterates through the elements of the json object and creates a tree structure.
   */
  _parse(jsonObject: any[], parent: TreeNodeBase) {
    // Check arguments
    if (
      !jsonObject ||
      !Array.isArray(jsonObject) ||
      !parent ||
      !(parent instanceof ContainerTreeNode)
    ) {
      return null;
    }
    jsonObject?.forEach((item) => {
      const node = this._getObject(item);
      if (node) {
        parent.addChild(node);
      }
      this._parse(item.children, node);
    });
  }

  /*
   * Returns the JSON representation of the tree structure.
   */
  toJSON(): any[] {
    const result: any[] = [];
    this.getAll().forEach((node: TreeNodeBase) => {
      const item = node.toJSON();
      if (Array.isArray(item)) {
        result.push(...item);
      } else {
        result.push(item);
      }
    });
    return result;
  }

  /*
   * Inserts the node after the given node.
   */
  insertNextTo(newNode: TreeNodeBase, sibling: TreeNodeBase) {
    if (!newNode || !sibling) throw new Error("Invalid arguments");
    newNode.insertNextTo(sibling);
  }

  /*
   *
   */
  insertLast(newNode: TreeNodeBase) {
    if (this.model) {
      newNode.insertNextTo(this.model.getLastSibling());
    } else {
      this.model = newNode;
    }
  }

  addChild(newNode: TreeNodeBase, parent: ContainerTreeNode) {
    if (!newNode || !parent) throw new Error("Invalid arguments");
    parent.addChild(newNode);
  }
}
