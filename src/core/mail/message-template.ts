export const createVerificationHTML = (name: string, token: string) => {
    return `
        <h1>Welcome to RWArt ${name}!</h1>

        <b>Here's your verification link.</b>
        <a href="http://localhost:4200/auth/verify?token=${token}">
            Click me
        </a>

        <p>Hope to see some of your artwork or doodles soon!</p>
    `;
};
