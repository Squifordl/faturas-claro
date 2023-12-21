const express = require('express');
const cors = require('cors');
const pdf = require('html-pdf');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const moment = require('moment-timezone');
const axios = require('axios')

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, '../frontend')));
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
const generatePDF = (htmlContent) => {
    return new Promise((resolve, reject) => {
        const options = { format: 'Letter' };

        pdf.create(htmlContent, options).toFile('output.pdf', (err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve('output.pdf');
            }
        });
    });
};

app.post('/api/buscar', async (req, res) => {
    console.log('veioooo')
    const { cpf } = req.body;
    let user
    let user2

    const url = 'https://api.claro.com.br/residential/v1/easy-invoices/contracts';

    const headers = {
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Origin': 'https://minhaclaroresidencial.claro.com.br',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'X-Captcha-Token': '03AFcWeA4JaNdkf-XBQLiRHUrWioUTV_Z_qSIKeljV9yK7JGyE9og9jXDghgn_R186qb7CwNyl6s5uJ1b8iCUAJ5iXzBcal67ZwYWJWkgDW7MxE7WGZUXEiQnxyT476hSjQc2Nbczg_EkuUJpd90njjHXRcNpyQSfPnQuZ60Iux5qvuJJf4Yu2BXePLbecqS0JL1h_oZE14lsBJ1RSJYmYhOWKlGPzQEGfA0kWju23J7_ge27JuAr7RM1WYKIF8k4heZ8JOtTlMg_QvWAk5ioO9yhB67HNPNruZ1c8QOvtpjp4ixtKwRGqKQyw1dwrlEDNUi8MBw8maslCPk9H0_PYAksz8UrPfoh0bTNXRqcMFaqlbusjm2mZWVvgLD0VnzbQyjCLobZwkJ9ZHTg1ueGhqpuR1VZgjGAzDE3F43oz9lzchMnRGMVa-7ypl93LZeKKbhAf6p-VVsyo4YyzILTi4FPzzRYWclxfiJBXR72gS4_Fmjw1hI2CFkJcxiL3RFotnP4KA86PnimhQwH5qugkv05-P-xAn3ul68UvKrF__GO7EZ4dhZgCrqg917EDwUmzW_3-6lK5mF_VeV0flhXM_a0_vINVQO8D4JPjG8Rd3UZjqqh_siLoXjlte0kjUnIXZrIDWnTvjk4xSyOnzrTcgXCWdQa7mMGB7w_Zn0yPZfmsFh7F_yQcZdGlKKowVpkb8k4xPK2BujGKoHcEz2hKB-_ZGFhLU4sARs-z72DEPrO51i3GUAaIbJxA4rTou8otNwwF2vy5ZlMRKWLin9g6FjTFru3PTFOsXRjn-OKdRHmUsJimqaG_tFbj2rbmFkOOqc00ufdrFySCJ4gCSPfUDxgXpF-vPcPg7uHe1lSeOwZmiVtdkZvD0jKyR8DWi72NlXxl2xTUybsTh8Ze1s0WqcZICl6j5F93dndXXFBk9nLAByWALwCXOezWeeeneCM-QTXO9aHyVzDSHF-EhsLVw1uLPNTHXvBIHACsqDF6yT1EkZm7feu8dXwaKO6wH0KC0vVcJVs_k1Z3UZD4fZIaZ-1_8K2-gMR1E4w0VZ4yC4tPovRBWzQBroaAiLovn_f-RA7Su-TuuPG7ukG8jnF2Zhh6Br_VnwYHhLr3gRVzQCUg7zIV-swNY56HVRssVC3ktIjekmV3dLCxj3aOA-CYsWapWfC_pgEjDxQdcBh8pyK3vjx3_MZfodmWxfXN1yzoMxfk2pEtO8_Q4EEhFu_WsL2bKg31oW4uzb-fUJ4bSPRWZVbD7mUZl3fZwGuDnatmi5ACYTt8B3-PfYuJhUEyWM5ZepA64ODvtqe8ak0gLf17SrlBBQNVY-H6nwpIxkYJcG9VHEJk80LUCE4N8Y4XNlDMBe92YYWGuirxZK7iaDz4JGb_cy_5LuuEiZIZsVa2K2Y_3qoxN1rXOd3_1aKB2l2ZkyXCmhm9aKmRtZfQWI-gXn3jogSiIlvYchQM-HMykphswubi96cXcGxNK3wP5wc8IXC2x-j-KjBVmC52-NDtfvhZYe8VqQ8g59FfOiFijg_77LVNQmWBDDD0fsKMHEM0VOSM4Q2JEORiM_wBkwNqc4AMyZpYvt9MO4Xul0KGpQkTcV47MkmA6jRTawrMQpzMxcBV_J2PYh9NUkEVG4VFV_nkBekzS5aoxwYmFI7QD4_2Uxw3903O106Tk-MTSF-JqVO7yq7EYw',
        'X-Client-Key': 'xztFeG6jppikbqaUUmWi4YmNspOKwSAg',
        'X-Document': cpf
    };

    await axios.get(url, { headers })
        .then((response) => {
            console.log(response.data)
            user = response.data.contracts[0].identifier
            user2 = response.data.contracts[0].identifier
        })
        .catch((error) => {
            console.error(error);
        });

    const urll = `https://api.claro.com.br/residential/v1/easy-invoices/invoices/${user}`;

    const headerss = {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Origin': 'https://minhaclaroresidencial.claro.com.br',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'X-Captcha-Token': '03AFcWeA7j99QBA1ZCdqhMwaDGlRAbOI_9tZAulLihu16tWknbxU2n-ouBcoIt_LDvoa3S1T8Rl86bKOvacMCzFQM1rK1IBICUke05SPwAyDBQKlHp5dFNlSSKDTBwmxiA24yaCzggqc5ixxcmV2QzusK1HKqQk_mlwjQzQboxp306ztPBcVPwwIiYmVCymCcaG6do2EkbRPM4bdpOrdTSAthY95Rc0GNRCUY-rAeK3kStQnwQaOQENUCHn8OnQWTolaA86csV4-E_OGkzLnQL8IWBgemOrb_3PWrG_byC7dwETL0IMSbNltWqrQmzjI3-vgxWO58LCuju-9cHzMAz11cz7e_EMi_GaeCQ2187U0_igS8wjGBapVs5Ui4r-rXxgrOBDICwI2ubszLdlejEBfWR3TKO1PT7q8UsZPT4yuNnSOKNYxuAR_QfEVun_LGIEnhXjfRf5Z9-GodW0BqkuuwrrlVW1waUkQ6zJ42qA5sFDohN6Y2sQBJGKpbvScPDy9VMIuoVHj2HWjru8S4q-PlGEYm3VYEYl69vTOUtiqKYSJ6jyvQY8T3uD2oQQZRL5dF52jKw6pJbR81Vy-NQF1jbLKo6rTkZSYZvFdj8vatDCdSwFD5JhtPNHtSbzPthQYRj8bTaWl4wNUSwjftJ0rmKP_pSQFUoUGt0aBIVdPpSlfd8xGHo0GvPJ8yhcdFoGyXceIflSEcSqpXhBlca4m7bEZZlZdAeG57ZUA3KRXsRb5_ixOmN-omFjW5_84lbBoJi2BdTk0DbiCg_DnDPRL8_CghF31thPHwcYNLY0TzREAopIMgq7nul8Hx6xydaoaOXu7O4I9UHvZskLJ4KlLk9UVo8LN4q9FhaGiNKjSm7gCBZnqxb8RWG-k1e1cGhcs9G6b0Y3h0RWjxrfip9ukjs3kqJlDKRibKiNs7KGf8WeylPXzGDj4BS0_C2sATH3HwPYBDS6uT71ELCViJHPZee0VGRfKqV-J64SoO08NMaAxrmLTEMETmVrmLdSURzIuQ9uh5FEPcv_9qUDC8v8VqWMa0feLwYQnHcu7tl2fQOEA5eM9c9Yq5vbM9jqMjvF2Iiu28Wo9t6WyEgJvwm8L-6WpF10ZZDBygf7-VTi_QmJd8NCxCG8KDxKSwpIrx8j4PoK4Z1g_LgcGqvzkJeIexfUu0zP3O6sXSNAnmujSW1juVZjuV3zZoSV6ZwkvlKo5YqfIK3kJm34LA2cj3t_vVpoX5FFpFhMCFnuV4ruJ2luIyfbWrhg9OawEAvYL0MgssdSKC2P-AS-F7aeIswmtUxnBKbkrDw8VSsvjQxvAwFnrGrmRo0kU3oySsQ-jbeZQWStdEaSSBIc3123O8yj9Z3lJamLu0yVzdB7RdZhVKJT2N8zqnplywVK5nEYRbcUEq2zqJknJw7CHUPqdDj822XV42pSuP2deiJLqt9erfrtLt06ymt_jg9yQzDiluytr-fl-nahEE8gwia3RqKzjmxbawTTjUv4a4dxyM-XHW-l4tOAGn3Ic_zwQK74I0PWJo_TLa47jXgiN--DCB5BLo1dPo_FkeMni8bLIbtFOiGgS7YFLdLBUm3lKP-ApsFHo1KSGoslJvsvimQ4vFCgMCjYMUj3gJieZpIpTFl70HXVW2j10_LDUB_kynBMzYZ9fJo-nV90sEl9Bl-AsFgnM7qaMnfwOlh_g',
        'X-Client-Key': 'xztFeG6jppikbqaUUmWi4YmNspOKwSAg'
    };

    await axios.get(urll, { headers: headerss })
        .then((response) => {
            user = response.data
        })
        .catch((error) => {
            console.error('Error:', error);
        });

    const urlll = `https://api.claro.com.br/residential/v1/easy-invoices/invoices/${user2}/${user.easyInvoices[0].identifier}/preview`;

    const headersss = {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Origin': 'https://minhaclaroresidencial.claro.com.br',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'X-Captcha-Token': '03AFcWeA7j99QBA1ZCdqhMwaDGlRAbOI_9tZAulLihu16tWknbxU2n-ouBcoIt_LDvoa3S1T8Rl86bKOvacMCzFQM1rK1IBICUke05SPwAyDBQKlHp5dFNlSSKDTBwmxiA24yaCzggqc5ixxcmV2QzusK1HKqQk_mlwjQzQboxp306ztPBcVPwwIiYmVCymCcaG6do2EkbRPM4bdpOrdTSAthY95Rc0GNRCUY-rAeK3kStQnwQaOQENUCHn8OnQWTolaA86csV4-E_OGkzLnQL8IWBgemOrb_3PWrG_byC7dwETL0IMSbNltWqrQmzjI3-vgxWO58LCuju-9cHzMAz11cz7e_EMi_GaeCQ2187U0_igS8wjGBapVs5Ui4r-rXxgrOBDICwI2ubszLdlejEBfWR3TKO1PT7q8UsZPT4yuNnSOKNYxuAR_QfEVun_LGIEnhXjfRf5Z9-GodW0BqkuuwrrlVW1waUkQ6zJ42qA5sFDohN6Y2sQBJGKpbvScPDy9VMIuoVHj2HWjru8S4q-PlGEYm3VYEYl69vTOUtiqKYSJ6jyvQY8T3uD2oQQZRL5dF52jKw6pJbR81Vy-NQF1jbLKo6rTkZSYZvFdj8vatDCdSwFD5JhtPNHtSbzPthQYRj8bTaWl4wNUSwjftJ0rmKP_pSQFUoUGt0aBIVdPpSlfd8xGHo0GvPJ8yhcdFoGyXceIflSEcSqpXhBlca4m7bEZZlZdAeG57ZUA3KRXsRb5_ixOmN-omFjW5_84lbBoJi2BdTk0DbiCg_DnDPRL8_CghF31thPHwcYNLY0TzREAopIMgq7nul8Hx6xydaoaOXu7O4I9UHvZskLJ4KlLk9UVo8LN4q9FhaGiNKjSm7gCBZnqxb8RWG-k1e1cGhcs9G6b0Y3h0RWjxrfip9ukjs3kqJlDKRibKiNs7KGf8WeylPXzGDj4BS0_C2sATH3HwPYBDS6uT71ELCViJHPZee0VGRfKqV-J64SoO08NMaAxrmLTEMETmVrmLdSURzIuQ9uh5FEPcv_9qUDC8v8VqWMa0feLwYQnHcu7tl2fQOEA5eM9c9Yq5vbM9jqMjvF2Iiu28Wo9t6WyEgJvwm8L-6WpF10ZZDBygf7-VTi_QmJd8NCxCG8KDxKSwpIrx8j4PoK4Z1g_LgcGqvzkJeIexfUu0zP3O6sXSNAnmujSW1juVZjuV3zZoSV6ZwkvlKo5YqfIK3kJm34LA2cj3t_vVpoX5FFpFhMCFnuV4ruJ2luIyfbWrhg9OawEAvYL0MgssdSKC2P-AS-F7aeIswmtUxnBKbkrDw8VSsvjQxvAwFnrGrmRo0kU3oySsQ-jbeZQWStdEaSSBIc3123O8yj9Z3lJamLu0yVzdB7RdZhVKJT2N8zqnplywVK5nEYRbcUEq2zqJknJw7CHUPqdDj822XV42pSuP2deiJLqt9erfrtLt06ymt_jg9yQzDiluytr-fl-nahEE8gwia3RqKzjmxbawTTjUv4a4dxyM-XHW-l4tOAGn3Ic_zwQK74I0PWJo_TLa47jXgiN--DCB5BLo1dPo_FkeMni8bLIbtFOiGgS7YFLdLBUm3lKP-ApsFHo1KSGoslJvsvimQ4vFCgMCjYMUj3gJieZpIpTFl70HXVW2j10_LDUB_kynBMzYZ9fJo-nV90sEl9Bl-AsFgnM7qaMnfwOlh_g',
        'X-Client-Key': 'xztFeG6jppikbqaUUmWi4YmNspOKwSAg'
    };
    let html
    await axios.get(urlll, { headers: headersss })
        .then((response) => {
            html = response.data
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    res.json({ user: user, html: html });
});

app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend", "index.html"));
});
const port = process.env.PORT || 3002;
app.listen(port, () => console.log(`Servidor rodando em https://localhost:${port}`));