import React, { useEffect, useState, useRef } from "react";
import Table from "../components/Table";
import { SquarePlus, Funnel, Eye, Trash2, PenLine } from "lucide-react";
import Buttons from "../components/Buttons";

// Colocar lógica de parcelas, desconto, impostos, etc

function getNextId(array) {
  if (!array || array.length === 0) return "1";
  const maxId = Math.max(...array.map((item) => Number(item.id) || 0));
  return String(maxId + 1);
}

// Componente de busca/filtro para despesas
function SearchFilterExpenses({
  data,
  columns,
  setFilteredData,
  selectedField,
}) {
  const [localSearch, setLocalSearch] = React.useState("");

  const handleSearch = () => {
    if (!localSearch.trim()) {
      setFilteredData(data);
      return;
    }
    const lower = localSearch.toLowerCase();
    setFilteredData(
      data.filter((row) => {
        if (selectedField && columns.includes(selectedField)) {
          return String(row[selectedField] || "")
            .toLowerCase()
            .includes(lower);
        } else {
          return columns.some((col) =>
            String(row[col] || "")
              .toLowerCase()
              .includes(lower)
          );
        }
      })
    );
  };

  const handleClearSearch = () => {
    setLocalSearch("");
    setFilteredData(data);
  };

  return (
    <div className="flex flex-row gap-2 items-center w-full mb-2">
      <input
        type="text"
        placeholder="Buscar..."
        className="border border-[#a243d2] rounded px-2 py-1 text-[#a243d2] placeholder-[#a243d2] bg-transparent"
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
      />
      <button
        className="px-3 py-1 rounded bg-[#a243d2] text-white font-semibold border border-[#a243d2] hover:bg-[#580581]"
        onClick={handleSearch}
        type="button"
      >
        Buscar
      </button>
      <button
        className="px-3 py-1 rounded bg-gray-200 text-[#a243d2] font-semibold border border-[#a243d2] ml-1 hover:bg-gray-300"
        onClick={handleClearSearch}
        type="button"
      >
        Limpar
      </button>
    </div>
  );
}

const ExpensesPage = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [showPopover, setShowPopover] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const [selectedRow, setSelectedRow] = useState(null);
  const popoverRef = useRef();
  const modalRef = useRef();

  const [showEditForm, setShowEditForm] = useState(false);
  const [editValor, setEditValor] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [statusList, setStatusList] = useState([]);
  const [despesasOriginais, setDespesasOriginais] = useState([]);
  const [statusMap, setStatusMap] = useState({});

  // Para modal de nova despesa
  const [showNewExpenseModal, setShowNewExpenseModal] = useState(false);
  const [tiposDespesas, setTiposDespesas] = useState([]);
  const [filiais, setFiliais] = useState([]);
  const [categoriasDespesas, setCategoriasDespesas] = useState([]);
  // Busca e filtro
  const [filteredData, setFilteredData] = useState([]);
  // Modal filtro
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedField, setSelectedField] = useState("");

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  useEffect(() => {
    fetch("http://localhost:3001/status")
      .then((res) => res.json())
      .then((status) => {
        setStatusList(status);
        const map = {};
        status.forEach((s) => (map[s.id] = s.nome));
        setStatusMap(map);
      });
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:3001/despesas").then((res) => res.json()),
      fetch("http://localhost:3001/tiposDespesas").then((res) => res.json()),
      fetch("http://localhost:3001/status").then((res) => res.json()),
      fetch("http://localhost:3001/filiais").then((res) => res.json()),
      fetch("http://localhost:3001/categoriasDespesas").then((res) =>
        res.json()
      ),
    ]).then(
      ([
        despesas,
        tiposDespesasData,
        status,
        filiaisData,
        categoriasDespesasData,
      ]) => {
        setDespesasOriginais(despesas);
        setTiposDespesas(tiposDespesasData);
        setFiliais(filiaisData);
        setCategoriasDespesas(categoriasDespesasData);

        const despesasEnriquecidas = despesas.map((despesa) => ({
          id: despesa.id,
          Data: new Date(despesa.data_despesa).toLocaleDateString("pt-BR"),
          Categoria:
            categoriasDespesasData.find(
              (c) =>
                c.id ===
                tiposDespesasData.find((t) => t.id === despesa.tipoDespesaId)
                  ?.categoriaId
            )?.nome || "",
          Filial:
            filiaisData.find((f) => f.id === despesa.filialId)?.nome ||
            despesa.filialId,
          Descrição:
            tiposDespesasData.find((t) => t.id === despesa.tipoDespesaId)
              ?.descricao ||
            despesa.descricao ||
            "",
          Valor: `R$ ${Number(despesa.valor).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}`,
          Pagamento: "PIX", // ajuste conforme seu backend
          Status:
            status.find((s) => s.id === despesa.statusId)?.nome ||
            despesa.statusId,
          statusId: despesa.statusId,
          valor: despesa.valor,
          data_despesa: despesa.data_despesa,
        }));

        setData(despesasEnriquecidas);
        setColumns([
          "Data",
          "Categoria",
          "Filial",
          "Descrição",
          "Valor",
          "Pagamento",
          "Status",
        ]);
      }
    );
  }, []);

  const handleOpenPopover = (row, event) => {
    const rect = event.target.getBoundingClientRect();
    setPopoverPos({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });
    setSelectedRow(row);
    setShowPopover(true);
    setShowEditForm(false);
  };

  useEffect(() => {
    if (!showPopover && !showEditForm) return;
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setShowPopover(false);
        setShowEditForm(false);
        setSelectedRow(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPopover, showEditForm]);

  const handleEdit = () => {
    setEditValor(selectedRow.Valor.replace(/[^\d,]/g, "").replace(",", "."));
    setEditStatus(
      statusList.find((s) => s.nome === selectedRow.Status)?.id || ""
    );
    setShowEditForm(true);
    setShowPopover(false);
  };

  const handleSaveEdit = async () => {
    const despesaOriginal = despesasOriginais.find(
      (d) => d.id === selectedRow.id
    );
    if (!despesaOriginal) return;

    // Atualiza todos os campos editáveis
    const despesaAtualizada = {
      ...despesaOriginal,
      valor: Number(editValor),
      statusId: editStatus,
      data_despesa: selectedRow.data_despesa || despesaOriginal.data_despesa,
      descricao: selectedRow.Descrição || despesaOriginal.descricao,
    };

    await fetch(`http://localhost:3001/despesas/${selectedRow.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(despesaAtualizada),
    });

    // Atualiza tabela exibida
    setData((prev) =>
      prev.map((item) =>
        item.id === selectedRow.id
          ? {
              ...item,
              Valor: `R$ ${Number(editValor).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}`,
              Status: statusMap[editStatus] || editStatus,
              data_despesa: despesaAtualizada.data_despesa,
              Descrição: despesaAtualizada.descricao,
              valor: Number(editValor),
              statusId: editStatus,
            }
          : item
      )
    );
    setShowEditForm(false);
    setSelectedRow(null);
  };

  const handleDelete = async () => {
    await fetch(`http://localhost:3001/despesas/${selectedRow.id}`, {
      method: "DELETE",
    });
    setData((prev) => prev.filter((item) => item.id !== selectedRow.id));
    setShowPopover(false);
    setSelectedRow(null);
  };

  // --- Modal Nova Despesa ---
  const [form, setForm] = useState({
    tipoDespesaId: "",
    valor: "",
    filialId: "",
    statusId: "",
    data_despesa: "",
    descricao: "",
  });

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNewExpenseSubmit = async (e) => {
    e.preventDefault();
    const novoId = getNextId(data); // data é o array de despesas já carregado
    const novaDespesa = {
      ...form,
      id: novoId,
      valor: Number(form.valor),
      data_despesa: form.data_despesa || new Date().toISOString(),
    };
    const response = await fetch("http://localhost:3001/despesas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novaDespesa),
    });
    const despesaSalva = await response.json();
    setShowNewExpenseModal(false);
    setForm({
      tipoDespesaId: "",
      valor: "",
      filialId: "",
      statusId: "",
      data_despesa: "",
      descricao: "",
    });
    setData((prev) => [...prev, despesaSalva]);
  };

  useEffect(() => {
    if (!showNewExpenseModal) return;
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowNewExpenseModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNewExpenseModal]);

  return (
    <div className="p-0 min-h-screen bg-[#f3f8fc] flex flex-col items-center">
      <div className="w-full max-w-5xl flex flex-col items-center">
        <h2 className="text-4xl font-bold text-[#a243d2] mt-6 mb-1 w-full text-left">
          Despesas
        </h2>
        <p className="text-[#a243d2] text-lg mb-6 w-full text-left">
          Lançamento e gerenciamento de despesas fixas e variáveis
        </p>
        <div className="flex flex-row items-center justify-end w-full mb-4 gap-2">
          <button className="px-4 py-2 rounded-full bg-[#e9e0f7] text-[#a243d2] font-semibold border border-[#a243d2] shadow-sm">
            Despesas fixas
          </button>
          <button className="px-4 py-2 rounded-full bg-[#e9e0f7] text-[#a243d2] font-semibold border border-[#a243d2] shadow-sm opacity-60">
            Despesas Variáveis
          </button>
          <button
            className="flex items-center gap-2 px-3 py-1 rounded bg-transparent border border-[#a243d2] text-[#a243d2] hover:bg-[#e9e0f7] ml-4"
            onClick={() => setShowFilterModal(!showFilterModal)}
            type="button"
            style={{ minWidth: 40 }}
          >
            <Funnel />
          </button>
          {showFilterModal && (
            <select
              className="border border-[#a243d2] rounded px-2 py-1 text-[#a243d2] bg-transparent"
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              style={{ minWidth: 140 }}
            >
              <option value="">Todos os campos</option>
              {columns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          )}
          <div
            className="flex flex-row gap-2 items-center"
            style={{ minWidth: 320 }}
          >
            <SearchFilterExpenses
              data={data}
              columns={columns}
              setFilteredData={setFilteredData}
              selectedField={selectedField}
            />
          </div>
          <Buttons
            className="flex flex-row items-center gap-2 rounded-lg px-4 py-2 border border-[#a243d2] bg-[#a243d2] text-white font-semibold shadow-sm ml-4"
            onClick={() => setShowNewExpenseModal(true)}
            style={{ marginLeft: "auto" }}
          >
            <SquarePlus size={18} />
            <span>Nova Despesa</span>
          </Buttons>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-0 w-full border-2 border-[#a243d2]">
          <Table
            data={filteredData}
            columns={columns}
            renderActions={(row) => (
              <div className="flex justify-center items-center gap-3 mx-2">
                <button
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  title="Visualizar"
                >
                  <Eye size={18} />
                </button>
                <button
                  className="p-1.5 text-[#a243d2] hover:bg-purple-50 rounded-full transition-colors"
                  onClick={(e) => {
                    setSelectedRow(row);
                    setEditValor(row.valor);
                    setEditStatus(
                      statusList.find((s) => s.nome === row.Status)?.id || ""
                    );
                    setShowEditForm(true);
                  }}
                  title="Editar"
                >
                  <PenLine size={18} />
                </button>
                <button
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Tem certeza que deseja excluir esta despesa?"
                      )
                    ) {
                      setSelectedRow(row);
                      handleDelete();
                    }
                  }}
                  title="Excluir"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          />
        </div>
      </div>
      {/* Modal de edição permanece, mas o popover de ações foi removido */}
      {showEditForm && selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent">
          <div
            ref={popoverRef}
            className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg border-2 border-[#a243d2] relative"
            style={{ minWidth: 320 }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveEdit();
              }}
              className="flex flex-col gap-3"
            >
              <div>
                <label className="block text-sm text-[#a243d2] mb-1">
                  Data:
                </label>
                <input
                  type="date"
                  value={
                    selectedRow.data_despesa
                      ? selectedRow.data_despesa.slice(0, 10)
                      : ""
                  }
                  onChange={(e) =>
                    setSelectedRow({
                      ...selectedRow,
                      data_despesa: e.target.value,
                    })
                  }
                  className="border border-[#a243d2] p-1 w-full rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-[#a243d2] mb-1">
                  Categoria:
                </label>
                <select
                  value={selectedRow.Categoria || ""}
                  onChange={(e) =>
                    setSelectedRow({
                      ...selectedRow,
                      Categoria: e.target.value,
                    })
                  }
                  className="border border-[#a243d2] p-1 w-full rounded"
                >
                  <option value="">Selecione</option>
                  {categoriasDespesas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#a243d2] mb-1">
                  Filial:
                </label>
                <select
                  value={selectedRow.Filial || ""}
                  onChange={(e) =>
                    setSelectedRow({ ...selectedRow, Filial: e.target.value })
                  }
                  className="border border-[#a243d2] p-1 w-full rounded"
                >
                  <option value="">Selecione</option>
                  {filiais.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#a243d2] mb-1">
                  Descrição:
                </label>
                <input
                  type="text"
                  value={selectedRow.Descrição || ""}
                  onChange={(e) =>
                    setSelectedRow({
                      ...selectedRow,
                      Descrição: e.target.value,
                    })
                  }
                  className="border border-[#a243d2] p-1 w-full rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-[#a243d2] mb-1">
                  Valor:
                </label>
                <input
                  type="number"
                  value={editValor}
                  onChange={(e) => setEditValor(e.target.value)}
                  className="border border-[#a243d2] p-1 w-full rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-[#a243d2] mb-1">
                  Pagamento:
                </label>
                <input
                  type="text"
                  value={selectedRow.Pagamento || ""}
                  onChange={(e) =>
                    setSelectedRow({
                      ...selectedRow,
                      Pagamento: e.target.value,
                    })
                  }
                  className="border border-[#a243d2] p-1 w-full rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-[#a243d2] mb-1">
                  Status:
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="border border-[#a243d2] p-1 w-full rounded"
                  required
                >
                  <option value="">Selecione</option>
                  {statusList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="block w-full text-left text-green-600 mb-2"
              >
                Salvar
              </button>
              <button
                type="button"
                className="block w-full text-left text-gray-600"
                onClick={() => {
                  setShowEditForm(false);
                  setSelectedRow(null);
                }}
              >
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Modal Nova Despesa */}
      {showNewExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent">
          <div
            ref={modalRef}
            className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg border-2 border-[#a243d2] relative"
          >
            <button
              className="absolute top-2 right-4 text-2xl text-[#a243d2] font-bold"
              onClick={() => setShowNewExpenseModal(false)}
            >
              ×
            </button>
            <h3 className="text-2xl font-bold text-[#a243d2] mb-4">
              Nova Despesa
            </h3>
            <form
              onSubmit={handleNewExpenseSubmit}
              className="flex flex-col gap-4"
            >
              <select
                name="tipoDespesaId"
                value={form.tipoDespesaId}
                onChange={handleFormChange}
                className="border rounded p-2"
                required
              >
                <option value="">Selecione o Tipo de Despesa</option>
                {tiposDespesas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </select>
              <input
                className="border rounded p-2"
                name="valor"
                placeholder="Valor"
                type="number"
                value={form.valor}
                onChange={handleFormChange}
                required
              />
              <select
                name="filialId"
                value={form.filialId}
                onChange={handleFormChange}
                className="border rounded p-2"
              >
                <option value="">Selecione a Filial</option>
                {filiais.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome}
                  </option>
                ))}
              </select>
              <select
                name="statusId"
                value={form.statusId}
                onChange={handleFormChange}
                className="border rounded p-2"
                required
              >
                <option value="">Selecione o Status</option>
                {statusList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome}
                  </option>
                ))}
              </select>
              <input
                className="border rounded p-2"
                name="data_despesa"
                type="date"
                value={form.data_despesa}
                onChange={handleFormChange}
              />
              <input
                className="border rounded p-2"
                name="descricao"
                placeholder="Descrição"
                value={form.descricao}
                onChange={handleFormChange}
              />
              <button
                type="submit"
                className="bg-[#a243d2] text-white rounded px-4 py-2 font-semibold mt-2"
              >
                Salvar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;
