import React, { useState } from 'react';

const Faturas = () => {
  const [cpf, setCpf] = useState('');
  const [fatura, setFatura] = useState(null);

  const handleBuscarFatura = async () => {
    try {
      const response = await fetch(`/api/buscar-fatura?cpf=${cpf}`);
      const data = await response.json();
      setFatura(data);
    } catch (error) {
      console.error('Erro ao buscar fatura:', error);
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

      {fatura && (
        <div>
          <h2>Fatura Encontrada</h2>
          <p>CPF: {fatura.cpf}</p>
        </div>
      )}
    </div>
  );
};

export default Faturas;
