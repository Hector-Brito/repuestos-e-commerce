import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { UpdateDescuentos } from './dto/update-descuentos.dto';
import { ApiBearerAuth, ApiOperation,ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/isPublic.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AllowRoles } from 'src/auth/decorators/roles.decorator';
import { Rol } from 'src/usuarios/enum/rol.enum';

@ApiBearerAuth()
@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post()
  @UseGuards(RolesGuard)
  @AllowRoles([Rol.Admin])
  @ApiOperation({summary:'Crea un producto (Admin).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  async create(@Body() createProductoDto: CreateProductoDto) {
    return await this.productosService.create(createProductoDto);
  }

  @Get()
  @Public()
  @ApiOperation({summary:'Obtiene todos lo productos.'})
  findAll() {
    return this.productosService.findAll();
  }

  @Get(':id')
  @Public()
  @ApiOperation({summary:'Busca un producto por ID.'})
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.productosService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @AllowRoles([Rol.Admin])
  @ApiOperation({summary:'Actualiza un producto (Admin).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  update(@Param('id',ParseIntPipe) id: number, @Body() updateProductoDto: UpdateProductoDto) {
    return this.productosService.update(+id, updateProductoDto);
  }

  @Patch('aplicar/descuentos')
  @UseGuards(RolesGuard)
  @AllowRoles([Rol.Admin])
  @ApiOperation({summary:'Actualiza el descuento de muchos productos (Admin).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  async updateDiscountMany(@Body() updateDescuentos:UpdateDescuentos){
    return await this.productosService.updateDiscountMany(updateDescuentos)
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @AllowRoles([Rol.Admin])
  @ApiOperation({summary:'Elimina un producto (Admin).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  remove(@Param('id',ParseIntPipe) id: number) {
    return this.productosService.remove(+id);
  }
}
