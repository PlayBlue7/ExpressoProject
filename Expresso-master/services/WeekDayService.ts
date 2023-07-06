
class WeekDayService {
    public static days = [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun"
    ]

    static getActiveTime(day: string, start: { hour: number, min: number }, end: { hour: number, min: number },) {
        return day
            + " " + this.addZero(start.hour) + ":" + this.addZero(start.min)
            + " - " + this.addZero(end.hour) + ":" + this.addZero(end.min)
    }

    static startEndToString(start: { hour: number, min: number }, end: { hour: number, min: number }) {
        return this.addZero(start.hour) + ":" + this.addZero(start.min)
            + " - "
            + this.addZero(end.hour) + ":" + this.addZero(end.min)
    }

    static activeTimeToDate(time: { hour: number; min: number; }) {
        let d = new Date()
        d.setHours(time.hour)
        d.setMinutes(time.min)
        return d
    }

    private static addZero(num: number) {
        if (num < 10)
            return "0" + num
        return num.toString()
    }
}

export default WeekDayService