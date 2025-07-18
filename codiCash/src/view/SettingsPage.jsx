import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Buttons from "../components/Buttons";
import Modal from "../components/Modal";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAdmin = user?.papel === 'admin';
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("settingsActiveTab") || "profile");
  
  // Estados para dados
  const [users, setUsers] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [filiais, setFiliais] = useState([]);
  const [modalidades, setModalidades] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [cursos, setCursos] = useState([]);
  
  // Estados para modais
  const [modals, setModals] = useState({
    user: false,
    vendedor: false,
    client: false,
    curso: false,
    filial: false
  });
  
  // Estados para itens atuais
  const [currentItems, setCurrentItems] = useState({
    user: null,
    vendedor: null,
    client: null,
    curso: null,
    filial: null
  });
  
  // Estados para formulários
  const [forms, setForms] = useState({
    profile: {
      nome: user?.nome || "",
      email: user?.email || "",
      senhaAtual: "",
      novaSenha: "",
      confirmarSenha: "",
    },
    user: {
      nome: "",
      email: "",
      senha: "",
      papel: "user",
    },
    vendedor: {
      nome: "",
      filialId: "",
    },
    client: {
      nome: "",
      email: "",
      telefone: "",
    },
    curso: {
      nome: "",
      descricao: "",
      preco: "",
      modalidadeId: "",
    },
    filial: {
      nome: "",
      localizacao: "",
    }
  });

  // Persistir aba ativa
  useEffect(() => {
    localStorage.setItem("settingsActiveTab", activeTab);
  }, [activeTab]);

  // Redirecionar se não estiver logado
  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    // Atualizar formulário de perfil com dados do usuário
    setForms(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        nome: user.nome,
        email: user.email
      }
    }));

    // Carregar todos os dados necessários
    fetchAllData();
  }, [user, navigate]);

  const fetchAllData = () => {
    fetchUsers();
    fetchVendedores();
    fetchFiliais();
    fetchClientes();
    fetchCursos();
    fetchModalidades();
  };

  // Funções genéricas
  const getNextId = (array) => {
    if (!array || array.length === 0) return "1";
    const maxId = Math.max(...array.map((item) => Number(item.id) || 0));
    return String(maxId + 1);
  };

  const toggleModal = (modalName, isOpen, item = null) => {
    setModals(prev => ({ ...prev, [modalName]: isOpen }));
    if (item) {
      setCurrentItems(prev => ({ ...prev, [modalName]: item }));
    } else if (!isOpen) {
      setCurrentItems(prev => ({ ...prev, [modalName]: null }));
    }
  };

  const handleFormChange = (formName, e) => {
    const { name, value } = e.target;
    setForms(prev => ({
      ...prev,
      [formName]: {
        ...prev[formName],
        [name]: value
      }
    }));
  };

  // Funções de busca
  const fetchData = async (endpoint, setState) => {
    try {
      const response = await fetch(`http://localhost:3001/${endpoint}`);
      const data = await response.json();
      setState(data);
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
    }
  };

  const fetchUsers = () => fetchData("usuarios", setUsers);
  const fetchVendedores = () => fetchData("vendedores", setVendedores);
  const fetchFiliais = () => fetchData("filiais", setFiliais);
  const fetchModalidades = () => fetchData("modalidades", setModalidades);
  const fetchClientes = () => fetchData("clientes", setClientes);
  const fetchCursos = () => fetchData("cursos", setCursos);

  // Funções auxiliares
  const getFilialName = (filialId) => {
    const filial = filiais.find((f) => f.id === filialId);
    return filial ? `${filial.nome} - ${filial.localizacao}` : "N/A";
  };

  const getModalidadeName = (modalidadeId) => {
    const modalidade = modalidades.find((m) => m.id === modalidadeId);
    return modalidade ? modalidade.tipo : "N/A";
  };

  // Handlers genéricos para CRUD
  const handleSubmit = async (e, endpoint, formName, currentItemName, successMessage) => {
    e.preventDefault();
    const currentItem = currentItems[currentItemName];
    const formData = forms[formName];
    
    const method = currentItem ? "PUT" : "POST";
    const url = currentItem 
      ? `http://localhost:3001/${endpoint}/${currentItem.id}`
      : `http://localhost:3001/${endpoint}`;
    
    const id = currentItem ? currentItem.id : getNextId(eval(endpoint));
    const body = {
      ...formData,
      id,
      data_atualizacao: new Date().toISOString(),
      ...(!currentItem && { data_criacao: new Date().toISOString() }),
    };

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      
      if (!response.ok) throw new Error("Erro na requisição");
      
      toast.success(currentItem ? `${successMessage} atualizado!` : `${successMessage} criado!`);
      fetchData(endpoint, eval(`set${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)}`));
      toggleModal(formName, false);
      setForms(prev => ({ ...prev, [formName]: Object.fromEntries(
        Object.keys(prev[formName]).map(key => [key, key === 'papel' ? 'user' : ''])
      )}));
    } catch (error) {
      toast.error(`Erro ao salvar ${successMessage}`);
      console.error("Error:", error);
    }
  };

  const handleEdit = (item, formName, modalName) => {
    if ((formName === 'user' || modalName === 'user') && !isAdmin) {
      toast.error("Apenas administradores podem editar usuários");
      return;
    }
    
    setCurrentItems(prev => ({ ...prev, [modalName]: item }));
    setForms(prev => ({
      ...prev,
      [formName]: Object.fromEntries(
        Object.keys(prev[formName]).map(key => [key, item[key] || ''])
      )
    }));
    toggleModal(modalName, true, item);
  };

  const handleDelete = async (id, endpoint, successMessage, checkAdmin = false, isSelf = false) => {
    if (checkAdmin && !isAdmin) {
      toast.error("Apenas administradores podem realizar esta ação");
      return;
    }
    
    if (isSelf) {
      toast.error("Você não pode deletar seu próprio usuário");
      return;
    }
    
    if (window.confirm(`Tem certeza que deseja deletar este ${successMessage}?`)) {
      try {
        await fetch(`http://localhost:3001/${endpoint}/${id}`, { method: "DELETE" });
        toast.success(`${successMessage} deletado!`);
        fetchData(endpoint, eval(`set${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)}`));
      } catch (error) {
        toast.error(`Erro ao deletar ${successMessage}`);
        console.error("Error:", error);
      }
    }
  };

  // Handlers específicos
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const { novaSenha, confirmarSenha, senhaAtual, ...profileData } = forms.profile;

    if (novaSenha && novaSenha !== confirmarSenha) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (novaSenha && !senhaAtual) {
      toast.error("Por favor, informe sua senha atual");
      return;
    }

    const updatedData = {
      ...profileData,
      ...(novaSenha && { senha: novaSenha }),
      data_atualizacao: new Date().toISOString(),
    };

    try {
      const response = await fetch(`http://localhost:3001/usuarios/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      
      const updatedUser = await response.json();
      toast.success("Perfil atualizado com sucesso!");
      
      setForms(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          senhaAtual: "",
          novaSenha: "",
          confirmarSenha: "",
        }
      }));
    } catch (error) {
      toast.error("Erro ao atualizar perfil");
      console.error("Error:", error);
    }
  };

  // Componentes reutilizáveis
  const FormInput = ({ label, name, value, onChange, type = "text", required = true, placeholder = "", ...props }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full p-2 border border-gray-300 rounded-md"
        {...props}
      />
    </div>
  );

  const FormSelect = ({ label, name, value, onChange, options, required = true }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full p-2 border border-gray-300 rounded-md"
      >
        <option value="">Selecione uma opção</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.tipo || option.nome || `${option.nome} - ${option.localizacao}`}
          </option>
        ))}
      </select>
    </div>
  );

  const FormButtons = ({ onCancel, onSubmitText }) => (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={onCancel}
        className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm sm:text-base"
      >
        Cancelar
      </button>
      <Buttons type="submit" className="text-sm sm:text-base">
        {onSubmitText}
      </Buttons>
    </div>
  );

  const DataTable = ({ data, columns, onEdit, onDelete }) => (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {col.title}
              </th>
            ))}
            <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr key={item.id}>
              {columns.map((col) => (
                <td key={col.key} className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                  {col.render ? col.render(item) : item[col.key]}
                </td>
              ))}
              <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                <button
                  onClick={() => onEdit(item)}
                  className="text-[#a243d2] hover:text-[#580581] mr-2 sm:mr-3 text-sm sm:text-base"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="text-red-600 hover:text-red-800 text-sm sm:text-base"
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const SectionHeader = ({ title, onAdd }) => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
      <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
      {onAdd && (
        <Buttons onClick={onAdd} className="text-sm sm:text-base">
          Adicionar {title.split(" ").pop()}
        </Buttons>
      )}
    </div>
  );

  // Modals reutilizáveis
  const ClientModal = () => (
    <Modal
      isOpen={modals.client}
      onClose={() => toggleModal("client", false)}
      position="center"
      size="full sm:md"
    >
      <h2 className="text-lg sm:text-xl font-semibold mb-4 text-[#a243d2]">
        {currentItems.client ? "Editar Cliente" : "Adicionar Novo Cliente"}
      </h2>
      <form onSubmit={(e) => handleSubmit(e, "clientes", "client", "client", "Cliente")}>
        <FormInput label="Nome" name="nome" value={forms.client.nome} onChange={(e) => handleFormChange("client", e)} />
        <FormInput label="Email" name="email" value={forms.client.email} onChange={(e) => handleFormChange("client", e)} type="email" />
        <FormInput label="Telefone" name="telefone" value={forms.client.telefone} onChange={(e) => handleFormChange("client", e)} />
        <FormButtons 
          onCancel={() => toggleModal("client", false)} 
          onSubmitText={currentItems.client ? "Atualizar" : "Salvar"} 
        />
      </form>
    </Modal>
  );

  const CursoModal = () => (
    <Modal
      isOpen={modals.curso}
      onClose={() => toggleModal("curso", false)}
      position="center"
      size="full sm:md"
    >
      <h2 className="text-lg sm:text-xl font-semibold mb-4 text-[#a243d2]">
        {currentItems.curso ? "Editar Curso" : "Adicionar Novo Curso"}
      </h2>
      <form onSubmit={(e) => handleSubmit(e, "cursos", "curso", "curso", "Curso")}>
        <FormInput label="Nome" name="nome" value={forms.curso.nome} onChange={(e) => handleFormChange("curso", e)} />
        <FormInput 
          label="Descrição" 
          name="descricao" 
          value={forms.curso.descricao} 
          onChange={(e) => handleFormChange("curso", e)} 
          type="textarea" 
          as="textarea"
          rows="3"
        />
        <FormInput 
          label="Preço (R$)" 
          name="preco" 
          value={forms.curso.preco} 
          onChange={(e) => handleFormChange("curso", e)} 
          type="number" 
          min="0" 
          step="0.01" 
        />
        <FormSelect 
          label="Modalidade" 
          name="modalidadeId" 
          value={forms.curso.modalidadeId} 
          onChange={(e) => handleFormChange("curso", e)} 
          options={modalidades} 
        />
        <FormButtons 
          onCancel={() => toggleModal("curso", false)} 
          onSubmitText={currentItems.curso ? "Atualizar" : "Salvar"} 
        />
      </form>
    </Modal>
  );

  const FilialModal = () => (
    <Modal
      isOpen={modals.filial}
      onClose={() => toggleModal("filial", false)}
      position="center"
      size="full sm:md"
    >
      <h2 className="text-lg sm:text-xl font-semibold mb-4 text-[#a243d2]">
        {currentItems.filial ? "Editar Filial" : "Adicionar Nova Filial"}
      </h2>
      <form onSubmit={(e) => handleSubmit(e, "filiais", "filial", "filial", "Filial")}>
        <FormInput label="Nome" name="nome" value={forms.filial.nome} onChange={(e) => handleFormChange("filial", e)} />
        <FormInput label="Localização" name="localizacao" value={forms.filial.localizacao} onChange={(e) => handleFormChange("filial", e)} />
        <FormButtons 
          onCancel={() => toggleModal("filial", false)} 
          onSubmitText={currentItems.filial ? "Atualizar" : "Salvar"} 
        />
      </form>
    </Modal>
  );

  const UserModal = () => (
    <Modal
      isOpen={modals.user}
      onClose={() => toggleModal("user", false)}
      position="center"
      size="full sm:md"
    >
      <h2 className="text-lg sm:text-xl font-semibold mb-4 text-[#a243d2]">
        {currentItems.user ? "Editar Usuário" : "Adicionar Novo Usuário"}
      </h2>
      <form onSubmit={(e) => handleSubmit(e, "usuarios", "user", "user", "Usuário")}>
        <FormInput label="Nome" name="nome" value={forms.user.nome} onChange={(e) => handleFormChange("user", e)} />
        <FormInput label="Email" name="email" value={forms.user.email} onChange={(e) => handleFormChange("user", e)} type="email" />
        <FormInput 
          label="Senha" 
          name="senha" 
          value={forms.user.senha} 
          onChange={(e) => handleFormChange("user", e)} 
          type="password" 
          required={!currentItems.user}
          placeholder={currentItems.user ? "Deixe em branco para manter a senha atual" : ""}
        />
        <FormSelect 
          label="Papel" 
          name="papel" 
          value={forms.user.papel} 
          onChange={(e) => handleFormChange("user", e)} 
          options={[
            { id: "admin", tipo: "Admin" },
            { id: "user", tipo: "Usuário" }
          ]} 
        />
        <FormButtons 
          onCancel={() => toggleModal("user", false)} 
          onSubmitText={currentItems.user ? "Atualizar" : "Salvar"} 
        />
      </form>
    </Modal>
  );

  const VendedorModal = () => (
    <Modal
      isOpen={modals.vendedor}
      onClose={() => toggleModal("vendedor", false)}
      position="center"
      size="full sm:md"
    >
      <h2 className="text-lg sm:text-xl font-semibold mb-4 text-[#a243d2]">
        {currentItems.vendedor ? "Editar Vendedor" : "Adicionar Novo Vendedor"}
      </h2>
      <form onSubmit={(e) => handleSubmit(e, "vendedores", "vendedor", "vendedor", "Vendedor")}>
        <FormInput label="Nome" name="nome" value={forms.vendedor.nome} onChange={(e) => handleFormChange("vendedor", e)} />
        <FormSelect 
          label="Filial" 
          name="filialId" 
          value={forms.vendedor.filialId} 
          onChange={(e) => handleFormChange("vendedor", e)} 
          options={filiais} 
        />
        <FormButtons 
          onCancel={() => toggleModal("vendedor", false)} 
          onSubmitText={currentItems.vendedor ? "Atualizar" : "Salvar"} 
        />
      </form>
    </Modal>
  );

  // Tabs
  const tabs = [
    { id: "profile", label: "Meu Perfil" },
    ...(isAdmin ? [{ id: "users", label: "Usuários" }] : []),
    { id: "clients", label: "Clientes" },
    { id: "vendedores", label: "Vendedores" },
    { id: "cursos", label: "Cursos" },
    { id: "filiais", label: "Filiais" }
  ];

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-[#a243d2] mb-4 sm:mb-6">Configurações</h1>

      <div className="flex overflow-x-auto border-b border-gray-200 mb-4 sm:mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`py-2 px-3 sm:px-4 font-medium whitespace-nowrap ${
              activeTab === tab.id
                ? "text-[#a243d2] border-b-2 border-[#a243d2]"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "clients" && (
        <div>
          <SectionHeader 
            title="Gerenciamento de Clientes" 
            onAdd={() => {
              setForms(prev => ({ ...prev, client: { nome: "", email: "", telefone: "" } }));
              toggleModal("client", true);
            }} 
          />
          <DataTable
            data={clientes}
            columns={[
              { key: "nome", title: "Nome" },
              { key: "email", title: "Email" },
              { key: "telefone", title: "Telefone" }
            ]}
            onEdit={(client) => handleEdit(client, "client", "client")}
            onDelete={(id) => handleDelete(id, "clientes", "Cliente")}
          />
        </div>
      )}

      {activeTab === "cursos" && (
        <div>
          <SectionHeader 
            title="Gerenciamento de Cursos" 
            onAdd={() => {
              setForms(prev => ({ ...prev, curso: { nome: "", descricao: "", preco: "", modalidadeId: "" } }));
              toggleModal("curso", true);
            }} 
          />
          <DataTable
            data={cursos}
            columns={[
              { key: "nome", title: "Nome" },
              { key: "descricao", title: "Descrição" },
              { key: "preco", title: "Preço", render: (item) => `R$ ${item.preco.toFixed(2)}` },
              { key: "modalidadeId", title: "Modalidade", render: (item) => getModalidadeName(item.modalidadeId) }
            ]}
            onEdit={(curso) => handleEdit(curso, "curso", "curso")}
            onDelete={(id) => handleDelete(id, "cursos", "Curso")}
          />
        </div>
      )}

      {activeTab === "filiais" && (
        <div>
          <SectionHeader 
            title="Gerenciamento de Filiais" 
            onAdd={() => {
              setForms(prev => ({ ...prev, filial: { nome: "", localizacao: "" } }));
              toggleModal("filial", true);
            }} 
          />
          <DataTable
            data={filiais}
            columns={[
              { key: "nome", title: "Nome" },
              { key: "localizacao", title: "Localização" }
            ]}
            onEdit={(filial) => handleEdit(filial, "filial", "filial")}
            onDelete={(id) => handleDelete(id, "filiais", "Filial")}
          />
        </div>
      )}

      {activeTab === "profile" && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Meu Perfil</h2>
          <form onSubmit={handleUpdateProfile}>
            <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <FormInput 
                label="Nome" 
                name="nome" 
                value={forms.profile.nome} 
                onChange={(e) => handleFormChange("profile", e)} 
              />
              <FormInput 
                label="Email" 
                name="email" 
                value={forms.profile.email} 
                onChange={(e) => handleFormChange("profile", e)} 
                type="email" 
              />
            </div>

            <h3 className="text-md sm:text-lg font-medium mb-3 sm:mb-4">Alterar Senha</h3>
            <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <FormInput 
                label="Senha Atual" 
                name="senhaAtual" 
                value={forms.profile.senhaAtual} 
                onChange={(e) => handleFormChange("profile", e)} 
                type="password" 
                required={false}
                placeholder="Preencha apenas se quiser alterar a senha"
              />
              <FormInput 
                label="Nova Senha" 
                name="novaSenha" 
                value={forms.profile.novaSenha} 
                onChange={(e) => handleFormChange("profile", e)} 
                type="password" 
                required={false}
                placeholder="Preencha apenas se quiser alterar a senha"
              />
              <FormInput 
                label="Confirmar Nova Senha" 
                name="confirmarSenha" 
                value={forms.profile.confirmarSenha} 
                onChange={(e) => handleFormChange("profile", e)} 
                type="password" 
                required={false}
                placeholder="Preencha apenas se quiser alterar a senha"
              />
            </div>

            <div className="flex justify-end">
              <Buttons type="submit" className="text-sm sm:text-base">
                Salvar Alterações
              </Buttons>
            </div>
          </form>
        </div>
      )}

      {activeTab === "users" && isAdmin && (
        <div>
          <SectionHeader 
            title="Gerenciamento de Usuários" 
            onAdd={() => {
              setForms(prev => ({ ...prev, user: { nome: "", email: "", senha: "", papel: "user" } }));
              toggleModal("user", true);
            }} 
          />
          <DataTable
            data={users}
            columns={[
              { key: "nome", title: "Nome" },
              { key: "email", title: "Email" },
              { key: "papel", title: "Papel", render: (item) => item.papel.toLowerCase() }
            ]}
            onEdit={(userItem) => handleEdit(userItem, "user", "user")}
            onDelete={(id) => handleDelete(id, "usuarios", "Usuário", true, id === user?.id)}
          />
        </div>
      )}

      {activeTab === "vendedores" && (
        <div>
          <SectionHeader 
            title="Gerenciamento de Vendedores" 
            onAdd={() => {
              setForms(prev => ({ ...prev, vendedor: { nome: "", filialId: "" } }));
              toggleModal("vendedor", true);
            }} 
          />
          <DataTable
            data={vendedores}
            columns={[
              { key: "nome", title: "Nome" },
              { key: "filialId", title: "Filial", render: (item) => getFilialName(item.filialId) }
            ]}
            onEdit={(vendedor) => handleEdit(vendedor, "vendedor", "vendedor")}
            onDelete={(id) => handleDelete(id, "vendedores", "Vendedor")}
          />
        </div>
      )}

      {/* Renderizar todos os modais */}
      <ClientModal />
      <CursoModal />
      <FilialModal />
      <UserModal />
      <VendedorModal />
    </div>
  );
};

export default SettingsPage;