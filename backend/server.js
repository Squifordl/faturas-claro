const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const moment = require('moment-timezone');
const http = require('http');

const server = http.createServer((req, res) => {
    res.end('Hello, World!');
});
const app = express();
app.use(cors());
app.use(express.json());

const DATA_PATH = path.join(__dirname, 'data.json');

app.get('/api/sales', (req, res) => {

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

app.get('/api/expirations', (req, res) => {
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


app.post('/api/login', (req, res) => {
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
const SPREADSHEET_ID = '1hwCwLxpuSpX98bsttpJdJgbqlrVvijNb-TaYzPJa7Dg';
const RANGE = 'Respostas ao formulário 1';
const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'creden.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4' });

app.get('/api/real-time-sales', async (req, res) => {
    try {
        const client = await auth.getClient();
        const response = await sheets.spreadsheets.values.get({
            auth: client,
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
        });

        const rows = response.data.values;
        if (rows.length > 1) {
            const salesData = rows.slice(1)
                .map(row => ({
                    dataVenda: row[1],
                    nomeCompleto: row[5] || '',
                    cpf: row[7] || '',
                    fone: row[11] || '',
                    cidade: row[17] || '',
                    vendedor: row[2] || '',
                    status: row[3] || ''
                }))
                .filter(sale => sale.nomeCompleto && sale.cpf && sale.fone && sale.cidade && sale.vendedor)
                .sort((a, b) => moment(b.dataVenda, 'DD/MM/YYYY HH:mm').diff(moment(a.dataVenda, 'DD/MM/YYYY HH:mm')));

            res.json(salesData);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('Erro ao buscar vendas em tempo real:', error);
        res.status(500).json({ message: "Erro ao acessar a planilha do Google Sheets" });
    }
});
app.post('/api/generate-biometry', async (req, res) => {
    console.log('chegou')
    const { cpf, telefone } = req.body;
    const url = 'https://claro-link.brsafe.com.br/php/s2.php';

    const formData = new FormData();
    formData.append('cod_usuario', 'YPEQ2');
    formData.append('cpf', cpf);
    formData.append('telefone', telefone);
    formData.append('cod_loja', 'O0ED');
    formData.append('jwt', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6IllQRVEyIn0.Wdq6fKBecpId5rStNwwhk8H8wvEffhxiFK3QpXwmsgg');

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': '*/*',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                'Origin': 'https://claro-link.brsafe.com.br',
                'Referer': 'https://claro-link.brsafe.com.br/',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin',
                'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"Windows"',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            body: formData,
        });

        if (response.ok) {
            const data = await response.json();
            res.json(data);
        } else {
            console.error('Erro ao enviar biometria');
            res.status(response.status).json({ message: 'Erro ao enviar biometria' });
        }
    } catch (error) {
        console.error('Erro ao enviar biometria:', error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
});
const closeServer = () => {
    console.log('Encerrando o servidor...');
    server.close(() => {
        console.log('Servidor encerrado.');
        process.exit(0);
    });
};

process.on('SIGINT', closeServer);

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Servidor rodando em https://localhost:${port}`));