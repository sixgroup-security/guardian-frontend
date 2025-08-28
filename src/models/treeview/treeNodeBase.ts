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

export type TreeNodeEventType =
  | React.MouseEvent<HTMLLIElement, MouseEvent>
  | React.MouseEvent<SVGSVGElement, MouseEvent>
  | React.MouseEvent<HTMLButtonElement, MouseEvent>;

export type EventHandlerType = {
  onMoveLeft?: (event: TreeNodeEventType) => void;
  onMoveRight?: (event: TreeNodeEventType) => void;
  onMoveUp: (event: TreeNodeEventType | null) => void;
  onMoveDown: (event: TreeNodeEventType | null) => void;
  onDelete: (event: TreeNodeEventType | null) => void;
  onEdit?: (event: TreeNodeEventType | null, node: TreeNodeBase) => void;
  onClick?: (event: TreeNodeEventType, node: TreeNodeBase) => void;
  additionalEvents?: {
    [key: string]: (node: TreeNodeBase, event?: TreeNodeEventType) => void;
  };
};

/*
 * Base class for managing tree structures.
 */
export abstract class TreeNodeBase {
  public parent: TreeNodeBase | null | undefined;
  public prev: TreeNodeBase | null | undefined;
  public next: TreeNodeBase | null | undefined;

  /*
   * Constructor to initialize the node with its basic properties
   */
  constructor(public id: string, public name: string) {
    this.id = id;
    this.name = name;
    this.parent = null;
    this.prev = null;
    this.next = null;
  }

  /*
   * Returns all all elements (including itself) on the same level as an array
   */
  getAll() {
    const siblings: TreeNodeBase[] = [];
    let sibling: TreeNodeBase | null = this!;
    while (sibling) {
      siblings.push(sibling);
      sibling = sibling.next!;
    }
    return siblings;
  }

  /*
   * Inserts the node after the given node.
   */
  insertNextTo(node: TreeNodeBase) {
    if (!node) return;

    // Update double linked list to new this.next node
    this.next = node.next;
    if (node.next) node.next.prev = this;

    // Update double linked list to new this.prev node
    this.prev = node;
    node.next = this;

    // Update parent pointer
    this.parent = node.parent;
  }

  /*
   * Return an array of sibling TreeNode
   */
  getSiblings(): TreeNodeBase[] {
    return this.getAll().slice(1);
  }

  /*
   * Returns an array of all parent nodes.
   */
  getParents(): TreeNodeBase[] {
    const parents: TreeNodeBase[] = [this];
    let parent: TreeNodeBase | null | undefined = this.parent;
    while (parent) {
      parents.push(parent);
      parent = parent.parent;
    }
    return parents;
  }

  /*
   * Returns an array of all child nodes.
   */
  getChildren(): TreeNodeBase[] {
    throw new Error("Not implemented");
  }

  /*
   * Returns the last sibling of the current node.
   */
  getLastSibling(): TreeNodeBase {
    let sibling: TreeNodeBase = this!;
    while (sibling.next) {
      sibling = sibling.next;
    }
    return sibling;
  }

  /*
   * Deletes the node from the tree.
   */
  delete() {
    throw new Error("Not implemented");
  }

  /*
   * Returns the closest previous sibling container node located before the current node or null if there isn't any.
   */
  getPreviousSiblingContainer() {
    let sibling = this.prev;
    while (sibling) {
      if (sibling instanceof ContainerTreeNode) return sibling;
      sibling = sibling.prev;
    }
    return null;
  }

  /*
   * Moves the element up in the list.
   */
  moveUp() {
    const prev = this.prev;
    const prevPrev = this.prev?.prev;
    if (!this.prev) return;
    // Case 1: If we move the first element in the list
    if (!this.prev.prev) {
      // We need to adjust the parent's pointer to the first element
      if (this.parent) {
        if (this instanceof ContainerTreeNode) {
          (this.parent as ContainerTreeNode).firstContainerChild = this;
        } else {
          (this.parent as ContainerTreeNode).firstLeafChild = this;
        }
      }

      // Adjust the pointers of the siblings
      this.prev.next = this.next;
      if (this.next) this.next.prev = this.prev;
      // prev.prev = this;

      // Adjust the pointers of the current element
      this.prev.prev = this;
      this.next = this.prev;
      this.prev = null;
    }
    // Case 2: If we move an element in the middle of the list
    else {
      // Adjust the pointers of the siblings
      this.prev.next = this.next;
      if (this.next) this.next.prev = this.prev;

      // Adjust the pointers of the current element
      prevPrev!.next = this!;
      this.prev = prevPrev;
      this.next = prev;
      prev!.prev = this;
    }
    return this;
  }

  /*
   * Moves the element down in the list.
   */
  moveDown() {
    const prev = this.prev;
    const next = this.next;
    const nextNext = this.next?.next;

    if (!this.next) return;

    // Case 1: If we move the first element in the list
    if (!this.prev) {
      // We need to adjust the parent's pointer to the first element
      if (this.parent) {
        if (this instanceof ContainerTreeNode) {
          (this.parent as ContainerTreeNode).firstContainerChild = this.next;
        } else {
          (this.parent as ContainerTreeNode).firstLeafChild = this.next;
        }
      }

      // Shift current node to the right
      // Update double linked list to new this.next node
      this.next = nextNext;
      if (nextNext) nextNext.prev = this;

      // Update double linked list to new this.prev node
      this.prev = next;
      next!.next = this;

      // Update double linked list of sibling nodes
      next!.prev = null;
      // next.prev = prev;
      // prev.next = next;
      return this.prev;
    } else {
      // Shift current node to the right
      // Update double linked list to new this.next node
      this.next = nextNext;
      if (nextNext) nextNext.prev = this;

      // Update double linked list to new this.prev node
      this.prev = next;
      next!.next = this;

      // Update double linked list of sibling nodes
      next!.prev = prev;
      prev!.next = next;
    }

    return this;
  }

  /*
   * Converts the node into a child node of the given node.
   */
  makeChildOf(newParent: TreeNodeBase) {
    // The given node must be a container node
    if (!newParent || !(newParent instanceof ContainerTreeNode)) return;
    // At the moment, we only support moving container nodes
    if (!(this instanceof ContainerTreeNode)) return;
    // Remove the node from its current position
    if (this.prev) this.prev.next = this.next;
    if (this.next) this.next.prev = this.prev;

    // Reset the pointers
    this.prev = null;
    this.next = null;
    this.parent = null;

    if (newParent) {
      newParent.addChild(this);
    }
  }

  /*
   * Returns a JSON representation of the node.
   */
  toJSON(): any[] {
    throw new Error("Not implemented");
  }

  abstract getComponent(
    children: JSX.Element[],
    handler: EventHandlerType,
    readonly: boolean
  ): JSX.Element;

  /*
   * Returns the type of the node.
   */
  abstract getType(): string;

  /*
   * Finds a node with the given id.
   */
  find(id: string): TreeNodeBase | null {
    if (this.id === id) return this;
    // Search all siblings
    return this?.next?.find(id) ?? null;
  }
}

/*
 * Class for a tree node that can contain other nodes.
 */
export abstract class ContainerTreeNode extends TreeNodeBase {
  public firstContainerChild: TreeNodeBase | null | undefined;
  public firstLeafChild: TreeNodeBase | null | undefined;
  public info: any;

  /*
   * Constructor for SectionNode, setting type to 'section' and initializing the children array
   */
  constructor(uid: string, name: string, info: any = {}) {
    super(uid, name);
    // We manage container and leaf childre separately because it will make tree operations easier.
    this.firstContainerChild = null;
    this.firstLeafChild = null;
    this.info = info;
  }

  /*
   * Returns an array of all child nodes.
   */
  getChildren() {
    const children = [
      ...this.getContainerChildren(),
      ...this.getLeafChildren(),
    ];
    return children;
  }

  /*
   * Returns an array of all child nodes that can contain other nodes.
   */
  getContainerChildren() {
    const children = [];
    let child = this.firstContainerChild;
    while (child) {
      children.push(child);
      child = child.next;
    }
    return children;
  }

  /*
   * Returns an array of all leaf nodes.
   */
  getLeafChildren() {
    const children = [];
    let child = this.firstLeafChild;
    while (child) {
      children.push(child);
      child = child.next;
    }
    return children;
  }

  /*
   * Returns the last child of the given section
   */
  _getLastChild(firstChild: TreeNodeBase): TreeNodeBase {
    let lastChild = firstChild;
    while (lastChild.next) {
      lastChild = lastChild.next;
    }
    return lastChild;
  }

  /*
   * Returns the last child of the container section
   */
  getLastContainerChild() {
    if (!this.firstContainerChild) throw new Error("No container children");
    return this._getLastChild(this.firstContainerChild);
  }

  /*
   * Returns the last child of the leaf section
   */
  getLastLeafChild() {
    if (!this.firstLeafChild) throw new Error("No leaf children");
    return this._getLastChild(this.firstLeafChild);
  }

  /*
   * Adds a child to the section
   */
  addChild(child: TreeNodeBase) {
    if (child && child instanceof TreeNodeBase) {
      if (child instanceof ContainerTreeNode) {
        if (!this.firstContainerChild) {
          this.firstContainerChild = child;
        } else {
          const lastChild = this.getLastContainerChild();
          lastChild.next = child;
          child.prev = lastChild;
          child.next = null;
        }
        child.parent = this;
      } else {
        if (!this.firstLeafChild) {
          this.firstLeafChild = child;
        } else {
          const lastChild = this.getLastLeafChild();
          lastChild.next = child;
          child.prev = lastChild;
          child.next = null;
        }
        child.parent = this;
      }
    }
    return child;
  }

  /*
   * Deletes the node from the tree.
   */
  delete() {
    // Case 0: If we delete the first root element, then we need to update the pointer that points to the first element. This is done by calling TreeViewModelProvider.deleteNode.
    // Case 1: If we delete the first element in the list
    if (!this.prev) {
      // We need to adjust the parent's pointer to the first element
      if (this.parent)
        (this.parent as ContainerTreeNode).firstContainerChild = this.next;
      // We need to adjust the next sibling's prev pointer.
      if (this.next) this.next.prev = null;
      this.parent = null;
    }
    // Case 2: If we delete the last element in the list
    else if (!this.next) {
      this.prev.next = null;
      this.parent = null;
    }
    // Case 3: If we delete an element in the middle of the list
    else {
      this.next.prev = this.prev;
      this.prev.next = this.next;
      this.parent = null;
    }

    this.next = null;
    this.prev = null;

    return this;
  }

  /*
   * Returns a JSON representation of the node.
   */
  toJSON(): any {
    const result = {
      id: this.id,
      type: this.getType(),
      info: this.info,
      children: new Array<any>(),
    };

    this.getChildren().map((child) => {
      const item = child.toJSON();
      result.children.push(item);
    });
    return result;
  }

  /*
   * Finds a node with the given id.
   */
  find(id: string): TreeNodeBase | null {
    if (this.id === id) {
      return this;
    }

    // Search all childs
    for (const child of this.getChildren()) {
      const result = child.find(id);
      if (result) {
        return result;
      }
    }

    // Search all siblings
    return this?.next?.find(id) ?? null;
  }
}

export abstract class LeafTreeNode extends TreeNodeBase {
  /*
   * Constructor for ProcedureNode, setting type to 'procedure'
   */
  constructor(uid: string, name: string) {
    super(uid, name);
  }

  /*
   * Returns an array of all child nodes.
   */
  getChildren() {
    return [];
  }

  /*
   * Deletes the node from the tree.
   */
  delete() {
    // Case 0: If we delete the first root element, then we need to update the pointer that points to the first element. This is done by calling TreeViewModelProvider.deleteNode.
    // Case 1: If we delete the first element in the list
    if (!this.prev) {
      // We need to adjust the parent's pointer to the first element
      if (this.parent)
        (this.parent as ContainerTreeNode).firstLeafChild = this.next;
      // We need to adjust the next sibling's prev pointer.
      if (this.next) this.next.prev = null;
      this.parent = null;
    }
    // Case 2: If we delete the last element in the list
    else if (!this.next) {
      this.prev.next = null;
      this.parent = null;
    }
    // Case 3: If we delete an element in the middle of the list
    else {
      this.next.prev = this.prev;
      this.prev.next = this.next;
      this.parent = null;
    }

    this.next = null;
    this.prev = null;

    return this;
  }

  /*
   * Returns a JSON representation of the node.
   */
  toJSON(): any {
    return {
      id: this.id,
      type: this.getType(),
    };
  }
}
