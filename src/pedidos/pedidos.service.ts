import { BadRequestException, ConflictException, Injectable, NotFoundException, Req } from '@nestjs/common';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PedidoEntity } from './entities/pedido.entity';
import { Between, Equal, IsNull, Not, Repository } from 'typeorm';
import { PedidoItemService } from './pedidoItem.service';
import { PedidoItemEntity } from './entities/pedidoItem.entity';
import { CreatePedidoItemDto } from './dto/create-pedido-item.dto';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { Rol } from 'src/usuarios/enum/rol.enum';
import { TipoDePedido } from './enum/tipoDePedido.enum';
import { DateParameters } from 'src/reportes/types/dateParameter.type';



@Injectable()
export class PedidosService {

  constructor(
    @InjectRepository(PedidoEntity) private readonly pedidoRepository:Repository<PedidoEntity>,
    private readonly pedidoItemService:PedidoItemService,
    private readonly usuariosService:UsuariosService,
  ){}

  async create(user:{sub:number,username:string,role:Rol,profileId:number},createPedidoDto: CreatePedidoDto) {
    const createPedidoItemsDtos:CreatePedidoItemDto[] = createPedidoDto.items
    const pedidoItems:PedidoItemEntity[] = await Promise.all( createPedidoItemsDtos.map(async(item) => {
      const pedidoItem = await this.pedidoItemService.create(item)
      return pedidoItem
    }))
    
    const pedido = this.pedidoRepository.create(
      {
        tipoDePedido:createPedidoDto.tipoDePedido,
        pagado:createPedidoDto.pagado ?? false,
        estado:createPedidoDto.estado ?? undefined,
      }
    )
    const usuario = await this.usuariosService.findOne(user.sub)
    if (user.role === Rol.User){
      if (usuario.perfil === null) throw new ConflictException('Es necesario tener un perfil para crear un pedido.')
      pedido.perfil = usuario.perfil
      
    }
    if(user.role === Rol.Seller || user.role === Rol.Admin){
      if (!(typeof createPedidoDto.perfilId === 'number'))throw new ConflictException('Es necesario un perfilId para crear el pedido.')
      const perfil = await this.usuariosService.findOnePerfil(createPedidoDto.perfilId)
      pedido.vendedor = usuario
      pedido.perfil = perfil
    }
    
    pedido.items = pedidoItems
    return await this.pedidoRepository.save(pedido,{reload:true})
  }

  async getTotalValuesFromSales(dateParameters:DateParameters){
    const from = new Date(dateParameters.fromYear,dateParameters.fromMonth,dateParameters.fromDay)
    const to = new Date(dateParameters.untilYear,dateParameters.untilMonth,dateParameters.untilDay)

    //Valor total envios online
    const ventasOnline = await this.pedidoRepository.find(
      {
        where:{
          tipoDePedido:TipoDePedido.Online,
          vendedor:Not(IsNull()),
          pagado:true,
          fecha:Between(from,to)
        },
        relations:{
          vendedor:true,
          items:{
            producto:true
          }
        }
      }
    )
    //Valor total ventas tienda
    const ventasTienda = await this.pedidoRepository.find(
      {
        where:{
          tipoDePedido:TipoDePedido.Tienda,
          vendedor:Not(IsNull()),
          pagado:true,
          fecha:Between(from,to)
        },
        relations:{
          vendedor:true,
          items:{
            producto:true
          }
        }
      }
    )
    //vendedores con mas ventas
    const mayoresVendedores = await this.pedidoRepository
    .createQueryBuilder('pedido')
    .leftJoin('pedido.vendedor','vendedor')
    .leftJoin('pedido.items','items')
    .leftJoin('items.producto','producto')
    .leftJoin('producto.categoria','categoria')
    .select(['vendedor.id','vendedor.username'])
    .addSelect(`COUNT(CASE pedido.tipoDePedido WHEN 'Tienda' THEN pedido.id END)`,'ventasTienda')
    .addSelect(`COUNT(CASE pedido.tipoDePedido WHEN 'Online' THEN pedido.id END)`,'ventasOnline')
    .addSelect('COUNT(pedido.id)','ventasTotales')
    .addSelect(`ROUND(SUM(items.cantidad*((producto.precio-(producto.precio * producto.descuento)/100) - ((categoria.descuento * (producto.precio-(producto.precio * producto.descuento)/100))/100))),2)`,'valorTotal')
    .addSelect(
      `ROUND(SUM(CASE pedido.tipoDePedido WHEN 'Tienda' THEN (items.cantidad*((producto.precio-(producto.precio * producto.descuento)/100) - ((categoria.descuento * (producto.precio-(producto.precio * producto.descuento)/100))/100))) ELSE 0 END), 2)`,
      'valorTotalTienda',
    )
    .addSelect(
      `ROUND(SUM(CASE pedido.tipoDePedido WHEN 'Online' THEN (items.cantidad*((producto.precio-(producto.precio * producto.descuento)/100) - ((categoria.descuento * (producto.precio-(producto.precio * producto.descuento)/100))/100))) ELSE 0 END), 2)`,
      'valorTotalOnline',
    )
    .where('pedido.vendedor IS NOT NULL')
    .andWhere('pedido.pagado = :pagado',{pagado:true})
    .andWhere('pedido.fecha >= :from',{from:from})
    .andWhere('pedido.fecha <= :to',{to:to})
    .groupBy('vendedor.id')
    .limit(5)
    .orderBy('COUNT(pedido.id)','DESC')
    .getRawMany()
    let valorTotalEnviosOnline = 0
    let valorTotalVentasTienda = 0
    let mejor_vendedor_valor = 0
    ventasOnline.forEach((venta) => {
      valorTotalEnviosOnline += venta.getTotalPrice()
      if (mayoresVendedores[0].vendedor_username === venta.vendedor.username){
        mejor_vendedor_valor += venta.getTotalPrice()
      }
    })
    ventasTienda.forEach((venta) => {
      valorTotalVentasTienda += venta.getTotalPrice()
      if (mayoresVendedores[0].vendedor_username === venta.vendedor.username){
        mejor_vendedor_valor += venta.getTotalPrice()
      }
    })
    const valoresTotales = {
      mayoresVendedores,
      mejor_vendedor_valor:Math.round(mejor_vendedor_valor),
      enviosOnline:{
        enviosTotales:ventasOnline.length,
        valorTotalEnviosOnline:Math.round(valorTotalEnviosOnline)
      },
      ventasTienda:{
        ventasTotales:ventasTienda.length,
        valorTotalVentasTienda:Math.round(valorTotalVentasTienda)
      },
      valorTotal: Math.round(valorTotalEnviosOnline + valorTotalVentasTienda)//todas las ventas
    }
    return valoresTotales
  }

  async getTotalSalesFromCategory(dateParameters:DateParameters){
    const from = new Date(dateParameters.fromYear,dateParameters.fromMonth,dateParameters.fromDay)
    const to = new Date(dateParameters.untilYear,dateParameters.untilMonth,dateParameters.untilDay)
    const productosVendidos = await this.pedidoRepository
    .createQueryBuilder('pedido')
    .leftJoin('pedido.items','items')
    .leftJoin('items.producto','producto')
    .leftJoin('producto.categoria','categoria')
    .select(['categoria.id','categoria.nombre','producto.nombre','producto.codigo'])
    .addSelect('SUM(items.cantidad)','totalProductos')
    .where('pedido.pagado = :pagado',{pagado:true})
    .andWhere('pedido.fecha >= :from',{from:from})
    .andWhere('pedido.fecha <= :to',{to:to})
    .groupBy('categoria.id')
    .addGroupBy('producto.id')
    .orderBy('categoria.id')
    .addOrderBy('producto.nombre')
    .getRawMany()

    const totalProductosPorCategoria = {}
    productosVendidos.forEach(item =>{

      const categoria_id = item.categoria_id
      const categoria_nombre = item.categoria_nombre
      if(!totalProductosPorCategoria[categoria_id]){
        totalProductosPorCategoria[categoria_nombre] = {
          categoria_id,
          categoria_nombre:categoria_nombre,
          productos:[],
          totalProductoPorCategoria:0
        }

      }
      totalProductosPorCategoria[categoria_nombre].productos.push({
        producto_nombre:item.producto_nombre,
        producto_cantidad: parseInt(item.totalProductos,10),
        producto_codigo:item.producto_codigo,
      })

      totalProductosPorCategoria[categoria_nombre].totalProductoPorCategoria += parseInt(item.totalProductos,10)
    })
    return totalProductosPorCategoria
  }

  async getSoldProductsReport(order:'ASC'|'DESC'){
    const productosVendidos = await this.pedidoRepository
    .createQueryBuilder('pedido')
    .leftJoin('pedido.items','items')
    .leftJoin('items.producto','producto')
    .select(['producto.id','producto.nombre','producto.codigo'])
    .addSelect('SUM(items.cantidad)','totalProductos')
    .where('pedido.pagado = :pagado',{pagado:true})
    .groupBy('producto.id')
    .orderBy('SUM(items.cantidad)',order)
    .getRawMany()
    return productosVendidos
  }

  async findAll() {
    const pedidos = await this.pedidoRepository.find(
      {
        relations:{
          perfil:true,
          items:{
            producto:true
          },
          vendedor:true,
          envios:true
        }
      }
    )
    pedidos.map((pedido) => pedido['precioTotal'] = pedido.getTotalPrice())
    return pedidos
  }

  

  async findOne(id: number) {
    const pedido = await this.pedidoRepository.findOneOrFail({where:{id:id},relations:{items:{producto:true}}})
    pedido['precioTotal'] = pedido.getTotalPrice()
    return pedido
  }


  async findOwnPedidos(user:{sub:number,username:string,role:Rol,profileId:number}){
    const usuarioPedidos = await this.pedidoRepository.find(
      {
        where:{
          perfil:{
            id:user.profileId
          }
        },
        order:{
          fecha:'DESC'
        }
      }
    )

    return usuarioPedidos
  }

  async findOwnVentas(user:{sub:number,username:string,role:Rol,profileId:number}){
    const usuarioVentas = await this.pedidoRepository.find(
      {
        where:{
          vendedor:{
            id:user.sub
          }
        },
        order:{
          fecha:'DESC'
        }
      }
    )
    return usuarioVentas
  }

  async findOwnOne(user:{sub:number,username:string,role:Rol,profileId:number},id:number){
    const pedido = await this.pedidoRepository.findOneOrFail(
      {
        where:{
          id:id,
          perfil:{
            id:user.profileId
          }
        },
        relations:{
          envios:true,
          pago:true,
          items:{
            producto:true
          }
        }
      }
    )
    pedido['precioTotal'] = pedido.getTotalPrice()
    return pedido
  }

  async update(id: number, updatePedidoDto: UpdatePedidoDto) {
    const pedido = await this.findOne(id)
    const pedidoItemIds = pedido.items.map((item) => item.id)
    const {items,...pedidoData} = updatePedidoDto
    Object.assign(pedido,pedidoData)
    const updatedPedido = await this.pedidoRepository.save(pedido)

    const updatedItems:Promise<PedidoItemEntity>[] | undefined = items?.map(async (item)=>{
      if (pedidoItemIds.includes(item.pedidoItemId)){
        const pedidoItem = await this.pedidoItemService.update(item.pedidoItemId,item)
        return pedidoItem
      }
      throw new NotFoundException(`item con el id ${item.pedidoItemId} no se encuentra en el pedido con id ${pedido.id}, solo las ids ${pedidoItemIds} estan relacionadas.`)
      
    })

    if (updatedItems){
        updatedPedido.items = await Promise.all(updatedItems)
    }

    return updatedPedido
  }

  async addPedidoItems(pedidoId:number,createPedidoItemsDtos:CreatePedidoItemDto[]){
    const pedido = await this.findOne(pedidoId)
    const productIds = pedido.items.map((item) =>{
      return item.producto.id
    } )
    const pedidoItems:PedidoItemEntity[] = await Promise.all( createPedidoItemsDtos.map(async (item) => {
      if (productIds.includes(item.productoId)){
        throw new BadRequestException(`Producto con id ${item.productoId} ya existe en el pedido, solo las los productos con id ${productIds} estan relacionados.`)
      }
      const pedidoItem = await this.pedidoItemService.create(item)
      pedidoItem.pedido = pedido
      return await this.pedidoItemService.save(pedidoItem)
    }))
    return pedidoItems

  }

  async removePedidoItems(pedidoId:number,itemsIds:number[]){
    const pedido = await this.findOne(pedidoId)
    const pedidoItemsIds = pedido.items.map((item) => item.id)
    const deletedPedidoItems:(PedidoItemEntity | undefined)[] = await Promise.all(itemsIds.map(async (itemId) => {
      if (pedidoItemsIds.includes(itemId)){
        return await this.pedidoItemService.remove(itemId)
      }
      throw new BadRequestException(`Item con el id ${itemId} no existe en pedido con id ${pedido.id}, solo los items con id ${pedidoItemsIds} estan relacionados.`)
    }))
    return deletedPedidoItems
  }

  async save(pedidoEntity:PedidoEntity){
    return await this.pedidoRepository.save(pedidoEntity)
  }

  async remove(id: number) {
    const pedido = await this.findOne(id)
    return await this.pedidoRepository.remove(pedido)
  }
}
