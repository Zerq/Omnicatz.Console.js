import { NamedColors } from "./NamedColors.js";
export class ConsoleColor {
    constructor(color) {
        if (ConsoleColor.Validate(color)) {
            this.colorString = color;
        }
        else {
            throw new Error(`${color} is not a valid color!`);
        }
    }
    static Validate(text) {
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        if (NamedColors[text] !== undefined) {
            return true;
        }
        /* eslint-enable  @typescript-eslint/no-explicit-any */
        const colorFormatRegex = /#[a-f|A-F|0-9]{6}|#[a-f|A-F|0-9]{3}|ahsl\([^,]*,[^,]*,[^\)]*\)|#[a-f|A-F|0-9]{3}|hsl\([^,]*,[^,]*,[^\)]*\)|argb\([^,]*,[^,]*,[^\)]*\)|#[a-f|A-F|0-9]{3}|rgb\([^,]*,[^,]*,[^\)]*\)/;
        return colorFormatRegex.test(text);
    }
    get Color() {
        return this.colorString;
    }
}
