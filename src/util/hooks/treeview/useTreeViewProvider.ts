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
import TreeViewModelProvider from "../../../models/treeview/treeViewModelProvider";

export type TreeViewProviderClass = new (
  model: any,
  ...args: any[]
) => TreeViewModelProvider;

export interface TreeViewModelProviderProps {
  model: any;
  provider: TreeViewModelProvider;
  selectedNodeId: React.MutableRefObject<string | null | undefined>;
  onTreeUpdateHandler: () => void;
  resetTreeViewProvider: () => void;
}

export interface TreeViewItemMenuManagerProps {
  handleClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  handleClose: () => void;
  menuOpen: boolean;
  anchorElement: HTMLElement | null;
}

/*
 * Hook to use the TreeViewMenu.
 */
export const useTreeViewItemMenu = (): TreeViewItemMenuManagerProps => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    },
    [setAnchorEl]
  );

  const handleClose = React.useCallback(() => {
    setAnchorEl(null);
  }, [setAnchorEl]);

  return {
    handleClick,
    handleClose,
    menuOpen,
    anchorElement: anchorEl,
  };
};

/*
 * Hook to use the TreeViewModelProvider.
 */
export const useTreeViewProvider = (
  // The provider class used to manage the tree view.
  ProviderClass: TreeViewProviderClass,
  // The raw JSON object that will be converted into a tree view.
  jsonObject: any,
  ...args: any[]
): TreeViewModelProviderProps => {
  const [model, setModel] = React.useState(jsonObject);
  const selectedNodeId = React.useRef<string | null>();
  const provider = React.useMemo(
    () => new ProviderClass(model, ...args),
    [ProviderClass, model, args]
  );

  const onTreeUpdateHandler = React.useCallback(() => {
    const model = provider.toJSON() ?? {};
    setModel(model);
  }, [provider]);

  const resetTreeViewProvider = React.useCallback(() => {
    selectedNodeId.current = null;
    setModel({});
  }, [selectedNodeId]);

  // We have to update the initial state, if the initial value changes.
  React.useEffect(() => {
    setModel(jsonObject);
  }, [jsonObject]);

  return React.useMemo(
    () => ({
      model,
      selectedNodeId,
      provider,
      onTreeUpdateHandler,
      resetTreeViewProvider,
    }),
    [
      model,
      selectedNodeId,
      provider,
      onTreeUpdateHandler,
      resetTreeViewProvider,
    ]
  );
};
