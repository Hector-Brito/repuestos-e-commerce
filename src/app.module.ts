import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosModule } from './usuarios/usuarios.module';
import { CategoriasModule } from './categorias/categorias.module';
import { ProductosModule } from './productos/productos.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { EnviosModule } from './envios/envios.module';
import { FacturasModule } from './facturas/facturas.module';
import { PagosModule } from './pagos/pagos.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    UsuariosModule, 
    CategoriasModule, 
    ProductosModule, 
    PedidosModule,
    EnviosModule,
    FacturasModule,
    PagosModule,
    AuthModule,
    TypeOrmModule.forRoot(
      {
        type:'postgres',
        host:'localhost',
        port:5432,
        username:'postgres',
        password:'localpas',
        database:'e-commerce_db',
        entities:[__dirname+'/**/*.entity{.ts,.js}'],
        synchronize:true,

      }
    ),

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
