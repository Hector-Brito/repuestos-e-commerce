import { Column, Entity, PrimaryGeneratedColumn,ManyToOne} from "typeorm";
import { PedidoEntity } from "src/pedidos/entities/pedido.entity";
import { FormaDePago } from "../enum/formaDePago.enum";
import { FacturaEntity } from "src/facturas/entities/factura.entity";

@Entity({name:'pago'})
export class PagoEntity{

    @PrimaryGeneratedColumn('increment')
    id:number

    @ManyToOne(() => PedidoEntity,(pedido) => pedido.pagos,{nullable:true})
    pedido:PedidoEntity

    @ManyToOne(() => FacturaEntity, (factura) => factura.pagos,{nullable:true,cascade:true,onDelete:'SET NULL'})
    factura: FacturaEntity;

    @Column({type:'enum',enum:FormaDePago,default:FormaDePago.PagoMovil})
    nombreFormaDePago:FormaDePago

    @Column({type:'varchar',length:14,nullable:true})
    numeroReferencia:string
}