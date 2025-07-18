import { Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity({name:'metodo_de_pago'})
export class MetodoDePagoEntity{

    @PrimaryGeneratedColumn('increment')
    id:number

    @Column({type:'varchar',length:50,nullable:false,unique:true})
    nombre:string

    @Column({type:'varchar',length:150,unique:true, nullable:true})
    email:string

    @Column({type:'varchar',length:20,unique:true, nullable:true})
    numeroTelefono:string

    @Column({type:'varchar',length:20,unique:true})
    cedula:string

    @Column({type:'varchar',length:50,nullable:false,unique:true})
    nombreDeTitular:string

}
