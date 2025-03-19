import { Body, Controller, Post, Get, Req, UseGuards, Query, Param, Patch,} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signIn.dto';
import { Public } from './decorators/isPublic.decorator';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AllowRoles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { PATH_METADATA } from '@nestjs/common/constants';
import { Request } from 'express';
import { ResetPasswordDto } from './dto/forgetPassword.dto';


@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  
  @Post('login')
  @Public()
  @ApiOperation({summary:'Iniciar sesion.'})
  signIn(
    @Body() signInDto:SignInDto
  ){
    return this.authService.signIn(signInDto)
  }

  @Post('forgot-password')
  @Public()
  async forgotPassword(
    @Req() request:Request,
    @Body() {email}:{email:string}
  ){
    let url = request.protocol +'://' + request.host +'/auth/' +'reset-password'
    const response = await this.authService.forgotPassword(email,url)
    
    return response
  }

  @Patch('reset-password/')
  @Public()
  async resetPassword(
    @Body() resetPasswordDto:ResetPasswordDto
  ){
    return await this.authService.resetPassword(resetPasswordDto)
  }


  @Get()
  @ApiOperation({summary:'Ver perfil.'})
  getProfile(@Req() req){
    return req.user
  }
}
