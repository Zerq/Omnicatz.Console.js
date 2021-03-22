import { NamedColors } from "./NamedColors.js";
export class Cell {
    constructor() {
        this.char = " ";
        this.Fore = NamedColors.White;
        this.Back = NamedColors.Black;
    }
    set Char(value) {
        if (value.length === 1) {
            this.char = value;
        }
    }
    get Char() { return this.char; }
}
