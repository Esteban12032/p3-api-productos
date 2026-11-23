require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

const ORIGENES = (process.env.ORIGEN_PERMITIDO || "")
    .split(",")
    .map(origen => origen.trim())
    .filter(Boolean);

app.use(cors({ origin: ORIGENES }));
app.use(express.json());

// Temporary storage for products
let productos = [
    { id: 1, nombre: "Laptop", precio: 15000, stock: 5 },
    { id: 2, nombre: "Mouse", precio: 250, stock: 10 }
];

let siguienteId = 3;

// GET: List products
app.get("/api/productos", (req, res) => {
    res.status(200).json(productos);
});

// Middleware: Check API key
function requiereToken(req, res, next) {
    if (!process.env.API_KEY ||
        req.get("x-api-key") !== process.env.API_KEY) {
        return res.status(401).json({
            error: "Token inválido o ausente"
        });
    }

    next();
}

// POST: Create product
app.post("/api/productos", requiereToken, (req, res) => {
    const { nombre, precio, stock } = req.body;

    if (typeof nombre !== "string" || !nombre.trim() ||
        typeof precio !== "number" || precio < 0 ||
        !Number.isInteger(stock) || stock < 0) {
        return res.status(400).json({
            error: "Datos del producto inválidos"
        });
    }

    const producto = {
        id: siguienteId++,
        nombre: nombre.trim(),
        precio,
        stock
    };

    productos.push(producto);
    res.status(201).json(producto);
});

// PUT: Update product
app.put("/api/productos/:id", requiereToken, (req, res) => {
    const producto = productos.find(
        p => p.id === Number(req.params.id)
    );

    if (!producto) {
        return res.status(404).json({
            error: "Producto no encontrado"
        });
    }

    const { nombre, precio, stock } = req.body;

    if (typeof nombre !== "string" || !nombre.trim() ||
        typeof precio !== "number" || precio < 0 ||
        !Number.isInteger(stock) || stock < 0) {
        return res.status(400).json({
            error: "Datos del producto inválidos"
        });
    }

    producto.nombre = nombre.trim();
    producto.precio = precio;
    producto.stock = stock;

    res.status(200).json(producto);
});

// DELETE: Delete product
app.delete("/api/productos/:id", requiereToken, (req, res) => {
    const id = Number(req.params.id);
    const indice = productos.findIndex(p => p.id === id);

    if (indice === -1) {
        return res.status(404).json({
            error: "Producto no encontrado"
        });
    }

    productos.splice(indice, 1);
    res.status(204).send();
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor funcionando en puerto ${PORT}`);
});