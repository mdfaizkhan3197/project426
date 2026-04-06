import React, { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [form, setForm] = useState({
        username: "",
        password: "",
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await API.post("login/", form);

            localStorage.setItem("token", res.data.access);
            console.log(localStorage.getItem("token"));
            navigate("/dashboard");
        } catch (error) {
            alert("Invalid username or password");
        }
    };

    return (
        <div style={{ padding: "50px" }}>
            <h1>Login</h1>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    onChange={handleChange}
                />
                <br /><br />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    onChange={handleChange}
                />
                <br /><br />

                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;