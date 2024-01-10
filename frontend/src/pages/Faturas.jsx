import React, { useState } from 'react';
import './Faturas.css';

const Faturas = () => {
  const [cpf, setCpf] = useState('');
  const [faturas, setFaturas] = useState([]);
  const [htmls, setHtmls] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleBuscarFatura = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/buscar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cpf }),
      });
      if (response.ok) {
        const data = await response.json();
        setFaturas(data);

        const modifiedHtmls = data.map((fatura) => {
          return fatura.html.replace(/<td.*?CLARO.*?<\/td>/gi, '');
        });

        setHtmls(modifiedHtmls);
        setError(null);
      } else {
        setError('Fatura não encontrada para o CPF.');

        setTimeout(() => {
          setError(null);
        }, 5000);
      }
    } catch (error) {
      setError('Fatura não encontrada para o CPF.');

      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="faturas-container">
      <h1>Busca de Faturas</h1>
      <label className="label-cpf">
        CPF do Cliente:
        <input className="input-cpf" type="text" value={cpf} onChange={(e) => setCpf(e.target.value)} />
      </label>
      <button className="button-buscar" onClick={handleBuscarFatura} disabled={loading}>
        {loading ? 'Buscando...' : 'Buscar Fatura'}
      </button>
      {error && <p className="error">{error}</p>}
      {faturas.length > 0 && (
        <div>
          <h2>Faturas Encontradas</h2>
          {faturas.map((fatura, index) => (
            <div className="fatura" key={index}>
              <h3>Fatura {index + 1}</h3>
              <div key={index}>
                <p>Data de Criação: {fatura.user.creationDate}</p>
                <p>Data de Vencimento: {fatura.user.dueDate}</p>
                <p>Valor da Fatura: {fatura.user.invoiceAmout}</p>
                <p>Boleto: {fatura.user.digitableLine}</p>
                <hr />
                <div className="html-container" dangerouslySetInnerHTML={{ __html: htmls && htmls[index] ? htmls[index] : '' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Faturas;
