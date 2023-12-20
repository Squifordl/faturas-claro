import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
import './Login.css';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios({
                method: 'post',
                url: 'https://siteeeeeee.vercel.app/api/login',
                data: {
                    email,
                    password
                },
                withCredentials: true
            });

            if (response.status === 200) {
                const data = response.data;
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
