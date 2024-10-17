import express from "express";
import { getAllSales, getSale, getSaleByLocation, getSalesByFilters, getTopSellingProducts, getCustomersBySatisfaction } from "../data/sales.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0;
  const page = req.query.page ? parseInt(req.query.page) : 0;

  res.json(await getAllSales(pageSize, page));
});

// Endpoint para obtener venta x id
router.get("/:id", async (req, res) => {
  console.log("ID recibido:", req.params.id); // Agrega esto para depuración
  try {
    const sale = await getSale(req.params.id);
    res.json(sale);
  } catch (error) {
    console.error("Error al obtener la venta:", error);
    res.status(400).json({ message: error.message });
  }
});

//filtrar las ventas por localización (storeLocation) "Seattle"
router.get("/location/:location", async (req, res) => {
  const { location } = req.params; // Obtener el location de los parámetros de la URL
  const page = parseInt(req.query.page) || 1; // Obtener la página de la consulta, predeterminado a 1
  const limit = parseInt(req.query.limit) || 10; // Obtener el límite de resultados, predeterminado a 10

  try {
    const { totalSales, sales } = await getSaleByLocation(location, page, limit); // Llamar a la función de acceso a datos
    const totalPages = Math.ceil(totalSales / limit); // Calcular el total de páginas

    res.json({
      totalSales,
      currentPage: page,
      totalPages,
      sales, // Retornar las ventas encontradas
    });
  } catch (error) {
    console.error("Error al obtener las ventas de esa locacion:", error);
    res.status(500).json({ error: "Error al obtener las ventas de la locacion ingresada" });
  }
});

// Endpoint para obtener los 10 productos más vendidos
router.get("/top-selling/:limit", async (req, res) => {
  try {
    let { limit = 10 } = req.params;
    limit = parseInt(limit);
    console.log(limit);

    const topProducts = await getTopSellingProducts(limit); // Obtener los 10 productos más vendidos
    console.log(topProducts)
    res.json(topProducts);
  } catch (error) {
    console.error("Error al obtener los productos más vendidos:", error);
    res.status(500).json({ error: "Error al obtener los productos más vendidos" });
  }
});

router.get("/filter/f", async (req, res) => {
  const { location, purchaseMethod, couponUsed } = req.query; // Obtener los parámetros de la consulta ESTO DESESTRUCTURA LO QUE VIENE EN LOS QUERY.PARAMS BLABLABLA?QUERY.PARAMS&QUERY.PARAMS
  const page = parseInt(req.query.page) || 1; // Obtener la página, predeterminado a 1
  const limit = parseInt(req.query.limit) || 10; // Obtener el límite, predeterminado a 10

  // Convertir couponUsed a booleano si está presente
  const couponUsedBool = couponUsed !== undefined ? couponUsed === 'true' : undefined;

  try {
    const { totalSales, sales } = await getSalesByFilters(location, purchaseMethod, couponUsedBool, page, limit);
    const totalPages = Math.ceil(totalSales / limit); // Calcular el total de páginas

    res.json({
      totalSales,
      currentPage: page,
      totalPages,
      sales, // Retornar las ventas encontradas
    });
  } catch (error) {
    console.error("Error al obtener las ventas filtradas:", error);
    res.status(500).json({ error: "Error al obtener las ventas con los filtros ingresados" });
  }
});

// Obtener clientes por satisfacción
router.get("/customers/satisfaction", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const customers = await getCustomersBySatisfaction(limit);
    res.json(customers);
  } catch (error) {
    console.error("Error obteniendo los clientes:", error);
    res.status(500).json({ error: "Ocurrió un error al obtener los clientes." });
  }
});



export default router;
