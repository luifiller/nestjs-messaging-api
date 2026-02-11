export class JwtPayloadDto {
  sub: string;
  username: string;
  roles?: string[];
  iat: number;
  exp: number;
  aud: string;
  iss: string;
}
