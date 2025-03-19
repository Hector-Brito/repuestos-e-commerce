import { Column, Entity, OneToOne, PrimaryGeneratedColumn,JoinColumn } from "typeorm";
import { PedidoEntity } from "src/pedidos/entities/pedido.entity";
import { FormaDePago } from "../enum/formaDePago.enum";
import { FacturaEntity } from "src/facturas/entities/factura.entity";

@Entity({name:'pago'})
export class PagoEntity{

    @PrimaryGeneratedColumn('increment')
    id:number

    @OneToOne(() => PedidoEntity)
    pedido:PedidoEntity

    @OneToOne(() => FacturaEntity)
    factura:FacturaEntity

    @Column({type:'enum',enum:FormaDePago,default:FormaDePago.PagoMovilOTransferencia})
    nombreFormaDePago:FormaDePago

    @Column({type:'varchar',length:14,nullable:true})
    numeroReferencia:string
}