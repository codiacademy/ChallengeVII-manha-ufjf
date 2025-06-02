import React from "react";
import cclogo from "../img/cclogo.png";
import { useNavigate } from "react-router-dom";

const LogInPage = () => {
  const navigate = useNavigate();
  const [nome, setNome] = React.useState("");
  const [senha, setSenha] = React.useState("");

  const LogIn = async () => {
    try {
      const response = await fetch('http://localhost:3001/usuarios?nome=' + nome);
      const users = await response.json();
      if (users.length > 0 && users[0].senha === senha) {
        localStorage.setItem("loggedInUser", users[0].nome);
        alert("Login bem-sucedido!");
        navigate("/dashboard");
      } else {
        alert("Usuário ou senha incorretos. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      alert("Ocorreu um erro ao tentar fazer login. Por favor, tente novamente mais tarde.");
    }
  };

  const handleForgotPassword = () => {
    alert("Redirecionando para a página de recuperação de senha...");
    // Aqui você pode redirecionar para a página de recuperação de senha se desejar
  };

  return (
    <div class="bg-[#580581] h-screen flex flex-col items-center justify-center">
      <div class="flex flex-col items-center justify-center h-auto w-100 bg-[#a243d2] rounded-lg shadow-lg">
        <div>
          <img srcSet={cclogo} alt="Logo" className="w-24 h-24" />
        </div>
        <div class="bg-white p-8 rounded shadow-md w-100 h-auto flex flex-col text-[#a243d2]">
          <h1 class="flex flex-col items-center justify-center text-xl font-bold mb-4">
            Bem vindo ao Codi Cash!
          </h1>
          <label>Nome de usuário:</label>
          <input
            class="w-full border border-[#a234d2]-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#a234d2]-400"
            type="text"
            id="nome"
            name="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
          <label htmlFor="password">Senha:</label>
          <input
            class="w-full border border-[#a234d2]-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#a234d2]-400"
            type="password"
            id="senha"
            name="senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
          <a
            class="underline mb-4"
            id="forgot-password"
            href="#"
            onClick={handleForgotPassword}
          >
            Esqueci minha senha
          </a>
          <button
            class="bg-[#a243d2] text-white px-18 py-1 rounded-lg"
            type="submit"
            onClick={LogIn}
          >
            Entrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogInPage;
