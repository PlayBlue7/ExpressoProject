import Menu from "./Menu";

class Restaurant {
    uid:string = "";
    name:string = "";
    owner:string = ""; // UID of owner
    googlePhotoRef: string = "";
    coverPhoto: string = "";
    location:{longitude:number, latitude:number} = {longitude:0, latitude: 0};
    distance: number = 0;
    menus: Menu[] = [];
}

export default Restaurant;