import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { EnviosService } from './envios.service';
import { CreateEnvioDto } from './dto/create-envio.dto';
import { UpdateEnvioDto } from './dto/update-envio.dto';
import { CreateEmpresaEnvioDto } from './dto/create-empresaEnvio.dto';
import { UpdateEmpresaEnvioDto } from './dto/update-empresaEnvio.dto';
import { ApiBearerAuth,ApiOperation,ApiUnauthorizedResponse } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AllowRoles } from 'src/auth/decorators/roles.decorator';
import { Rol } from 'src/usuarios/enum/rol.enum';

@ApiBearerAuth()
@Controller('envios')
export class EnviosController {
  constructor(private readonly enviosService: EnviosService) {}

  @Post()
  @UseGuards(RolesGuard)
  @AllowRoles([Rol.Admin,Rol.Seller,Rol.User])
  @ApiOperation({summary:'Crea un envio (Admin, Seller, User).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  create(@Body() createEnvioDto: CreateEnvioDto) {
    return this.enviosService.create(createEnvioDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @AllowRoles([Rol.Admin,Rol.Seller])
  @ApiOperation({summary:'Obtiene todos los envios (Admin, Seller).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  findAll() {
    return this.enviosService.findAll();
  }


  @Get(':id')
  @UseGuards(RolesGuard)
  @AllowRoles([Rol.Admin,Rol.Seller,Rol.User])
  @ApiOperation({summary:'Busca un envio por ID (Admin, Seller, User).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.enviosService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @AllowRoles([Rol.Admin,Rol.Seller])
  @ApiOperation({summary:'Actualiza un envio (Admin, Seller).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  update(@Param('id',ParseIntPipe) id: number, @Body() updateEnvioDto: UpdateEnvioDto) {
    return this.enviosService.update(+id, updateEnvioDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @AllowRoles([Rol.Admin,Rol.Seller])
  @ApiOperation({summary:'Elimina un envio (Admin, Seller).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  remove(@Param('id',ParseIntPipe) id: number) {
    return this.enviosService.remove(+id);
  }

  @Post('empresa')
  @UseGuards(RolesGuard)
  @AllowRoles([Rol.Admin])
  @ApiOperation({summary:'Crea una empresa de envio (Admin).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  async createEmpresaEnvio(
    @Body() createEmpresaEnvioDto:CreateEmpresaEnvioDto
  ){
    return await this.enviosService.createEmpresaEnvio(createEmpresaEnvioDto)
  }

  @Get('empresa/empresas')
  @UseGuards(RolesGuard)
  @AllowRoles([Rol.Admin,Rol.Seller,Rol.User])
  @ApiOperation({summary:'Obtiene todas las empresas de envios (Admin, Seller, User).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  async findAllEmpresaEnvios(){
    return await this.enviosService.findAllEmpresaEnvios()
  }


  @Patch('empresa/:empresaId')
  @UseGuards(RolesGuard)
  @AllowRoles([Rol.Admin])
  @ApiOperation({summary:'Actualiza una empresa de envio (Admin).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  async updateEmpresaEnvio(
    @Param('empresaId',ParseIntPipe) empresaId:number,
    @Body() updateEmpresaEnvioDto:UpdateEmpresaEnvioDto,
  ){
    return await this.enviosService.updateEmpresaEnvio(empresaId,updateEmpresaEnvioDto)
  }

  @Delete('empresa/:empresaId')
  @UseGuards(RolesGuard)
  @AllowRoles([Rol.Admin])
  @ApiOperation({summary:'Elimina una empresa de envio (Admin).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  async removeEmpresaEnvio(
    @Param('empresaId',ParseIntPipe) empresaId:number
  ){
    return await this.enviosService.removeEmpresaEnvio(empresaId)
  }
}
