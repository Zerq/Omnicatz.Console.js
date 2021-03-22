import { Cell } from "./Cell.js";
import { NamedColors } from "./NamedColors.js";
export class OmniConsole {
    constructor(width, height, hostId, autoDraw = true, echo = false, autoSize = false, fontSize = 50) {
        this.fore = NamedColors.White;
        this.back = NamedColors.Black;
        this.cursor = { x: 0, y: 0 };
        this.EchoFormat = (txt) => `>${txt}`;
        this.SkipEmpty = false;
        this.readString = "";
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
        const canvas = document.getElementById(hostId);
        if (autoSize) {
            canvas.width = this.width * this.fw;
            canvas.height = this.height * this.fh;
        }
        this.hostWidth = canvas.width;
        this.hostHeight = canvas.height;
        this.context = canvas.getContext("2d");
    }
    get fw() { return this.fontSize * 0.5; }
    get fh() { return this.fontSize * 0.5; }
    SetBackground(color) {
        this.context.fillStyle = color.Color;
        this.context.fillRect(0, 0, this.width * this.fw, this.height * this.fh);
    }
    Draw() {
        if (!this.autoDraw) {
            this.context.fillStyle = "black";
            this.context.fillRect(0, 0, this.hostWidth, this.hostHeight);
        }
        this.context.font = `${this.fontSize / 2}px monospace`;
        this.traverse((l, x, y) => {
            const cell = this.Cells[l];
            if (cell.Char !== " " || !this.SkipEmpty) {
                this.context.fillStyle = cell.Back.Color;
                this.context.fillRect(this.fw * x, this.fh * y, this.fw, this.fh);
                this.context.fillStyle = cell.Fore.Color;
                this.context.fillText(cell.Char, this.fw * x + (this.fw / 4), this.fh * y + (this.fh / 1.2), this.fontSize);
            }
        });
    }
    DrawForRead() {
        this.Draw();
        const chars = (">" + this.readString).split("");
        chars.forEach((c, i) => {
            let yOff = Math.round(this.cursor.x + i) / this.width;
            this.context.fillStyle = this.Back.Color;
            this.context.fillRect(this.fw * ((this.cursor.x + i) % this.width), this.fh * (this.cursor.y + yOff), this.fw, this.fh);
            this.context.fillStyle = this.Fore.Color;
            this.context.fillText(c, this.fw * ((this.cursor.x + i) % this.width) + (this.fw / 4), this.fh * (this.cursor.y + yOff) + (this.fh / 1.2), this.fontSize);
            this.context.fillStyle = this.Fore.Color;
        });
    }
    set Fore(value) { this.fore = value; }
    get Fore() { return this.fore; }
    set Back(value) { this.back = value; }
    get Back() { return this.back; }
    MoveCursor(x, y) {
        this.cursor.x = x;
        this.cursor.y = y;
    }
    colorShift(action, fore = null, back = null) {
        let foreBackUp;
        if (fore !== null) {
            foreBackUp = this.Fore;
            this.Fore = fore;
        }
        let backBackUp;
        if (back !== null) {
            backBackUp = this.Back;
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
    Write(text, fore = null, back = null) {
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
    WriteLine(text, fore = null, back = null) {
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
    Read() {
        return "";
    }
    async ReadLine() {
        const canvas = document;
        const promise = new Promise((resolve, reject) => {
            const listenerLogic = n => {
                if (n.keyCode === 13) { //enter
                    if (this.Echo) {
                        this.WriteLine(this.EchoFormat(this.readString));
                    }
                    this.SetBackground(NamedColors.Black);
                    this.Draw();
                    const result = this.readString;
                    this.readString = "";
                    resolve(result);
                    canvas.removeEventListener("keyup", listenerLogic);
                }
                else if (n.keyCode === 27) { //esc
                    reject();
                    this.SetBackground(NamedColors.Black);
                    canvas.removeEventListener("keyup", listenerLogic);
                    this.readString = "";
                    this.Draw();
                }
                else if (n.keyCode === 8) { //backspace
                    this.readString = this.readString.slice(0, -1);
                    this.Draw();
                    this.DrawForRead();
                }
                else if (n.key.length === 1) {
                    this.readString += n.key;
                    this.DrawForRead();
                }
            };
            this.DrawForRead();
            this.readString = "";
            canvas.addEventListener("keyup", listenerLogic);
        });
        return promise;
    }
    traverse(action) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                action(`${x},${y}`, x, y);
            }
        }
    }
    Clear() {
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
