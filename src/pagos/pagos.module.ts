import { Module } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { PagosController } from './pagos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagoEntity } from './entities/pago.entity';
import { PedidosModule } from 'src/pedidos/pedidos.module';

@Module({
  imports:[PedidosModule,TypeOrmModule.forFeature([PagoEntity])],
  controllers: [PagosController],
  providers: [PagosService],
})
export class PagosModule {}
