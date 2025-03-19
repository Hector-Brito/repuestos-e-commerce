import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { MetodosDeEntrega } from "../enum/metodosDeEntrega.enum";
import { IsInDatabase } from "src/custom-validators/IsInDatabase.validator";
import { EmpresaEnvioEntity } from "../entities/empresaEnvio.entity";
import { PedidoEntity } from "src/pedidos/entities/pedido.entity";
import { ApiProperty } from "@nestjs/swagger";


export class CreateEnvioDto {

    @IsString()
    @IsOptional()
    direccionEmpresa:string

    @IsEnum(MetodosDeEntrega)
    @IsNotEmpty()
    metodoDeEntrega:MetodosDeEntrega

    @ApiProperty({
        type:'number'
    })
    @IsNumber()
    @IsInDatabase(EmpresaEnvioEntity,'id')
    @IsOptional()
    empresaId:number|undefined

    @ApiProperty({
        type:'number'
    })
    @IsNumber()
    @IsInDatabase(PedidoEntity,'id')
    @IsNotEmpty()
    pedidoId:number
}
