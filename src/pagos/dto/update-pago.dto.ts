import { PartialType } from "@nestjs/swagger";
import { CreatePagoDto } from "../../pagos/dto/create-pago.dto";
import { IsNotEmpty, IsNumber } from "class-validator";
import { Type } from "class-transformer";


export class UpdatePagoDto extends PartialType(CreatePagoDto){
    
    @IsNumber({maxDecimalPlaces:2})
    @IsNotEmpty()
    @Type(() => Number)
    tasaBsDelDia:number
}