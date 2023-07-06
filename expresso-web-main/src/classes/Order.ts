import MenuItem from "./MenuItem";

class Order {
    price: number = 0;
    items: MenuItem[] = [];
    customerUID: string = "";
    restaurantUID: string = "";
    menuUID: string = "";
    tableNumber: number = 0;
    // time: Date = new Date();
    rating: number = 0;
}

export default Order;