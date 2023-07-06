import ActiveTime from "./ActiveTime";
import MenuSection from "./MenuSection";

class Menu {
    uid: string = "";
    name: string = "";
    sections: MenuSection[] = [];
    activeTimes: {[char: string] : ActiveTime[]} = {
        Mon: [],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
        Sat: [],
        Sun: []
    }
    constructor(name: string, uid?:string) {
        this.name = name
        this.uid = uid??""
    }
}

export default Menu;