import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { ApiBearerAuth, ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AllowRoles } from 'src/auth/decorators/roles.decorator';
import { Rol } from 'src/usuarios/enum/rol.enum';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post('pedido/:pedidoId')
  @AllowRoles([Rol.Admin,Rol.Seller,Rol.User])
  @ApiOperation({summary:'Crea un pago de un pedido (Admin, Seller, User).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  create(
    @Param('pedidoId') pedidoId:number,
    @Body() createPagoDto: CreatePagoDto
  ) {
    return this.pagosService.create(pedidoId,createPagoDto);
  }

  @Get()
  @AllowRoles([Rol.Admin,Rol.Seller])
  @ApiOperation({summary:'Obtiene todos los pagos (Admin, Seller).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  findAll() {
    return this.pagosService.findAll();
  }

  @Get(':id')
  @AllowRoles([Rol.Admin,Rol.Seller])
  @ApiOperation({summary:'Busca un pago (Admin, Seller).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.pagosService.findOne(+id);
  }

  @Patch('pedido/:pedidoId')
  @AllowRoles([Rol.Admin,Rol.Seller,Rol.User])
  @ApiOperation({summary:'Actualiza un pago de un pedido (Admin, Seller, User).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  update(
    @Param('pedidoId') pedidoId:number,
    @Body() updatePagoDto: UpdatePagoDto
  ) {
    return this.pagosService.update(pedidoId,updatePagoDto);
  }

  @Delete('pedido/:pedidoId')
  @AllowRoles([Rol.Admin,Rol.Seller,Rol.User])
  @ApiOperation({summary:'Elimina un pago de un pedido (Admin, Seller, User).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  async remove(@Param('pedidoId',ParseIntPipe) pedidoId: number) {
    return await this.pagosService.remove(pedidoId)
  }
}
