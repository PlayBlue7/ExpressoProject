import MenuItem from "./MenuItem";

class MenuSection {
    name: string = "";
    items: MenuItem[] = [];

    constructor(name: string) {
        this.name = name
    }
}

export default MenuSection;