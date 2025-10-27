export const verificationHTML = (url: string) => {
    return {
        subject: 'Verify your account',
        html: `
        <h1>Welcome to Art Shelter!</h1>

        <b>Here's your verification link.</b>
        <a href="${url}">Click me</a>

        <p>Hope to see some of your artwork or doodles soon!</p>
    `
    };
};

export const accountRecoveryHTML = (name: string, url: string) => {
    return {
        subject: 'Recover your account',
        html: `
        <h1>Hello ${name}</h1>
        
        <p>A request has been made to reset your password</p>
    
        <a href="${url}">Click this link to reset your password</a>
    `
    };
};

export const tokenReusedHTML = (name: string) => {
    return {
        subject: "We've logged you out",
        html: `
        <h1>Hello ${name}</h1>
        
        <p>We detected suspicious activity regarding your account and have logged you out of our website as an automatic security measure</p>
        <p>You can log in again at any time</p>
    `
    };
};
