import React, { useState, useEffect } from 'react';
import '../Cell.css';
import { FaTimes } from 'react-icons/fa';

const VendasAtual = () => {
    const [realTimeSales, setRealTimeSales] = useState([]);
    const [biometryLink, setBiometryLink] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isLoadingVendas, setIsLoadingVendas] = useState(true);

    const fetchRealTimeSales = async () => {
        try {
            const response = await fetch('/api/real-time-sales');
            const data = await response.json();
            console.log(data)
            setRealTimeSales(data);
            setIsLoadingVendas(false);
        } catch (error) {
            console.error('Erro ao buscar vendas em tempo real:', error);
            setIsLoadingVendas(false);
        }
    };
    const sendBiometryRequest = async (cpf, telefone) => {
        try {
            const response = await fetch('/api/generate-biometry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cpf, telefone }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data)
                if (data.data.link) {
                    setBiometryLink(data.data.link);
                    setShowModal(true);
                }
            } else {
                console.error('Erro ao enviar biometria');
            }
        } catch (error) {
            console.error('Erro ao enviar biometria:', error);
        }
    };

    useEffect(() => {
        fetchRealTimeSales();
        const interval = setInterval(fetchRealTimeSales, 15000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="vendas-container">
            {isLoadingVendas ? ( 
                <div className="loader"></div>
            ) : realTimeSales.length > 0 ? (
                realTimeSales.slice(1).map((sale, index) => (
                    <div className="venda-item" key={index}>
                        <p>Nome: {sale.nomeCompleto.toUpperCase()}</p>
                        <p>CPF: {sale.cpf}</p>
                        <p>Telefone: {sale.fone}</p>
                        <p>Cidade: {sale.cidade.toUpperCase()}</p>
                        <p>Vendedor: {sale.vendedor.toUpperCase()}</p>
                        <p>Status: {sale.status.toUpperCase()}</p>
                        <button onClick={() => sendBiometryRequest(sale.cpf, sale.fone)}>
                            Gerar Biometria
                        </button>
                    </div>
                ))
            ) : (
                <p className="empty-message">Nenhum dado de vendas disponível.</p>
            )}
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <button className="close-btn" onClick={() => setShowModal(false)}>
                            <FaTimes style={{ color: '#fff', fontSize: '1.5rem' }} />
                        </button>
                        <p>Link para biometria:</p>
                        <input type="text" value={biometryLink} readOnly />
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(biometryLink);
                                alert('Link copiado!');
                            }}
                        >
                            Copiar Link
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

};

export default VendasAtual;
