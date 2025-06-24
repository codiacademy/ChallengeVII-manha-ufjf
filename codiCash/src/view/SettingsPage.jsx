import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Buttons from "../components/Buttons";
import Modal from "../components/Modal";
import { toast } from "react-toastify";

const SettingsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [users, setUsers] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [filiais, setFiliais] = useState([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isVendedorModalOpen, setIsVendedorModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentVendedor, setCurrentVendedor] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [profileForm, setProfileForm] = useState({
    nome: "",
    email: "",
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: "",
  });

  const [userForm, setUserForm] = useState({
    nome: "",
    email: "",
    senha: "",
    papel: "user",
  });

  const [vendedorForm, setVendedorForm] = useState({
    nome: "",
    filialId: "",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("loggedInUserData"));
    if (user) {
      setLoggedInUser(user);
      setIsAdmin(user.papel === "admin");
      setProfileForm({
        nome: user.nome,
        email: user.email,
        senhaAtual: "",
        novaSenha: "",
        confirmarSenha: "",
      });

      fetchUsers();
      fetchVendedores();
      fetchFiliais();
    } else {
      navigate("/");
    }
  }, [navigate]);

  const fetchUsers = () => {
    fetch("http://localhost:3001/usuarios")
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error("Error fetching users:", error));
  };

  const fetchVendedores = () => {
    fetch("http://localhost:3001/vendedores")
      .then((response) => response.json())
      .then((data) => setVendedores(data))
      .catch((error) => console.error("Error fetching vendedores:", error));
  };

  const fetchFiliais = () => {
    fetch("http://localhost:3001/filiais")
      .then((response) => response.json())
      .then((data) => setFiliais(data))
      .catch((error) => console.error("Error fetching filiais:", error));
  };

  const getFilialName = (filialId) => {
    const filial = filiais.find((f) => f.id === filialId);
    return filial ? `${filial.nome} - ${filial.localizacao}` : "N/A";
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVendedorFormChange = (e) => {
    const { name, value } = e.target;
    setVendedorForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();

    if (
      profileForm.novaSenha &&
      profileForm.novaSenha !== profileForm.confirmarSenha
    ) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (profileForm.novaSenha && !profileForm.senhaAtual) {
      toast.error("Por favor, informe sua senha atual");
      return;
    }

    if (
      profileForm.senhaAtual &&
      profileForm.senhaAtual !== loggedInUser.senha
    ) {
      toast.error("Senha atual incorreta");
      return;
    }

    const updatedData = {
      nome: profileForm.nome,
      email: profileForm.email,
      ...(profileForm.novaSenha && { senha: profileForm.novaSenha }),
      data_atualizacao: new Date().toISOString(),
    };

    fetch(`http://localhost:3001/usuarios/${loggedInUser.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    })
      .then((response) => response.json())
      .then((updatedUser) => {
        toast.success("Perfil atualizado com sucesso!");
        localStorage.setItem("loggedInUserData", JSON.stringify(updatedUser));
        setLoggedInUser(updatedUser);
        setProfileForm({
          ...profileForm,
          senhaAtual: "",
          novaSenha: "",
          confirmarSenha: "",
        });
      })
      .catch((error) => {
        toast.error("Erro ao atualizar perfil");
        console.error("Error:", error);
      });
  };

  const handleUserSubmit = (e) => {
    e.preventDefault();

    const method = currentUser ? "PUT" : "POST";
    const url = currentUser
      ? `http://localhost:3001/usuarios/${currentUser.id}`
      : "http://localhost:3001/usuarios";

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...userForm,
        data_atualizacao: new Date().toISOString(),
        ...(!currentUser && { data_criacao: new Date().toISOString() }),
      }),
    })
      .then(() => {
        toast.success(currentUser ? "Usuário atualizado!" : "Usuário criado!");
        fetchUsers();
        setIsUserModalOpen(false);
        setCurrentUser(null);
        setUserForm({
          nome: "",
          email: "",
          senha: "",
          papel: "user",
        });
      })
      .catch((error) => {
        toast.error("Erro ao salvar usuário");
        console.error("Error:", error);
      });
  };

  const handleVendedorSubmit = (e) => {
    e.preventDefault();

    const method = currentVendedor ? "PUT" : "POST";
    const url = currentVendedor
      ? `http://localhost:3001/vendedores/${currentVendedor.id}`
      : "http://localhost:3001/vendedores";

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...vendedorForm,
        ...(currentVendedor && { data_atualizacao: new Date().toISOString() }),
        ...(!currentVendedor && { data_criacao: new Date().toISOString() }),
      }),
    })
      .then(() => {
        toast.success(
          currentVendedor ? "Vendedor atualizado!" : "Vendedor criado!"
        );
        fetchVendedores();
        setIsVendedorModalOpen(false);
        setCurrentVendedor(null);
        setVendedorForm({
          nome: "",
          filialId: "",
        });
      })
      .catch((error) => {
        toast.error("Erro ao salvar vendedor");
        console.error("Error:", error);
      });
  };

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setUserForm({
      nome: user.nome,
      email: user.email,
      senha: "",
      papel: user.papel,
    });
    setIsUserModalOpen(true);
  };

  const handleEditVendedor = (vendedor) => {
    setCurrentVendedor(vendedor);
    setVendedorForm({
      nome: vendedor.nome,
      filialId: vendedor.filialId,
    });
    setIsVendedorModalOpen(true);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm("Tem certeza que deseja deletar este usuário?")) {
      fetch(`http://localhost:3001/usuarios/${userId}`, {
        method: "DELETE",
      })
        .then(() => {
          toast.success("Usuário deletado!");
          fetchUsers();
        })
        .catch((error) => {
          toast.error("Erro ao deletar usuário");
          console.error("Error:", error);
        });
    }
  };

  const handleDeleteVendedor = (vendedorId) => {
    if (window.confirm("Tem certeza que deseja deletar este vendedor?")) {
      fetch(`http://localhost:3001/vendedores/${vendedorId}`, {
        method: "DELETE",
      })
        .then(() => {
          toast.success("Vendedor deletado!");
          fetchVendedores();
        })
        .catch((error) => {
          toast.error("Erro ao deletar vendedor");
          console.error("Error:", error);
        });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-[#a243d2] mb-6">Configurações</h1>

      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "profile"
              ? "text-[#a243d2] border-b-2 border-[#a243d2]"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("profile")}
        >
          Meu Perfil
        </button>
        {isAdmin && (
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "users"
                ? "text-[#a243d2] border-b-2 border-[#a243d2]"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("users")}
          >
            Usuários
          </button>
        )}
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "vendedores"
              ? "text-[#a243d2] border-b-2 border-[#a243d2]"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("vendedores")}
        >
          Vendedores
        </button>
      </div>

      {activeTab === "profile" && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Meu Perfil</h2>

          <form onSubmit={handleUpdateProfile}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  name="nome"
                  value={profileForm.nome}
                  onChange={handleProfileChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <h3 className="text-lg font-medium mb-4">Alterar Senha</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha Atual
                </label>
                <input
                  type="password"
                  name="senhaAtual"
                  value={profileForm.senhaAtual}
                  onChange={handleProfileChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Preencha apenas se quiser alterar a senha"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nova Senha
                </label>
                <input
                  type="password"
                  name="novaSenha"
                  value={profileForm.novaSenha}
                  onChange={handleProfileChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Preencha apenas se quiser alterar a senha"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  name="confirmarSenha"
                  value={profileForm.confirmarSenha}
                  onChange={handleProfileChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Preencha apenas se quiser alterar a senha"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Buttons type="submit">Salvar Alterações</Buttons>
            </div>
          </form>
        </div>
      )}

      {activeTab === "users" && isAdmin && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Gerenciamento de Usuários</h2>
            <Buttons onClick={() => setIsUserModalOpen(true)}>
              Adicionar Usuário
            </Buttons>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Papel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{user.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap capitalize">
                      {user.papel.toLowerCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-[#a243d2] hover:text-[#580581] mr-3"
                      >
                        Editar
                      </button>
                      {user.id !== loggedInUser?.id && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Excluir
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "vendedores" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Gerenciamento de Vendedores
            </h2>
            <Buttons onClick={() => setIsVendedorModalOpen(true)}>
              Adicionar Vendedor
            </Buttons>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Filial
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vendedores.map((vendedor) => (
                  <tr key={vendedor.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {vendedor.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getFilialName(vendedor.filialId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleEditVendedor(vendedor)}
                        className="text-[#a243d2] hover:text-[#580581] mr-3"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteVendedor(vendedor.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setCurrentUser(null);
        }}
        position="center"
      >
        <h2 className="text-xl font-semibold mb-4 text-[#a243d2]">
          {currentUser ? "Editar Usuário" : "Adicionar Novo Usuário"}
        </h2>

        <form onSubmit={handleUserSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome
            </label>
            <input
              type="text"
              name="nome"
              value={userForm.nome}
              onChange={handleUserFormChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={userForm.email}
              onChange={handleUserFormChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              name="senha"
              value={userForm.senha}
              onChange={handleUserFormChange}
              required={!currentUser}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder={
                currentUser ? "Deixe em branco para manter a senha atual" : ""
              }
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Papel
            </label>
            <select
              name="papel"
              value={userForm.papel}
              onChange={handleUserFormChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="admin">Admin</option>
              <option value="user">Usuário</option>
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsUserModalOpen(false);
                setCurrentUser(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <Buttons type="submit">
              {currentUser ? "Atualizar" : "Salvar"}
            </Buttons>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isVendedorModalOpen}
        onClose={() => {
          setIsVendedorModalOpen(false);
          setCurrentVendedor(null);
        }}
        position="center"
      >
        <h2 className="text-xl font-semibold mb-4 text-[#a243d2]">
          {currentVendedor ? "Editar Vendedor" : "Adicionar Novo Vendedor"}
        </h2>

        <form onSubmit={handleVendedorSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome
            </label>
            <input
              type="text"
              name="nome"
              value={vendedorForm.nome}
              onChange={handleVendedorFormChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filial
            </label>
            <select
              name="filialId"
              value={vendedorForm.filialId}
              onChange={handleVendedorFormChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Selecione uma filial</option>
              {filiais.map((filial) => (
                <option key={filial.id} value={filial.id}>
                  {filial.nome} - {filial.localizacao}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsVendedorModalOpen(false);
                setCurrentVendedor(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <Buttons type="submit">
              {currentVendedor ? "Atualizar" : "Salvar"}
            </Buttons>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SettingsPage;
