import Location from "../classes/Location";

class ConversionService {
    private static toRadians(degrees: number) {
        var pi = Math.PI;
        return degrees * (pi / 180);
    }
    static getDistance(l1: Location, l2: Location) {
        if(l1 === undefined || l2 === undefined)
            return 0.0;
        const radius = 3958.8; // earth radius in miles

        const dlat = this.toRadians(l2.latitude - l1.latitude);
        const dlon = this.toRadians(l2.longitude - l1.longitude);
        const a =
            Math.sin(dlat / 2) * Math.sin(dlat / 2) +
            Math.cos(this.toRadians(l1.latitude)) *
            Math.cos(this.toRadians(l2.latitude)) *
            Math.sin(dlon / 2) *
            Math.sin(dlon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = radius * c;
        if (d <= 0.1)
            return 0.1 // avoids super short distances

        return parseFloat(d.toPrecision(2)); // parseFloat removes trailing zeros
    }
}

export default ConversionService