import { ConsoleColor } from "./ConsoleColor.js";
import { NamedColors } from "./NamedColors.js";

export class Cell {
    private char = " ";
    public set Char(value: string) {
        if (value.length === 1) {
            this.char = value;
        }
    }
    public get Char(): string { return this.char; }

    public Fore: ConsoleColor = NamedColors.White;
    public Back: ConsoleColor = NamedColors.Black;


}
