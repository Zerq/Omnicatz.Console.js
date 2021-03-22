import { NamedColors } from "./NamedColors.js";
import { OmniConsole } from "./OmniConsole.js";
export class App {
    static async Run() {
        const oConsole = new OmniConsole(39, 27, "derp", true, false, true, 30);
        oConsole.SetBackground(NamedColors.Black);
        oConsole.WriteLine("Test 123");
        oConsole.Write("S", NamedColors.Crimson, NamedColors.White);
        oConsole.WriteLine("pog", NamedColors.Yellow, NamedColors.Blue);
        oConsole.Back = NamedColors.DarkBlue;
        oConsole.Fore = NamedColors.White;
        oConsole.Echo = true;
        oConsole.EchoFormat = txt => `You typed: ${txt}`;
        try {
            let x = await oConsole.ReadLine();
        }
        catch (error) {
            oConsole.WriteLine("input aborted", NamedColors.Red, NamedColors.Black);
        }
        let y = await oConsole.ReadLine();
        oConsole.Clear();
    }
}
