import { PartialType } from "@nestjs/swagger";
import { CreatePagoDto } from "../../pagos/dto/create-pago.dto";


export class UpdatePagoDto extends PartialType(CreatePagoDto){}