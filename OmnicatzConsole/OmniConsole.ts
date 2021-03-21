import { Cell } from "./Cell.js";
import { ConsoleColor } from "./ConsoleColor.js";
import { NamedColors } from "./NamedColors.js";


export class OmniConsole {

    private Cells: any;

    private fore: ConsoleColor = NamedColors.White;
    private back: ConsoleColor = NamedColors.Black;
    private cursor = { x: 0, y: 0 };
    private width: number;
    private height: number;
    private hostWidth: number;
    private hostHeight: number;

    private hostId: string;
    private context: CanvasRenderingContext2D;
    private autoDraw: boolean;
    public Echo = false;
    public EchoFormat = (txt: string) => `>${txt}`;
    public SkipEmpty = false;
    private autoSize = false;

    private fontSize: number;
    private get fw() { return this.fontSize * 0.5; }
    private get fh() { return this.fontSize * 0.5; }


    public constructor(width: number, height: number, hostId: string, autoDraw = false, echo = false, autoSize = false, fontSize = 50,) {
        this.width = width;
        this.height = height;
        this.autoDraw = autoDraw;
        this.Echo = echo;
        this.autoSize = autoSize;
        this.fontSize = fontSize;

        this.Cells = {};
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                this.Cells[`${x},${y}`] = new Cell();
            }
        }


        this.hostId = hostId;
        const canvas = document.getElementById(hostId) as HTMLCanvasElement;

        if (autoSize) {
            canvas.width = this.width * this.fw;
            canvas.height = this.height * this.fh;
        }
        this.hostWidth = canvas.width;
        this.hostHeight = canvas.height;



        this.context = canvas.getContext("2d") as CanvasRenderingContext2D;

    }

    public SetBackground(color: ConsoleColor): void {
        this.context.fillStyle = color.Color;
        this.context.fillRect(0, 0, this.width * this.fw, this.height * this.fh);
    }



    public Draw(): void {

        if (!this.autoDraw) {
            this.context.fillStyle = "black";
            this.context.fillRect(0, 0, this.hostWidth, this.hostHeight);
        }


        this.context.font = `${this.fontSize / 2}px monospace`;
        this.traverse((l, x, y) => {
            const cell = (this.Cells[l] as Cell);
            if (cell.Char !== " " || !this.SkipEmpty) {
                this.context.fillStyle = cell.Back.Color;
                this.context.fillRect(this.fw * x, this.fh * y, this.fw, this.fh);
                this.context.fillStyle = cell.Fore.Color;
                this.context.fillText(
                    cell.Char,
                    this.fw * x + (this.fw / 4),
                    this.fh * y + (this.fh / 1.2),
                    this.fontSize
                );
            }
        });
    }


    public set Fore(value: ConsoleColor) { this.fore = value; }
    public get Fore(): ConsoleColor { return this.fore; }


    public set Back(value: ConsoleColor) { this.back = value; }
    public get Back(): ConsoleColor { return this.back; }


    public MoveCursor(x: number, y: number): void {
        this.cursor.x = x;
        this.cursor.y = y;
    }


    private colorShift(action: () => void, fore: ConsoleColor | null = null, back: ConsoleColor | null = null): void {
        let foreBackUp: ConsoleColor | undefined;
        if (fore !== null) {
            foreBackUp = this.Fore;
            this.Fore = fore;
        }

        let backBackUp: ConsoleColor | undefined;
        if (back !== null) {
            backBackUp = this.Back
            this.Back = back;
        }
        action();

        if (foreBackUp) {
            this.Fore = foreBackUp;
        }

        if (backBackUp) {
            this.Back = backBackUp;
        }

    }

    public Write(text: string, fore: ConsoleColor | null = null, back: ConsoleColor | null = null): void {
        this.colorShift(() => {
            const chars = text.split("");
            chars.forEach(char => {
                const loc = `${this.cursor.x},${this.cursor.y}`;
                this.Cells[loc].Char = char;
                this.Cells[loc].Fore = this.Fore;
                this.Cells[loc].Back = this.Back;


                if (this.cursor.x < this.width) {
                    this.cursor.x++;
                }
                if (this.cursor.x >= this.width) {
                    this.cursor.y++;
                    this.cursor.x = 0;
                }

                if (this.cursor.y > this.width) {
                    this.cursor.y = this.height;
                }
            });
            if (this.autoDraw) {
                this.Draw();
            }
        }, fore, back);
    }
    public WriteLine(text: string, fore: ConsoleColor | null = null, back: ConsoleColor | null = null): void {
        this.colorShift(() => {
            const chars = text.split("");
            chars.forEach(char => {
                const loc = `${this.cursor.x},${this.cursor.y}`;
                this.Cells[loc].Char = char;
                this.Cells[loc].Fore = this.Fore;
                this.Cells[loc].Back = this.Back;


                if (this.cursor.x < this.width) {
                    this.cursor.x++;
                }
                if (this.cursor.x >= this.width) {
                    this.cursor.y++;
                    this.cursor.x = 0;
                }



                if (this.cursor.y > this.width) {
                    this.cursor.y = this.height;
                }
            });
            this.cursor.y++;
            this.cursor.x = 0;
            if (this.autoDraw) {
                this.Draw();
            }
        }, fore, back);
    }

    public Read(): string {
        return "";
    }

    private readString = "";


    public DrawRead(): void {
        this.Draw();



        const chars = (">" + this.readString).split("");

        chars.forEach((c, i) => {

            let yOff = Math.round(this.cursor.x + i) / this.width;

            this.context.fillStyle = this.Back.Color;
            this.context.fillRect(this.fw * ((this.cursor.x + i) % this.width),
                this.fh * (this.cursor.y + yOff), this.fw, this.fh);
            this.context.fillStyle = this.Fore.Color;




            this.context.fillText(
                c,
                this.fw * ((this.cursor.x + i) % this.width) + (this.fw / 4),
                this.fh * (this.cursor.y + yOff) + (this.fh / 1.2),
                this.fontSize
            );
            this.context.fillStyle = this.Fore.Color;
        });




    }





    public async ReadLine(): Promise<string> {
        const promise = new Promise<string>((resolve, reject) => {
            this.DrawRead();
            this.readString = "";

            document.onkeyup = n => {
                if (n.keyCode === 13) { //enter
                    if (this.Echo) {
                        this.WriteLine(this.EchoFormat(this.readString));
                    }
                    this.SetBackground(NamedColors.Black);
                    this.Draw();
                    const result = this.readString;
                    this.readString = "";
                    resolve(result);
                    document.onkeyup = null;

                } else
                    if (n.keyCode === 27) { //esc
                        reject();
                        document.onkeyup = null;
                        this.SetBackground(NamedColors.Black);
                        document.onkeyup = null;
                        this.readString = "";
                        this.Draw();
                    } else if (n.keyCode === 8) { //backspace
                        this.readString = this.readString.slice(0, -1);
                        this.Draw();
                        this.DrawRead()
                    } else if (n.key.length === 1) {
                        this.readString += n.key;
                        this.DrawRead();
                    }  
            };
        });
        return promise;
    }


    private traverse(action: (loc: string, x: number, y: number) => void) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {

                action(`${x},${y}`, x, y);

            }
        }
    }

    public Clear(): void {
        this.cursor.x = 0;
        this.cursor.y = 0;
        this.traverse((loc, x, y) => {
            this.Cells[loc].Char = " ";
            this.Cells[loc].Back = NamedColors.Black;
            this.Cells[loc].Fore = NamedColors.White;
        });
        if (this.autoDraw) {
            this.Draw();
        }
    }

}