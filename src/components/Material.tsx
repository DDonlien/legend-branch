import * as React from "react";
import { createComponent } from "@lit/react";
import { ButtonElement } from "@material/web/labs/gb/components/button/button-element.js";
import "@material/web/labs/gb/components/button/md-gb-button.js";
import { IconButtonElement } from "@material/web/labs/gb/components/iconbutton/icon-button-element.js";
import "@material/web/labs/gb/components/iconbutton/md-gb-icon-button.js";
import { CardElement } from "@material/web/labs/gb/components/card/card-element.js";
import "@material/web/labs/gb/components/card/md-gb-card.js";
import { MdFilledTextField } from "@material/web/textfield/filled-text-field.js";
import { ListElement } from "@material/web/labs/gb/components/list/list-element.js";
import "@material/web/labs/gb/components/list/md-gb-list.js";
import { ListItemElement } from "@material/web/labs/gb/components/list/list-item-element.js";
import "@material/web/labs/gb/components/list/md-gb-list-item.js";
import { MdDivider } from "@material/web/divider/divider.js";
import { MdSuggestionChip } from "@material/web/chips/suggestion-chip.js";
import { MdChipSet } from "@material/web/chips/chip-set.js";
import { MdLinearProgress } from "@material/web/progress/linear-progress.js";
import { MdDialog } from "@material/web/dialog/dialog.js";
import { MdFilledSelect } from "@material/web/select/filled-select.js";
import { MdSelectOption } from "@material/web/select/select-option.js";
import { MdFilterChip } from "@material/web/chips/filter-chip.js";
import { MdMenu } from "@material/web/menu/menu.js";
import { MdMenuItem } from "@material/web/menu/menu-item.js";

export const MaterialButton = createComponent({ tagName: "md-gb-button", elementClass: ButtonElement, react: React });
export const MaterialIconButton = createComponent({ tagName: "md-gb-icon-button", elementClass: IconButtonElement, react: React });
export const MaterialCard = createComponent({ tagName: "md-gb-card", elementClass: CardElement, react: React });
export const MaterialTextField = createComponent({ tagName: "md-filled-text-field", elementClass: MdFilledTextField, react: React, events: { onInput: "input" } });
export const MaterialList = createComponent({ tagName: "md-gb-list", elementClass: ListElement, react: React });
export const MaterialListItem = createComponent({ tagName: "md-gb-list-item", elementClass: ListItemElement, react: React });
export const MaterialDivider = createComponent({ tagName: "md-divider", elementClass: MdDivider, react: React });
export const MaterialSuggestionChip = createComponent({ tagName: "md-suggestion-chip", elementClass: MdSuggestionChip, react: React });
export const MaterialChipSet = createComponent({ tagName: "md-chip-set", elementClass: MdChipSet, react: React });
export const MaterialLinearProgress = createComponent({ tagName: "md-linear-progress", elementClass: MdLinearProgress, react: React });
export const MaterialDialog = createComponent({ tagName: "md-dialog", elementClass: MdDialog, react: React, events: { onClosed: "closed" } });
export const MaterialSelect = createComponent({ tagName: "md-filled-select", elementClass: MdFilledSelect, react: React, events: { onChange: "change" } });
export const MaterialOption = createComponent({ tagName: "md-select-option", elementClass: MdSelectOption, react: React });
export const MaterialFilterChip = createComponent({ tagName: "md-filter-chip", elementClass: MdFilterChip, react: React });
export const MaterialMenu = createComponent({ tagName: "md-menu", elementClass: MdMenu, react: React, events: { onClosing: "closing", onClosed: "closed" } });
export const MaterialMenuItem = createComponent({ tagName: "md-menu-item", elementClass: MdMenuItem, react: React });

export function MaterialIcon({ name, slot, className = "" }: { name: string; slot?: string; className?: string }) {
  return <span className={`material-symbols-rounded ${className}`} slot={slot} aria-hidden="true">{name}</span>;
}
