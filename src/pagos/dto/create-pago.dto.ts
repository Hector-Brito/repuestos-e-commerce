import { IsEnum, IsNotEmpty, IsNumber, IsNumberString, IsOptional, Length, Min} from "class-validator";
import { FormaDePago } from "../enum/formaDePago.enum";
import { Type } from "class-transformer";
import { IsInDatabase } from "src/custom-validators/IsInDatabase.validator";
import { MetodoDePagoEntity } from "../entities/metodosDePago.entity";


export class CreatePagoDto{
    
    @IsEnum(FormaDePago)
    nombreFormaDePago:FormaDePago
    
    @IsNumber({maxDecimalPlaces:2})
    @Min(0)
    @IsNotEmpty()
    @Type(() => Number)
    monto:number

    @IsNumberString()
    @Length(13)
    @IsOptional()
    numeroReferencia:string

    @IsInDatabase(MetodoDePagoEntity,'id')
    @IsNotEmpty()
    @Type(() => Number)
    metodoDePagoId:number

}