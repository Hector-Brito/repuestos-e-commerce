import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { jwtConstants } from "../constants";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../decorators/isPublic.decorator";



@Injectable()
export class AuthGuard implements CanActivate{
    constructor(
        private readonly jwtService:JwtService,
        private readonly reflector:Reflector,
    ){}

    async canActivate(context: ExecutionContext):Promise<boolean>{
        const req = context.switchToHttp().getRequest<Request>()

        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY,[context.getHandler(),context.getClass()])

        if (isPublic){
            return true
        }

        const token = await this.extractTokenFromHeader(req)
        if (token){
            try{
                const payload = await this.jwtService.verifyAsync(token,{secret:jwtConstants.secret})
                req['user'] = payload
                return true

            }
            catch{
                throw new UnauthorizedException('Token invalido')
            }
        }
        throw new UnauthorizedException('Token invalido')
    }

    async extractTokenFromHeader(request:Request):Promise<string|undefined>{
        const [type, token] =  request.headers.authorization?.split(' ') ?? []
        return type === 'Bearer' ? token : undefined
    }
}