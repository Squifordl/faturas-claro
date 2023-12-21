import React, { useState, useEffect } from 'react';
import moment from 'moment';
import VendasAtual from './sales/VendasAtual';
import './HomePage.css';

const ITEMS_PER_PAGE = 20;

const HomePage = () => {

    const [salesData, setSalesData] = useState([]);
    const [expirationsData, setExpirationsData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedOption, setSelectedOption] = useState('vendas');
    
    useEffect(() => {
        localStorage.setItem('currentPage', currentPage.toString());
        localStorage.setItem('selectedOption', selectedOption);
    }, [currentPage, selectedOption]);

    useEffect(() => {
        const savedPage = localStorage.getItem('currentPage');
        const savedOption = localStorage.getItem('selectedOption');

        if (savedPage) {
            setCurrentPage(parseInt(savedPage, 10));
        }

        if (savedOption) {
            setSelectedOption(savedOption);
        }
    }, []);

    useEffect(() => {
        const fetchSalesData = async () => {
            const response = await fetch('/api/sales');
            const data = await response.json();

            const sortedData = data.sort((a, b) => {
                const dateA = a.dataVenda && moment(a.dataVenda, 'DD/MM/YYYY HH:mm', true).isValid()
                    ? moment(a.dataVenda, 'DD/MM/YYYY HH:mm')
                    : moment().add(100, 'years');

                const dateB = b.dataVenda && moment(b.dataVenda, 'DD/MM/YYYY HH:mm', true).isValid()
                    ? moment(b.dataVenda, 'DD/MM/YYYY HH:mm')
                    : moment().add(100, 'years');

                return dateB - dateA;
            });

            setSalesData(sortedData);
        };

        const fetchExpirationsData = async () => {
            const response = await fetch('/api/expirations');
            const data = await response.json();

            const sortedExpirationsData = data.sort((a, b) => {
                const today = moment();
                const expirationA = moment(a.dataVencimento, 'DD/MM/YYYY HH:mm', true);
                const expirationB = moment(b.dataVencimento, 'DD/MM/YYYY HH:mm', true);

                const diffA = expirationA.isValid() ? expirationA.diff(today, 'days') : Infinity;
                const diffB = expirationB.isValid() ? expirationB.diff(today, 'days') : Infinity;

                return diffA - diffB;
            });

            setExpirationsData(sortedExpirationsData);
        };

        fetchSalesData();
        fetchExpirationsData();
    }, []);

    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIdx = currentPage * ITEMS_PER_PAGE;

    const totalPages = Math.ceil(
        selectedOption === 'vendas' ? salesData.length / ITEMS_PER_PAGE : expirationsData.length / ITEMS_PER_PAGE
    );
    const paginationButtons = [];
    for (let i = 1; i <= totalPages; i++) {
        paginationButtons.push(
            <button
                key={i}
                className={currentPage === i ? "active" : ""}
                onClick={() => setCurrentPage(i)}
            >
                {i}
            </button>
        );
    }

    return (
        <div className="homepage-container">
            <div className="select-status">
                <label htmlFor="status-type">Escolha o status:</label>
                <select
                    id="status-type"
                    value={selectedOption}
                    onChange={(e) => setSelectedOption(e.target.value)}
                >
                    <option value="vendas">Vendas</option>
                    <option value="expirations">Vencimentos</option>
                    <option value="vendasRealTime">Vendas em Tempo Real</option>
                </select>
            </div>
            <section className="data-section">
                {selectedOption === 'vendasRealTime' ? (
                    <VendasAtual />
                ) : (
                    <>
                        <h2>{selectedOption === 'vendas' ? 'Vendas Recentes' : 'Vencimentos Próximos'}</h2>
                        {selectedOption === 'vendas' ? (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Código</th>
                                        <th>Cliente</th>
                                        <th>Data da Venda</th>
                                        <th>Valor Total Normal</th>
                                        <th>Valor Total Promocional</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {salesData.slice(startIdx, endIdx).map((sale, index) => {
                                        const dataVendaValida = moment(sale.dataVenda, 'DD/MM/YYYY HH:mm', true).isValid();
                                        const dataVendaFormatada = dataVendaValida
                                            ? sale.dataVenda
                                            : "Sem data de Finalização";

                                        return (
                                            <tr key={index}>
                                                <td>{sale.codigo}</td>
                                                <td>{sale.cliente}</td>
                                                <td>{dataVendaFormatada}</td>
                                                <td>{sale.valorTotalNormal}</td>
                                                <td>{sale.valorTotalPromocional}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Cliente</th>
                                        <th>Contrato</th>
                                        <th>Cidade</th>
                                        <th>Data de Vencimento</th>
                                        <th>Dias para Vencer</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expirationsData.slice(startIdx, endIdx).map((expiration, index) => (
                                        <tr key={index}>
                                            <td className="cliente">{expiration.cliente}</td>
                                            <td className="contrato">{expiration.contrato}</td>
                                            <td className="cidade">{expiration.cidade}</td>
                                            <td className="dataVencimento">{expiration.dataVencimento}</td>
                                            <td className="diasParaVencer">{expiration.diasParaVencimento}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        <div className="pagination">{paginationButtons}</div>
                    </>
                )}
            </section>
        </div>
    );
}

export default HomePage