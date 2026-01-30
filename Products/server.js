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
    const body = req
})
 app.listen(9000, () =>  console.log("Server started on http://localhost:9000"))




