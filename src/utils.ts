export default class Utils {
    static random(): string {
        return (Date.now() + (Math.round(Math.random() * Date.now()))) + '';
    }
}