import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { SignInDto } from './dto/signIn.dto';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { hash, verify } from 'argon2';
import { MailerService } from '@nestjs-modules/mailer';
import { jwtConstants } from './constants';
import { ResetPasswordDto } from './dto/forgetPassword.dto';
import { EntityNotFoundError } from 'typeorm';



@Injectable()
export class AuthService {

    constructor(
        private readonly usuariosService:UsuariosService,
        private readonly jwtService:JwtService,
        private readonly mailerService:MailerService,
    ){}


    async signIn(signInDto:SignInDto){    
        const usuario = await  this.usuariosService.findOneByUsername(signInDto.username)
        const equal = await verify(usuario.password,signInDto.password)
        
        if (equal){
            const payload = {sub:usuario.id,username:usuario.username,role:usuario.rol,profileId:usuario.perfil.id}
            const access_token = await this.jwtService.signAsync(payload)
            return 'Bearer ' + access_token
        }
        throw new UnauthorizedException('La contraseña no coincide')
    }


    async forgotPassword(email:string,url:string){
        //const user = await this.usuariosService.findOneByEmail(email)
        const payload = {email:'hectorsibritoa@gmail.com'}
        const token = await this.jwtService.signAsync(payload,{secret:jwtConstants.secret,expiresIn:'3m'})
        url+=`/?token=${token}`
        const response = await this.mailerService.sendMail(
            {
                to: payload.email,
                subject: 'Reset password',
                text:`Para resetear tu contraseña has click aqui:${url}`
            }
        )
        return response
      }
    
    async resetPassword(resetPasswordDto:ResetPasswordDto){
        
        try{
            const tokenIsValid:{email:string} = await this.jwtService.verifyAsync(resetPasswordDto.token)
            const user = await this.usuariosService.findOneByEmail(tokenIsValid.email)
            //hacer el cambio de contraseña
            user.password = await hash(resetPasswordDto.newPassword)
            return await this.usuariosService.save(user)
        }
        catch (e){
                if (e instanceof JsonWebTokenError) throw new UnauthorizedException('Token invalido.')
            
                if (e instanceof EntityNotFoundError) throw new NotFoundException('Usuario no existe.')
                
                throw new InternalServerErrorException('Ha ocurrido un error en el servidor.')
        }

        
    }
    
    async signUp(){
        return ''
    }
}
