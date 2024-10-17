import getConnection from "./conn.js";
import { ObjectId } from "mongodb";
const DATABASE = "sample_supplies";
const MOVIES = "sales";

async function getAllSales(pageSize, page) {  //EJ: http://localhost:3000/api/sales?pageSize=[pageSize]&page=[page]
  const connectiondb = await getConnection();
  const sales = await connectiondb
    .db(DATABASE)
    .collection(MOVIES)
    .find({})
    .limit(pageSize)
    .skip(pageSize * page)
    .toArray();
  return sales;
}

export async function getSale(id) {   //EJ: http://localhost:3000/api/sales/5bd761dcae323e45a93cd09d

  if (typeof id !== "string" || id.length !== 24) {
    throw new Error("ID debe ser una cadena hexadecimal de 24 caracteres");
  }

  const clientmongo = await getConnection();
  const movie = await clientmongo
    .db(DATABASE)
    .collection(MOVIES)
    .findOne({ _id: new ObjectId(id) });

  return movie;
}

export async function getSaleByLocation(location, page, limit) {     //EJ: http://localhost:3000/api/sales/location/Seattle?page=10&limit=3 
  const clientmongo = await getConnection();
  const skip = (page - 1) * limit;

  const sales = await clientmongo
    .db(DATABASE)
    .collection(MOVIES)
    .find({ storeLocation: location })
    .skip(skip)
    .limit(limit)
    .toArray();

  const totalSales = await clientmongo
    .db(DATABASE)
    .collection(MOVIES)
    .countDocuments({ storeLocation: location });

  console.log("Total de ventas encontradas por location:", totalSales);
  return { totalSales, sales };
}






export async function getSalesByFilters(location, purchaseMethod, couponUsed, page, limit) { //EJ: http://localhost:3000/api/sales/filter/f?location=Denver&purchaseMethod=Online&couponUsed=true
  const clientmongo = await getConnection();
  const skip = (page - 1) * limit;

  const filter = {};

  // Filtrar por localización
  if (location) {
    filter.storeLocation = location;
  }

  // Filtrar por método de compra
  if (purchaseMethod) {
    filter.purchaseMethod = purchaseMethod;
  }

  // Filtrar por uso de cupón, asegurando que couponUsed sea un booleano
  if (couponUsed !== undefined) {
    filter.couponUsed = couponUsed === true; // Asegúrate de convertir a booleano*****************************
  }

  // Obtener ventas filtradas
  const sales = await clientmongo
    .db(DATABASE)
    .collection(MOVIES)
    .find(filter)
    .skip(skip)
    .limit(limit)
    .toArray();

  // Contar total de ventas según los filtros aplicados
  const totalSales = await clientmongo
    .db(DATABASE)
    .collection(MOVIES)
    .countDocuments(filter);

  return { totalSales, sales };
}

export async function getTopSellingProducts(limit) {  //EJ: http://localhost:3000/api/sales/top-selling/10   ****limitar resultado
  const clientmongo = await getConnection();

  const sales = await clientmongo
    .db(DATABASE)
    .collection(MOVIES)
    .aggregate([
      // Descomponemos el array de items
      { $unwind: "$items" },
      // Agrupamos por el nombre del producto y sumamos las cantidades
      {
        $group: {
          _id: "$items.name",
          totalQuantity: { $sum: "$items.quantity" },
        }
      },
      // Ordenamos por la cantidad total de cada producto
      { $sort: { totalQuantity: -1 } },
      // Limitamos los resultados
      { $limit: limit }
    ])
    .toArray();

  console.log("Top 10 productos mas vendido:", sales);
  return sales;
}

export async function getCustomersBySatisfaction(limit) {     //EJ: http://localhost:3000/api/sales/customers/satisfaction?limit=20000    ****limitar resultado 
  const clientmongo = await getConnection();

  if (limit < 1) {
    throw new Error("El límite debe ser un número mayor a 0");
  }

  const customers = await clientmongo
    .db(DATABASE)
    .collection(MOVIES)
    .aggregate([
      {
        $project: {
          _id: 0,
          "customer.email": 1,
          "customer.gender": 1,
          "customer.age": 1,
          "customer.satisfaction": 1
        }
      },
      {
        $group: {
          _id: "$customer.email",
          gender: { $first: "$customer.gender" },
          age: { $first: "$customer.age" },
          avgSatisfaction: { $avg: "$customer.satisfaction" }
        }
      },
      { $sort: { avgSatisfaction: -1 } },
      { $limit: limit }
    ])
    .toArray();

  if (customers.length === 0) {
    throw new Error("No se encontraron clientes con datos de satisfacción");
  }

  return customers;
}



export { getAllSales };
