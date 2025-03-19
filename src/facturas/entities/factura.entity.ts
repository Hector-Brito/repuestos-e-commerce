import { Column, Entity, Index, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { PagoEntity } from "src/pagos/entities/pago.entity";
import { PedidoEntity } from "src/pedidos/entities/pedido.entity";

@Entity({name:'factura'})
@Index(['pago','pedido'],{unique:true})
export class FacturaEntity{

    @PrimaryGeneratedColumn('increment')
    id:number

    @Column({type:'text'})
    descripcion:string

    @OneToOne(() => PagoEntity,{nullable:false,onDelete:'CASCADE'})
    @JoinColumn()
    pago:PagoEntity

    @OneToOne(() => PedidoEntity,{nullable:false,eager:true,onDelete:'CASCADE'})
    @JoinColumn()
    pedido:PedidoEntity
}