const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios')

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, '../frontend')));

app.post('/api/buscar', async (req, res) => {
    const { cpf } = req.body;
    let user
    let user2

    const url = 'https://api.claro.com.br/residential/v1/easy-invoices/contracts';

    const headers = {
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Origin': 'https://minhaclaroresidencial.claro.com.br',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'X-Captcha-Token': '03AFcWeA4bw0vTiHHIag1XCc18fQJx0-pGGWNlFgHOuC2hfL06yJZD1ljJZLOtDYHNLQvA2aRJ6jzDfA9NAivZnm7vBaF0a6uIWuSNCDbwNcfBs4ZuLVAarupyovz77JfSnkOAOSXbmybg25Oiv77A1wGdGfvqoxzMTLarLQdUGnw7YBamdNQcjLVUxcQnsFmGdfmqIHF_CFI5SHZ7hRH156cwgMJC41aR1i8DVFCl2pcZ3Ix-ltlyZ5JHQUNXeXlsvrLEx_qLXAkCwQukYxUFsotgPX0dh7w1G35xsShc4Ds8MgzkbsVCAX64ImgB6Q-b_gTXA4tbi1l1h8PzHiWu_mmUMq8DI_z0haZdvO_-JmaTuCSzYZ5bxfmDEW9cdXk01JyHNCyxpl6aLjLmgFR7eLb8jjBxaNO8SnPEjg-rfZ9TXaP-buSzFKbNuInZw30VER7nIj4F2Veh34BejoymT6Or7AHZarlsF10XPCdH8Knsuk9t7M_h4b8u4BY8fBLlqna5YzmOuvCvVqHYv-bdCsJqVng46H20hJ9QcG8xAeTcI3Z_T0vtZAFUZg_lkla3_uHHFki8jn2Xh_nwCmWnC9416im8rShKqqLFo_xOGvHVen5-h2QKU3UeEQ3b50Nd9-mvn0vqqFJwYXsbTs3tdEmo4HgbzkIWtHloseXpBLvjm04p0Dfv_grGe1gDCdTNLw6ggWhOIr0DRR5SES0yp-fH5XuCQw1EmLYS_qYzsgKm8I41cnOkIGMfjspaUtHXvhFBAR8uHXkqvdpygfTNC5D5WbvlyTZXjPc9Yv_Y8AVtIEFeXPPdhEU7iL8UycyKGWXLJYhZGCK4bwQeUtrpeV5mPFVuxWxGsyYITV8WK6lTNM7P2TW35ft5ZFpnrbQkBOVcZeuY15VULzOSniyUDFn9vVe44OJ6VRY8Mdjc4hJHKbJ2h27i1xFnX-Mxzc5svVt4kJMbcqMyTgQU3uRdyhJY12gSlQmOcfPruD2OCIUA19hw8YZS9fIq0S_hQaQA0zZdFGxObZnZczP3S5vJ93KID_WZi5NaRiNd69usbbOoSoHNUAdcdVG6VhIdy3JX4dmdkFNDDeCOZNOg-3lg92AGT7Qj9wz-PYjsIobDYLabjHL_Mlbs9yJdU14-8kDJiuoYkWJEmhOCdQJay87Aq7X6mvtw-x0QOLVJ9wxCVfSAGBcu8tuIctiadWFqcXAkjFjIpeuruk2FeWsKU6sTEyLPHlHIhKK9QLS4O8KH2IigB4d8tV1IvjvvSEeHSVBWacXZ-joC1pAUmzccYGpoiLq933PCIOIZ6hq4lA66cl5pxscG9-D9tMxpm7gOjjYfvtR_tpqLXWG4exK5KTvG5ScmWOuUVrEQKBYuYctntqMlRPshWuz5Q-DheSDurPWnM8gvlM1DLQIRvoES4dh45ooyEPzB3Otr5_Ics1x9o2Euo8r35YEpr3Qc5Y6Jup_h5aVdS6rEoMkROHH5pbgr3w3QKZPojlSYyqEgVT69nojp0u_dF_gpjUnZfOWNy1zGrb5N5BkQFiHs6QJrGcNwKNMAYeP-zk7PF5T_M-w7lmBzu-XvUB6tck3ZP6KTRCyjwsl_IFBIoGAsoQbmZmGh4dmVpZeTQnxP2l6DXafK7lrEPn7Egn2NPRAzmx7ly9DnzHOC5v7cSPYdjaqCt3zgLQHpbNfHkXAV73YgWKJV4ShDnniUqdjla8MCZX87lmrxfWWBOfXiY79nmYY0CMoanMZ6XjfoE-go1mCH5ORXvNYvUqMUSasbfg68BiB1NNW98zMAEn0njI_B61LbDFapHRNJN_Y4jE6zRw',
        'X-Client-Key': 'xztFeG6jppikbqaUUmWi4YmNspOKwSAg',
        'X-Document': cpf
    };

    try {
        const response = await axios.get(url, { headers });
        user = response.data.contracts[0].identifier;
        user2 = response.data.contracts[0].identifier;
    } catch (error) {
        console.error(error);
    }

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
        'X-Captcha-Token': '03AFcWeA4bw0vTiHHIag1XCc18fQJx0-pGGWNlFgHOuC2hfL06yJZD1ljJZLOtDYHNLQvA2aRJ6jzDfA9NAivZnm7vBaF0a6uIWuSNCDbwNcfBs4ZuLVAarupyovz77JfSnkOAOSXbmybg25Oiv77A1wGdGfvqoxzMTLarLQdUGnw7YBamdNQcjLVUxcQnsFmGdfmqIHF_CFI5SHZ7hRH156cwgMJC41aR1i8DVFCl2pcZ3Ix-ltlyZ5JHQUNXeXlsvrLEx_qLXAkCwQukYxUFsotgPX0dh7w1G35xsShc4Ds8MgzkbsVCAX64ImgB6Q-b_gTXA4tbi1l1h8PzHiWu_mmUMq8DI_z0haZdvO_-JmaTuCSzYZ5bxfmDEW9cdXk01JyHNCyxpl6aLjLmgFR7eLb8jjBxaNO8SnPEjg-rfZ9TXaP-buSzFKbNuInZw30VER7nIj4F2Veh34BejoymT6Or7AHZarlsF10XPCdH8Knsuk9t7M_h4b8u4BY8fBLlqna5YzmOuvCvVqHYv-bdCsJqVng46H20hJ9QcG8xAeTcI3Z_T0vtZAFUZg_lkla3_uHHFki8jn2Xh_nwCmWnC9416im8rShKqqLFo_xOGvHVen5-h2QKU3UeEQ3b50Nd9-mvn0vqqFJwYXsbTs3tdEmo4HgbzkIWtHloseXpBLvjm04p0Dfv_grGe1gDCdTNLw6ggWhOIr0DRR5SES0yp-fH5XuCQw1EmLYS_qYzsgKm8I41cnOkIGMfjspaUtHXvhFBAR8uHXkqvdpygfTNC5D5WbvlyTZXjPc9Yv_Y8AVtIEFeXPPdhEU7iL8UycyKGWXLJYhZGCK4bwQeUtrpeV5mPFVuxWxGsyYITV8WK6lTNM7P2TW35ft5ZFpnrbQkBOVcZeuY15VULzOSniyUDFn9vVe44OJ6VRY8Mdjc4hJHKbJ2h27i1xFnX-Mxzc5svVt4kJMbcqMyTgQU3uRdyhJY12gSlQmOcfPruD2OCIUA19hw8YZS9fIq0S_hQaQA0zZdFGxObZnZczP3S5vJ93KID_WZi5NaRiNd69usbbOoSoHNUAdcdVG6VhIdy3JX4dmdkFNDDeCOZNOg-3lg92AGT7Qj9wz-PYjsIobDYLabjHL_Mlbs9yJdU14-8kDJiuoYkWJEmhOCdQJay87Aq7X6mvtw-x0QOLVJ9wxCVfSAGBcu8tuIctiadWFqcXAkjFjIpeuruk2FeWsKU6sTEyLPHlHIhKK9QLS4O8KH2IigB4d8tV1IvjvvSEeHSVBWacXZ-joC1pAUmzccYGpoiLq933PCIOIZ6hq4lA66cl5pxscG9-D9tMxpm7gOjjYfvtR_tpqLXWG4exK5KTvG5ScmWOuUVrEQKBYuYctntqMlRPshWuz5Q-DheSDurPWnM8gvlM1DLQIRvoES4dh45ooyEPzB3Otr5_Ics1x9o2Euo8r35YEpr3Qc5Y6Jup_h5aVdS6rEoMkROHH5pbgr3w3QKZPojlSYyqEgVT69nojp0u_dF_gpjUnZfOWNy1zGrb5N5BkQFiHs6QJrGcNwKNMAYeP-zk7PF5T_M-w7lmBzu-XvUB6tck3ZP6KTRCyjwsl_IFBIoGAsoQbmZmGh4dmVpZeTQnxP2l6DXafK7lrEPn7Egn2NPRAzmx7ly9DnzHOC5v7cSPYdjaqCt3zgLQHpbNfHkXAV73YgWKJV4ShDnniUqdjla8MCZX87lmrxfWWBOfXiY79nmYY0CMoanMZ6XjfoE-go1mCH5ORXvNYvUqMUSasbfg68BiB1NNW98zMAEn0njI_B61LbDFapHRNJN_Y4jE6zRw',
        'X-Client-Key': 'xztFeG6jppikbqaUUmWi4YmNspOKwSAg'
    };

    await axios.get(urll, { headers: headerss })
        .then((response) => {
            user = response.data;
        })
        .catch((error) => {
            console.error('Error:', error);
        });

    if (!user || !user.easyInvoices || user.easyInvoices.length === 0) {
        res.json({ message: 'Nenhuma fatura encontrada' });
    } else {
        const identifiers = user.easyInvoices.map(invoice => invoice.identifier);
        const identifiers2 = user.easyInvoices.map(invoice => invoice);

        const previewPromises = [];

        identifiers2.forEach(identifier => {
            const previewUrl = `https://api.claro.com.br/residential/v1/easy-invoices/invoices/${user2}/${identifier.identifier}/preview`;
            const urlPIX = `https://api.claro.com.br/residential/v1/easy-invoices/invoices/${user2}/${identifier.identifier}/pix`

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
                'X-Captcha-Token': '03AFcWeA4bw0vTiHHIag1XCc18fQJx0-pGGWNlFgHOuC2hfL06yJZD1ljJZLOtDYHNLQvA2aRJ6jzDfA9NAivZnm7vBaF0a6uIWuSNCDbwNcfBs4ZuLVAarupyovz77JfSnkOAOSXbmybg25Oiv77A1wGdGfvqoxzMTLarLQdUGnw7YBamdNQcjLVUxcQnsFmGdfmqIHF_CFI5SHZ7hRH156cwgMJC41aR1i8DVFCl2pcZ3Ix-ltlyZ5JHQUNXeXlsvrLEx_qLXAkCwQukYxUFsotgPX0dh7w1G35xsShc4Ds8MgzkbsVCAX64ImgB6Q-b_gTXA4tbi1l1h8PzHiWu_mmUMq8DI_z0haZdvO_-JmaTuCSzYZ5bxfmDEW9cdXk01JyHNCyxpl6aLjLmgFR7eLb8jjBxaNO8SnPEjg-rfZ9TXaP-buSzFKbNuInZw30VER7nIj4F2Veh34BejoymT6Or7AHZarlsF10XPCdH8Knsuk9t7M_h4b8u4BY8fBLlqna5YzmOuvCvVqHYv-bdCsJqVng46H20hJ9QcG8xAeTcI3Z_T0vtZAFUZg_lkla3_uHHFki8jn2Xh_nwCmWnC9416im8rShKqqLFo_xOGvHVen5-h2QKU3UeEQ3b50Nd9-mvn0vqqFJwYXsbTs3tdEmo4HgbzkIWtHloseXpBLvjm04p0Dfv_grGe1gDCdTNLw6ggWhOIr0DRR5SES0yp-fH5XuCQw1EmLYS_qYzsgKm8I41cnOkIGMfjspaUtHXvhFBAR8uHXkqvdpygfTNC5D5WbvlyTZXjPc9Yv_Y8AVtIEFeXPPdhEU7iL8UycyKGWXLJYhZGCK4bwQeUtrpeV5mPFVuxWxGsyYITV8WK6lTNM7P2TW35ft5ZFpnrbQkBOVcZeuY15VULzOSniyUDFn9vVe44OJ6VRY8Mdjc4hJHKbJ2h27i1xFnX-Mxzc5svVt4kJMbcqMyTgQU3uRdyhJY12gSlQmOcfPruD2OCIUA19hw8YZS9fIq0S_hQaQA0zZdFGxObZnZczP3S5vJ93KID_WZi5NaRiNd69usbbOoSoHNUAdcdVG6VhIdy3JX4dmdkFNDDeCOZNOg-3lg92AGT7Qj9wz-PYjsIobDYLabjHL_Mlbs9yJdU14-8kDJiuoYkWJEmhOCdQJay87Aq7X6mvtw-x0QOLVJ9wxCVfSAGBcu8tuIctiadWFqcXAkjFjIpeuruk2FeWsKU6sTEyLPHlHIhKK9QLS4O8KH2IigB4d8tV1IvjvvSEeHSVBWacXZ-joC1pAUmzccYGpoiLq933PCIOIZ6hq4lA66cl5pxscG9-D9tMxpm7gOjjYfvtR_tpqLXWG4exK5KTvG5ScmWOuUVrEQKBYuYctntqMlRPshWuz5Q-DheSDurPWnM8gvlM1DLQIRvoES4dh45ooyEPzB3Otr5_Ics1x9o2Euo8r35YEpr3Qc5Y6Jup_h5aVdS6rEoMkROHH5pbgr3w3QKZPojlSYyqEgVT69nojp0u_dF_gpjUnZfOWNy1zGrb5N5BkQFiHs6QJrGcNwKNMAYeP-zk7PF5T_M-w7lmBzu-XvUB6tck3ZP6KTRCyjwsl_IFBIoGAsoQbmZmGh4dmVpZeTQnxP2l6DXafK7lrEPn7Egn2NPRAzmx7ly9DnzHOC5v7cSPYdjaqCt3zgLQHpbNfHkXAV73YgWKJV4ShDnniUqdjla8MCZX87lmrxfWWBOfXiY79nmYY0CMoanMZ6XjfoE-go1mCH5ORXvNYvUqMUSasbfg68BiB1NNW98zMAEn0njI_B61LbDFapHRNJN_Y4jE6zRw',
                'X-Client-Key': 'xztFeG6jppikbqaUUmWi4YmNspOKwSAg'
            };
            let html;

            const previewPromise = axios.get(previewUrl, { headers: headersss })
                .then((response) => {
                    html = response.data;
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            let pix
            const pixPromise = axios.get(urlPIX, { headers: headersss })
                .then((response) => {
                    pix = response.data
                })
                .catch((error) => {
                    console.error('Error:', error);
                });

            const resultPromise = Promise.all([previewPromise, pixPromise])
                .then(() => {
                    return { user: identifier, pix, html: html };
                });

            previewPromises.push(resultPromise);
        });

        Promise.all(previewPromises)
            .then(results => {
                res.json(results);
            })
            .catch(error => {
                console.error('Error:', error);
                res.status(500).json({ error: 'Erro interno do servidor' });
            });
    }
});

app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend", "index.html"));
});
const port = process.env.PORT || 3002;
app.listen(port, () => console.log(`Servidor rodando em https://localhost:${port}`));