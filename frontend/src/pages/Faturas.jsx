import React, { useState } from 'react';
import './Faturas.css';

const Faturas = () => {
  const [cpf, setCpf] = useState('');
  const [faturas, setFaturas] = useState([]);
  const [htmls, setHtmls] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

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

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 3000);
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
          <p className="info-message">
            Esta fatura é uma Fatura Fácil e contém apenas informações básicas.
            Para detalhes sobre gastos, usos, e endereços, acesse o site
            <a href="https://minhaclaroresidencial.claro.com.br/" target="_blank" rel="noopener noreferrer">
              https://minhaclaroresidencial.claro.com.br/
            </a>.
          </p>
          <h2>Faturas Encontradas</h2>
          {faturas.map((fatura, index) => (
            <div className="fatura" key={index}>
              <h3>Fatura {index + 1}</h3>
              <div key={index}>
                <p><strong>Data de Criação:</strong> {fatura.user.creationDate}</p>
                <p><strong>Data de Vencimento:</strong> {fatura.user.dueDate}</p>
                <p><strong>Valor da Fatura:</strong> {fatura.user.invoiceAmout}</p>
                <p><strong>Boleto:</strong> {fatura.user.digitableLine}</p>
                {fatura.user.digitableLine && fatura.user.digitableLine && (
                  <button
                    className="button-copiar"
                    onClick={() => handleCopyCode(fatura.user.digitableLine)}
                  >
                    {copiedCode === fatura.user.digitableLine ? 'Copiado!' : 'Copiar Código'}
                  </button>
                )}
                <p>
                  <strong>Pix:</strong>{' '}
                  <span className="pix-code">
                    {fatura.pix.data && fatura.pix.data.payload
                      ? fatura.pix.data.payload
                      : 'Não disponível nessa fatura'}
                  </span>
                </p>
                {fatura.pix.data && fatura.pix.data.payload && (
                  <button
                    className="button-copiar"
                    onClick={() => handleCopyCode(fatura.pix.data.payload)}
                  >
                    {copiedCode === fatura.pix.data.payload ? 'Copiado!' : 'Copiar Código'}
                  </button>
                )}
                <hr />
                <div
                  className="html-container"
                  dangerouslySetInnerHTML={{
                    __html: htmls && htmls[index] ? htmls[index] : '',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Faturas;
