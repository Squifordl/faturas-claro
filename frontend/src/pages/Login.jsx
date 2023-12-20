import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.message === "Login successful") {
                    localStorage.setItem('isAuthenticated', JSON.stringify(true));
                    onLogin(true);
                    navigate('/');
                } else {
                    console.error('Falha no login');
                }
            } else {
                console.error('Falha no login');
            }

        } catch (error) {
            console.error('Erro ao conectar ao servidor:', error);
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleLogin}>
                <h1>Login</h1>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Entrar</button>
            </form>
        </div>
    );
};

export default Login;
