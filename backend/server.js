const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_PATH = path.join(__dirname, 'data.json');

app.get('/sales', (req, res) => {

    const { search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

    if (search) {
        data = data.filter(entry =>
            entry.CLIENTE.toLowerCase().includes(search.toLowerCase()) ||
            entry.CÓDIGO.toString().includes(search)
        );
    }

    const parsePrice = (price) => {
        if (price && price !== '-') {
            return parseFloat(price.replace('R$ ', '').replace(',', '.'));
        }
        return 0;
    };
    const paginatedData = data.slice(offset, offset + limit);

    const salesData = data.map(entry => {
        const precoTVNormal = parsePrice(entry['PREÇO TV']);
        const precoTVPromocional = parsePrice(entry['PREÇO TV PROMOCIONAL']);
        const precoInternetNormal = parsePrice(entry['PREÇO INTERNET']);
        const precoInternetPromocional = parsePrice(entry['PREÇO INTERNET PROMOCIONAL']);
        const precoFoneNormal = parsePrice(entry['PREÇO FONE']);
        const precoFonePromocional = parsePrice(entry['PREÇO FONE PROMOCIONAL']);
        const precoCelularNormal = parsePrice(entry['PREÇO CELULAR']);
        const precoCelularPromocional = parsePrice(entry['PREÇO CELULAR PROMOCIONAL']);

        const valorTotalNormal = precoTVNormal + precoInternetNormal + precoFoneNormal + precoCelularNormal;
        const valorTotalPromocional = precoTVPromocional + precoInternetPromocional + precoFonePromocional + precoCelularPromocional;

        return {
            codigo: entry.CÓDIGO,
            contrato: entry.CONTRATO,
            dataVenda: moment(entry['DATA DO PREENCHIMENTO DO CONTRATO'], "MM/DD/YYYY HH:mm").tz("America/Sao_Paulo").format('DD/MM/YYYY HH:mm'),
            vendedor: entry.VENDEDOR,
            cliente: entry.CLIENTE,
            valorTotalNormal: `R$ ${valorTotalNormal.toFixed(2)}`,
            valorTotalPromocional: valorTotalPromocional > 0 ? `R$ ${valorTotalPromocional.toFixed(2)}` : '-'
        };
    });

    salesData.sort((a, b) => moment(a.dataVenda, 'DD/MM/YYYY HH:mm').diff(moment(b.dataVenda, 'DD/MM/YYYY HH:mm')));

    res.json(salesData);
});

app.get('/expirations', (req, res) => {
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8'));
    const today = moment().tz("America/Sao_Paulo").startOf('day');

    const expirationsData = data.map(entry => {
        const dataInicioTratamento = moment.tz(entry['DATA/HORA INÍCIO TRATAMENTO'], "MM/DD/YYYY HH:mm", "America/Sao_Paulo");
        const expirationDate = dataInicioTratamento.isValid() ? dataInicioTratamento.add(entry['DIA DE VENCIMENTO'], 'days') : null;

        const daysToExpiration = expirationDate ? expirationDate.diff(today, 'days') : null;

        const diasParaVencerTexto = daysToExpiration === 0 ? "Hoje" :
            daysToExpiration === 1 ? "Amanhã" : `Em ${daysToExpiration} dias`;

        if (daysToExpiration !== null && daysToExpiration >= 0) {
            return {
                cliente: entry.CLIENTE,
                contrato: entry.CONTRATO,
                cidade: entry.CIDADE,
                dataVencimento: expirationDate.format('DD/MM/YYYY HH:mm'),
                diasParaVencimento: diasParaVencerTexto
            };
        }
        return null;
    })
        .filter(entry => entry !== null)
        .sort((a, b) => a.diasParaVencimento - b.diasParaVencimento);

    res.json(expirationsData);
});


app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const users = JSON.parse(fs.readFileSync(path.join(__dirname, 'users.json'), 'utf8'));

    const user = users.find(u => u.email === email);
    if (user && user.password === password) {
        console.log('Login bem-sucedido para:', email);
        res.json({ message: "Login successful" });
    } else {
        console.log('Erro de login para o usuário:', email);
        res.status(401).json({ message: "Invalid credentials" });
    }
});


const port = 3001;
app.listen(port, () => console.log(`Servidor rodando em http://localhost:${port}`));