import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-jwt";
import {ExtractJwt} from 'passport-jwt'
import { jwtConstants } from "../constants";
import { UsuariosService } from "src/usuarios/usuarios.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(
        private usuarioService:UsuariosService
    ){
        super(
            {
                jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
                ignoreExpiration:false,
                secretOrKey:jwtConstants.secret
            }
        )
    }

    async validate(payload: any):Promise<any> {
        try{
            const authUser = await this.usuarioService.findOne(payload.sub)
            return authUser
        }
        catch (e){
            throw new UnauthorizedException('Usuario no esta autenticado.')
        }
    }
}