import { IsEnum, IsNotEmpty, IsNumber, IsNumberString, IsOptional, Length, Min} from "class-validator";
import { FormaDePago } from "../enum/formaDePago.enum";
import { Type } from "class-transformer";


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

}