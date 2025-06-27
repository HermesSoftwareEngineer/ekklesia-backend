const express = require('express');
const port = 3000
const sequelize = require('./config/db.config')
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get("/helloworld", (req, res) => {
    res.send("Olá, mundo!")
})

// Rota da versão 1
const routes = require('./routes/routes')
app.use("/v1/", routes)

app.listen(port, () => {
    console.log(`Servidor rodando em: http://localhost:${port}/`)
})
