
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import './AdminLogin.css';
import { API_URL } from "../config/api";
const AdminLogin = () => {
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		email: '',
		password: ''
	});

	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		});
		setError('');
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			const response = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

			const data = await response.json();

			if (data.success) {
				localStorage.setItem('adminToken', data.token);
				localStorage.setItem('adminUser', JSON.stringify(data.admin));
				navigate('/admin/dashboard');
			} else {
				setError(data.message || 'Invalid email or password');
			}

		} catch (err) {
			console.error(err);
			setError('Unable to connect to server');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="admin-login-page">
			<div className="login-container">
				<div className="login-card">

					<h1>Admin Login</h1>

					{error && <div className="error-message">{error}</div>}

					<form onSubmit={handleSubmit}>

						<input
							type="email"
							name="email"
							placeholder="Email"
							value={formData.email}
							onChange={handleChange}
							required
						/>

						<div>
							<input
								type={showPassword ? 'text' : 'password'}
								name="password"
								placeholder="Password"
								value={formData.password}
								onChange={handleChange}
								required
							/>
							<button type="button" onClick={() => setShowPassword(!showPassword)}>
								{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
							</button>
						</div>
						<button type="submit" disabled={loading}>
							{loading ? 'Logging in...' : 'Login'}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default AdminLogin;




	