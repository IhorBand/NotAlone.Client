export class TokenModel {
    public userId: string = "";
    public userName: string = "";
    public token: string = "";
    public tokenType: string = "";
    public expiresInSeconds: number = 0;
    public expiresInUTC: string = "";
    public issuedInUTC: string = "";
    public refreshToken: string = "";
    public refreshTokenExpiresInSeconds: number = 0;
    public refreshTokenExpiresInUTC: string = "";
    public refreshTokenIssuedInUTC: string = "";

    public constructor() {
    }
}