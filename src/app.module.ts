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
import { ReportesModule } from './reportes/reportes.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

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
    ReportesModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(),'src','images'),
      serveRoot: '/imagenes/',
    }),
    TypeOrmModule.forRoot(
      {
        type:'postgres',
        host:'localhost',
        port:5432,
        username:'postgres',
        password:'localpas',
        database:'e-commerce_db',
        entities:[__dirname+'/**/*.entity{.ts,.js}'],
        synchronize:false,

      }
    ),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
