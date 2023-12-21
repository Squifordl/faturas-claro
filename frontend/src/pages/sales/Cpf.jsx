import React, { useState } from 'react';
import './Cpf.css'

const Faturas = () => {
  const [cpf, setCpf] = useState('');
  const [faturas, setFaturas] = useState([]);
  const [error, setError] = useState(null);

  const handleBuscarFatura = async () => {
    try {
      const response = await fetch(`/api/buscar-fatura?cpf=${cpf}`);
      if (response.ok) {
        const data = await response.json();
        setFaturas(data.easyInvoices);
        setError(null);
      } else {
        setError('Fatura não encontrada.');
      }
    } catch (error) {
      setError('Erro ao buscar fatura:' + error.message);
    }
  };

  return (
    <div>
      <h1>Busca de Faturas</h1>
      <label>
        CPF do Cliente:
        <input type="text" value={cpf} onChange={(e) => setCpf(e.target.value)} />
      </label>
      <button onClick={handleBuscarFatura}>Buscar Fatura</button>

      {error && <p>{error}</p>}

      {faturas.length > 0 && (
        <div>
          <h2>Faturas Encontradas</h2>
          {faturas.map((fatura, index) => (
            <div key={index}>
              <h3>Fatura {index + 1}</h3>
              <p>Número do Contrato: {fatura.contractNumber}</p>
              <p>Data de Criação: {fatura.creationDate}</p>
              <p>Data de Vencimento: {fatura.dueDate}</p>
              <p>Valor da Fatura: {fatura.invoiceAmout}</p>
              <img src={fatura.barCodeImage} alt="Código QR" />
              <hr />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Faturas;
