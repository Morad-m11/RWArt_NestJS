Backend for the RWArt project.

It's used for authentication, authorization, logging, user interaction and general backend stuff.

This backend implements a manual auth flow that follows core OAuth 2.0 concepts, including access token issuance, refresh token handling and rotation.
Reasons for this are:
- full control over user data by keeping the user table internal
- practice and getting to know OAuth 2.0
- no vendor lock-in
