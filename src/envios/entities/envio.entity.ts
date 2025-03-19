import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { EmpresaEnvioEntity } from "./empresaEnvio.entity";
import { PedidoEntity } from "src/pedidos/entities/pedido.entity";
import { MetodosDeEntrega } from "../enum/metodosDeEntrega.enum";

@Entity({name:'envio'})
export class EnvioEntity {

    @PrimaryGeneratedColumn('increment')
    id:number

    @Column({type:'varchar',length:200,nullable:true})
    direccionEmpresa:string

    @Column({type:'enum',enum:MetodosDeEntrega,nullable:false})
    metodoDeEntrega:MetodosDeEntrega

    @ManyToOne(() => EmpresaEnvioEntity,(empresaEnvio) => empresaEnvio.envios,{nullable:true,eager:true,onDelete:'SET NULL'})
    @JoinColumn()
    empresa:EmpresaEnvioEntity

    @ManyToOne(() => PedidoEntity,(pedido) => pedido.envios,{eager:true,onDelete:'CASCADE'})
    @JoinColumn()
    pedido:PedidoEntity

}
