/**
 * Created by tim on 14/06/2016.
 */

"use strict";
import {Component, Output, EventEmitter} from "@angular/core";

@Component({
    selector: "autocomplete-list",
    template: `<div class="dropdown-menu  search-results">
                    <a *ngFor="let item of list" class="dropdown-item" (click)="onClick(item)">{{item.text}}</a>
               </div>`, // Use a bootstrap 4 dropdown-menu to display the listSectors
    styles: [".search-results { position: relative; right: 0; display: block; padding: 0; overflow: hidden; font-size: .9rem;}"]
})
export class AutocompleteList  {
    // Emit a selected event when an item in the listSectors is selected
    @Output() public selected = new EventEmitter();

    public list;

    /**
     * Listen for a click event on the listSectors
     */
    public onClick(item: {text: string, data: any}) {
        this.selected.emit(item);
    }
}