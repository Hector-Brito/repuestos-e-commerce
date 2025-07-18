import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { ApiBearerAuth, ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AllowRoles } from 'src/auth/decorators/roles.decorator';
import { Rol } from 'src/usuarios/enum/rol.enum';
import { Public } from 'src/auth/decorators/isPublic.decorator';
import { MetodosDePagoService } from './metodosDePago.service';
import { CreateMetodoDePagoDto } from './dto/create-metodoDePago.dto';

@Public()
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('pagos')
export class PagosController {
  constructor(
    private readonly pagosService: PagosService,
    private readonly metodosDePagoService:MetodosDePagoService,
  ) {}

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

  @Patch(':id')
  @AllowRoles([Rol.Admin,Rol.Seller,Rol.User])
  @ApiOperation({summary:'Actualiza un pago (Admin, Seller, User).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  update(
    @Param('id') id:number,
    @Body() updatePagoDto: UpdatePagoDto
  ) {
    return this.pagosService.update(id,updatePagoDto);
  }

  @Delete(':id')
  @AllowRoles([Rol.Admin,Rol.Seller,Rol.User])
  @ApiOperation({summary:'Elimina un pago (Admin, Seller, User).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  async remove(@Param('id',ParseIntPipe) id: number) {
    return await this.pagosService.remove(id)
  }

 
  @Post('metodo-de-pago/')
  @AllowRoles([Rol.Admin])
  @ApiOperation({summary:'Crea un metodo de pago (Admin).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  async createMetodoDePago(
    @Body() createPagoDto: CreateMetodoDePagoDto
  ) {
    return await this.metodosDePagoService.create(createPagoDto)
  }

  @Get('metodo-de-pago/metodos-de-pago')
  @AllowRoles([Rol.Admin])
  @ApiOperation({summary:'Obtinene todos los metodo de pago (Admin).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  async findAllMetodoDePago() {
    return await this.metodosDePagoService.findAll()
  }


  @Delete('metodo-de-pago/:id')
  @AllowRoles([Rol.Admin])
  @ApiOperation({summary:'Elimina un metodo de pago (Admin, Seller, User).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  async removeMetodoDepago(@Param('id',ParseIntPipe) id: number) {
    return await this.metodosDePagoService.remove(id)
  }
}
