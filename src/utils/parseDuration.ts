export function parseDuration(str: string): number | null {
    // Soporta d (días), h (horas), m (minutos), s (segundos)
    const regex = /(\d+)(d|h|m|s)/gi;
    let totalMs = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(str)) !== null) {
        const value = parseInt(match[1], 10);
        const unit = match[2].toLowerCase();
        switch (unit) {
            case "d":
                totalMs += value * 24 * 60 * 60 * 1000;
                break;
            case "h":
                totalMs += value * 60 * 60 * 1000;
                break;
            case "m":
                totalMs += value * 60 * 1000;
                break;
            case "s":
                totalMs += value * 1000;
                break;
            default:
                // Si hay una unidad no reconocida, ignora
                break;
        }
    }

    return totalMs > 0 ? totalMs : null;
}