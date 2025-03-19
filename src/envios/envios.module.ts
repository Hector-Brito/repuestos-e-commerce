import { Module } from '@nestjs/common';
import { EnviosService } from './envios.service';
import { EnviosController } from './envios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvioEntity } from './entities/envio.entity';
import { PedidosModule } from 'src/pedidos/pedidos.module';
import { IsInDatabaseConstraint } from 'src/custom-constraints/is-in-database.validator';
import { EmpresaEnvioEntity } from './entities/empresaEnvio.entity';

@Module({
  imports:[PedidosModule,TypeOrmModule.forFeature([EnvioEntity,EmpresaEnvioEntity])],
  controllers: [EnviosController],
  providers: [EnviosService,IsInDatabaseConstraint],
})
export class EnviosModule {}
