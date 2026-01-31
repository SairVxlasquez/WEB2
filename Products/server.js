const express = require('express')
const app = express()
const fs = require('fs')


function hasContent(str){
    return typeof str === 'string' && str.length > 0 
}

app.use(express.json())
app.use(express.urlencoded())

app.get("/products", (req, res) => {
    const {search, category , subcategory} = req.query 
    let products = JSON.parse(fs.readFileSync("./products.json", {encoding: "utf-8"}))

    if(hasContent(category)){
        products = products.filter(product => product.category.toLowerCase() === category.toLowerCase())    
    }
    if(hasContent(subcategory)){
        products = products.filter(product => product.subcategory.toLowerCase() === subcategory.toLowerCase())    
    }
    if(hasContent(search)){
        products = products.filter(product => {
            const strProduct = JSON.stringify(product).toLowerCase()
            const lowersearch = search.toLowerCase()
            return strProduct.includes(lowersearch)
        })
    }
    
    res.json({
        count: products.length, products 
    })
})  

app.post("/products", (req, res) => {
    const {name, category, subcategory, price, currency, stock, rating} = req.body;

    const data = JSON.parse(fs.readFileSync("./products.json", "utf-8"));

    const products = data.products;
    const newId = products.length > 0 ? products[products.length -1].id + 1 : 1001;

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
    data.count = products.length;

    fs.writeFileSync("./products.json", JSON.stringify(data, null, 2), {encoding: "utf-8"});
    
    res.status(201).json(newProduct);
});

app.put("/products/:id", (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
    }

    let data = JSON.parse(fs.readFileSync("./products.json", "utf-8"));
    let products = data.products || [];

    let product = products.find(p => p.id === id);
    
    if (!product) {
        return res.status(404).json({ error: "Product not found" });
    }
    if (req.body.name)        product.name        = req.body.name;
    if (req.body.category)    product.category    = req.body.category;
    if (req.body.subcategory) product.subcategory = req.body.subcategory;
    if (req.body.price)       product.price       = Number(req.body.price);
    if (req.body.rating)      product.rating      = Number(req.body.rating);
    if (req.body.stock)       product.stock       = Number(req.body.stock);

    fs.writeFileSync("./products.json", JSON.stringify(data, null, 2));

    res.status(200).json({ message: `Product ${id} updated successfully` });
});


 app.listen(9000, () =>  console.log("Server started on http://localhost:9000"))




