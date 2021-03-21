import { NamedColors } from "./NamedColors.js";

export class ConsoleColor {
    private colorString: string;
     
    public static Validate(text: string): boolean {
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        if (((NamedColors as unknown) as any)[text] !== undefined) {
            return true;
        }
        /* eslint-enable  @typescript-eslint/no-explicit-any */
        const colorFormatRegex = /#[a-f|A-F|0-9]{6}|#[a-f|A-F|0-9]{3}|ahsl\([^,]*,[^,]*,[^\)]*\)|#[a-f|A-F|0-9]{3}|hsl\([^,]*,[^,]*,[^\)]*\)|argb\([^,]*,[^,]*,[^\)]*\)|#[a-f|A-F|0-9]{3}|rgb\([^,]*,[^,]*,[^\)]*\)/;
        return colorFormatRegex.test(text);

    }

    public constructor(color: string) {
        if (ConsoleColor.Validate(color)) {
            this.colorString = color;
        }
        else {
            throw new Error(`${color} is not a valid color!`);
        }
    }

    public get Color(): string {
        return this.colorString;
    }

}
