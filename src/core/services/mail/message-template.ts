export const createVerificationHTML = (token: string) => {
    return `
        <h1>Welcome to RWArt!</h1>

        <b>Here's your verification link.</b>
        <a href="http://localhost:4200/auth/verify-account/${token}">
            Click me
        </a>

        <p>Hope to see some of your artwork or doodles soon!</p>
    `;
};

export const createAccountRecoveryHTML = (name: string, token: string) => {
    return `
        <h1>Hello ${name}</h1>
        
        <p>A request has been made to reset your password</p>
    
        <a href="http://localhost:4200/auth/reset-password/${token}">
            Click this link to reset your password
        </a>
    `;
};

export const createTokenReusedHTML = (name: string) => {
    return `
        <h1>Hello ${name}</h1>
        
        <p>We detected suspicious activity regarding your account and have logged you out of our website as an automatic security measure</p>
        <p>You can log in again at any time</p>
    `;
};
