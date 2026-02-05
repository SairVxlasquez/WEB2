const express = require('express');
const app = express();
const fs = require('fs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const FILE_PATH = "./products.json";

const readData = () => JSON.parse(fs.readFileSync(FILE_PATH, "utf-8"));
const writeData = (data) => fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
function hasContent(str) {
    return typeof str === 'string' && str.length > 0;
}

const checkProductExists = (req, res, next) => {
    const id = parseInt(req.params.id);
    const data = readData();
    const products = data.products || [];
    const product = products.find(p => p.id === id);

    if (!product) {

        return res.status(404).json({ error: "Product not found" });
    }
    

    req.product = product;
    req.allData = data; 
    next();
};


const validatePayload = (req, res, next) => {
    const { name, category, price } = req.body;
    

    if (req.method === "POST") {
        if (!name || !category || isNaN(price)) {
            return res.status(400).json({ error: "Name, category and price are required" });
        }
    }
   
    next();
};


app.get("/products", (req, res) => {
    const { search, category, subcategory } = req.query;
    const data = readData();
    let products = data.products || [];

    if (hasContent(category)) {
        products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (hasContent(subcategory)) {
        products = products.filter(p => p.subcategory.toLowerCase() === subcategory.toLowerCase());
    }
    if (hasContent(search)) {
        const lowerSearch = search.toLowerCase();
        products = products.filter(p => JSON.stringify(p).toLowerCase().includes(lowerSearch));
    }

    res.json({ count: products.length, products });
});


app.get("/products/:id", checkProductExists, (req, res) => {
    res.json(req.product);
});


app.post("/products", validatePayload, (req, res) => {
    const { name, category, subcategory, price, currency, stock, rating } = req.body;
    const data = readData();
    const products = data.products || [];

    const newId = products.length > 0 ? products[products.length - 1].id + 1 : 1001;

    const newProduct = {
        id: newId,
        name,
        category,
        subcategory,
        price: Number(price),
        currency: currency || "USD",
        stock: Number(stock) || 0,
        rating: Number(rating) || 0
    };

    products.push(newProduct);
    data.products = products; 
    data.count = products.length;

    writeData(data);
    res.status(201).json({
        message: "Product created successfully",
        product: newProduct
    });
});


app.put("/products/:id", checkProductExists, validatePayload, (req, res) => {
    const product = req.product;
    const data = req.allData;

    if (req.body.name) product.name = req.body.name;
    if (req.body.category) product.category = req.body.category;
    if (req.body.subcategory) product.subcategory = req.body.subcategory;
    if (req.body.price) product.price = Number(req.body.price);
    if (req.body.rating) product.rating = Number(req.body.rating);
    if (req.body.stock) product.stock = Number(req.body.stock);

    writeData(data);
    res.status(200).json({ message: `Product ${product.id} updated successfully`, product });
});


app.delete("/products/:id", checkProductExists, (req, res) => {
    const id = parseInt(req.params.id);
    const data = req.allData;

    
    data.products = data.products.filter(p => p.id !== id);
    data.count = data.products.length;

    writeData(data);
    res.status(204).send(); 
});

app.listen(9000, () => console.log("Server started on http://localhost:9000"));