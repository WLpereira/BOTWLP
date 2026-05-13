const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";

export function generateTemporaryPassword(length = 12): string {
    let password = "";

    for (let i = 0; i < length; i += 1) {
        password += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
    }

    return password;
}
