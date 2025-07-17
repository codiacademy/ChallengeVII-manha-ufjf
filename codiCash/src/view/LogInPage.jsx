import React from "react";
import cclogo from "../img/cclogo.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LogInPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [nome, setNome] = React.useState("");
  const [senha, setSenha] = React.useState("");

  const LogIn = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/usuarios?nome=' + nome);
      const users = await response.json();
      if (users.length > 0 && users[0].senha === senha) {
        login({
          id: users[0].id,
          nome: users[0].nome,
          email: users[0].email,
          papel: users[0].papel
        });
        navigate("/dashboard");
      } else {
        alert("Usuário ou senha incorretos. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      alert("Ocorreu um erro ao tentar fazer login. Por favor, tente novamente mais tarde.");
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert("Redirecionando para a página de recuperação de senha...");
  };

  return (
    <div className="bg-[#580581] h-screen flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center h-auto w-100 bg-[#a243d2] rounded-lg shadow-lg">
        <div>
          <img src={cclogo} alt="Logo" className="w-24 h-24" />
        </div>
        <form onSubmit={LogIn} className="bg-white p-8 rounded shadow-md w-100 h-auto flex flex-col text-[#a243d2]">
          <h1 className="flex flex-col items-center justify-center text-xl font-bold mb-4">
            Bem vindo ao Codi Cash!
          </h1>
          <label>Nome de usuário:</label>
          <input
            className="w-full border border-[#a234d2]-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#a234d2]-400"
            type="text"
            id="nome"
            name="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
          <label htmlFor="senha">Senha:</label>
          <input
            className="w-full border border-[#a234d2]-300 roded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#a234d2]-400"
            type="password"
            id="senha"
            name="senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
          <a
            className="underline mb-4"
            id="forgot-password"
            href="#"
            onClick={handleForgotPassword}
          >
            Esqueci minha senha
          </a>
          <button
            className="bg-[#a243d2] text-white px-18 py-1 rounded-lg"
            type="submit"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default LogInPage;