import { Module } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';
import { PedidosModule } from 'src/pedidos/pedidos.module';

@Module({
  imports:[PedidosModule],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}
