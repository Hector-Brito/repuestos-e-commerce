import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsuariosModule } from 'src/usuarios/usuarios.module';
import { IsInDatabaseConstraint } from 'src/custom-constraints/is-in-database.validator';
import { UniqueInDatabaseConstraint } from 'src/custom-constraints/unique-in-database.decorator';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { JwtGuard } from './guards/jwt.guard';
import { LocalStrategy } from './strategy/local.strategy';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtRefreshStrategy } from './strategy/jwt-refresh.strategyt';


@Module({
  imports:[UsuariosModule,
    JwtModule.register({
      global:true,
    }),
    ConfigModule.forRoot({ envFilePath: ['.env'], isGlobal: true }),
    MailerModule.forRoot(
      {
        transport:{
          host:process.env.HOST,
          port:465,
          secure:true,
          auth:{
            user:process.env.USER,
            pass:process.env.PASS
          }
        },
       
      }
    )
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    IsInDatabaseConstraint,
    UniqueInDatabaseConstraint,
    {
      provide:APP_GUARD,
      useClass:JwtGuard
    },
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy
  ],
})
export class AuthModule {}
