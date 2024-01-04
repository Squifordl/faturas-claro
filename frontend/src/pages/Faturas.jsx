import React, { useState } from 'react';
import './Faturas.css'

const Faturas = () => {
  const [cpf, setCpf] = useState('');
  const [faturas, setFaturas] = useState([]);
  const [html, setHtml] = useState('')
  const [error, setError] = useState(null);

  const handleBuscarFatura = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/buscar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cpf }),
      });


      if (response.ok) {
        const data = await response.json();
        setFaturas(data.user.easyInvoices);
        setHtml(data.html)
        setError(null);
      } else {
        setError('Fatura não encontrada para o CPF.');
      }
    } catch (error) {
      setError('Fatura não encontrada para o CPF.');
    }
  };

  return (
    <div className="faturas-container">
      <h1>Busca de Faturas</h1>
      <label className='label-cpf'>
        CPF do Cliente:
        <input className='input-cpf' type="text" value={cpf} onChange={(e) => setCpf(e.target.value)} />
      </label>
      <button className="button-buscar" onClick={handleBuscarFatura}>Buscar Fatura</button>

      {error && <p className="error">{error}</p>}

      {faturas.length > 0 && (
        <div>
          <h2>Faturas Encontradas</h2>
          {faturas.map((fatura, index) => (
            <div className="fatura" key={index}>
              {console.log(fatura)}
              <h3>Fatura {index + 1}</h3>
              <p>Número do Contrato: {fatura.fullContract}</p>
              <p>Data de Criação: {fatura.creationDate}</p>
              <p>Data de Vencimento: {fatura.dueDate}</p>
              <p>Valor da Fatura: {fatura.invoiceAmout}</p>
              {/* <img className="img-qrcode" src={fatura.barCodeImage} alt="Código de Barras" /> */}
              <hr />
              <div className="html-container" dangerouslySetInnerHTML={{ __html: html }} />
            </div>
          ))}
        </div>
      )}
    </div >
  );
};

export default Faturas;