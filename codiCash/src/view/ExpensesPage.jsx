import React, { useEffect, useState, useRef, useCallback } from "react";
import Table from "../components/Table";
import {
  SquarePlus,
  Funnel,
  Eye,
  Trash2,
  PenLine,
  CalendarDays,
  LocateFixed,
  TrendingUpDown,
  BanknoteArrowDown,
} from "lucide-react";
import Buttons from "../components/Buttons";
import SummaryCard from "../components/SummaryCard";

const getNextId = (array) => {
  if (!array?.length) return "1";
  const maxId = Math.max(...array.map((item) => Number(item.id) || 0));
  return String(maxId + 1);
};

const SearchFilterExpenses = ({
  data,
  columns,
  setFilteredData,
  selectedField,
}) => {
  const [localSearch, setLocalSearch] = useState("");

  const handleSearch = useCallback(() => {
    if (!localSearch.trim()) {
      setFilteredData(data);
      return;
    }
    const lower = localSearch.toLowerCase();
    setFilteredData(
      data.filter((row) =>
        selectedField && columns.includes(selectedField)
          ? String(row[selectedField] || "")
              .toLowerCase()
              .includes(lower)
          : columns.some((col) =>
              String(row[col] || "")
                .toLowerCase()
                .includes(lower)
            )
      )
    );
  }, [localSearch, data, columns, selectedField, setFilteredData]);

  const handleClearSearch = useCallback(() => {
    setLocalSearch("");
    setFilteredData(data);
  }, [data, setFilteredData]);

  return (
    <div className="flex flex-col sm:flex-row gap-2 items-center w-full mb-2">
      <input
        type="text"
        placeholder="Buscar..."
        className="border border-[#a243d2] rounded px-2 py-1 text-[#a243d2] placeholder-[#a243d2] bg-transparent w-full sm:w-auto"
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
      />
      <div className="flex gap-2 w-full sm:w-auto">
        <button
          className="px-3 py-1 rounded bg-[#a243d2] text-white font-semibold border border-[#a243d2] hover:bg-[#580581] w-full sm:w-auto"
          onClick={handleSearch}
          type="button"
        >
          Buscar
        </button>
        <button
          className="px-3 py-1 rounded bg-gray-200 text-[#a243d2] font-semibold border border-[#a243d2] hover:bg-gray-300 w-full sm:w-auto"
          onClick={handleClearSearch}
          type="button"
        >
          Limpar
        </button>
      </div>
    </div>
  );
};

const ExpenseModal = ({ title, onClose, children, buttons }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 p-4">
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 w-full max-w-lg border border-[#a243d2] relative overflow-y-auto max-h-[90vh]">
      <button
        className="absolute top-2 right-4 text-2xl text-[#a243d2] font-bold hover:text-[#580581]"
        onClick={onClose}
      >
        ×
      </button>
      <h3 className="text-xl sm:text-2xl font-bold text-[#a243d2] mb-4">{title}</h3>
      {children}
      {buttons && <div className="flex justify-end gap-2 mt-4">{buttons}</div>}
    </div>
  </div>
);

const ExpensesPage = () => {
  // State hooks
  const [data, setData] = useState([]);
  const [columns] = useState([
    "Data",
    "Categoria",
    "Filial",
    "Descrição",
    "Valor",
    "Status",
  ]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [editValor, setEditValor] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [statusList, setStatusList] = useState([]);
  const [despesasOriginais, setDespesasOriginais] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [tiposDespesas, setTiposDespesas] = useState([]);
  const [filiais, setFiliais] = useState([]);
  const [categoriasDespesas, setCategoriasDespesas] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedField, setSelectedField] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewRow, setViewRow] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showNewExpenseModal, setShowNewExpenseModal] = useState(false);

  const [form, setForm] = useState({
    tipoDespesaId: "",
    valor: "",
    filialId: "",
    statusId: "",
    data_despesa: "",
    descricao: "",
  });

  // Refs
  const modalRef = useRef();
  const viewModalRef = useRef();

  // Calculated values
  const totalFixa = data
    .filter((item) => item.Categoria === "Fixa")
    .reduce((sum, item) => sum + (item.valor || 0), 0);

  const totalVariavel = data
    .filter((item) => item.Categoria === "Variável")
    .reduce((sum, item) => sum + (item.valor || 0), 0);

  const totalGeral = totalFixa + totalVariavel;

  // Helper functions
  const formatCurrency = (value) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const filterData = useCallback(() => {
    let result = [...data];

    if (activeCategory) {
      result = result.filter((item) => item.Categoria === activeCategory);
    }

    if (dateRange.start || dateRange.end) {
      result = result.filter((item) => {
        const itemDate = new Date(item.data_despesa);
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        const endDate = dateRange.end ? new Date(dateRange.end) : null;

        return (
          (!startDate || itemDate >= startDate) &&
          (!endDate || itemDate <= endDate)
        );
      });
    }

    setFilteredData(result);
  }, [data, activeCategory, dateRange]);

  // API calls
  useEffect(() => {
    fetch("http://localhost:3001/status")
      .then((res) => res.json())
      .then((status) => {
        setStatusList(status);
        setStatusMap(Object.fromEntries(status.map((s) => [s.id, s.nome])));
      });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const [
        despesas,
        tiposDespesasData,
        status,
        filiaisData,
        categoriasDespesasData,
      ] = await Promise.all([
        fetch("http://localhost:3001/despesas").then((res) => res.json()),
        fetch("http://localhost:3001/tiposDespesas").then((res) => res.json()),
        fetch("http://localhost:3001/status").then((res) => res.json()),
        fetch("http://localhost:3001/filiais").then((res) => res.json()),
        fetch("http://localhost:3001/categoriasDespesas").then((res) =>
          res.json()
        ),
      ]);

      setDespesasOriginais(despesas);
      setTiposDespesas(tiposDespesasData);
      setFiliais(filiaisData);
      setCategoriasDespesas(categoriasDespesasData);

      const despesasEnriquecidas = despesas.map((despesa) => {
        const tipoDespesa = tiposDespesasData.find(
          (t) => t.id === despesa.tipoDespesaId
        );
        const categoria =
          categoriasDespesasData.find((c) => c.id === tipoDespesa?.categoriaId)
            ?.nome || "";
        const filial =
          filiaisData.find((f) => f.id === despesa.filialId)?.nome ||
          despesa.filialId;
        const statusNome =
          status.find((s) => s.id === despesa.statusId)?.nome ||
          despesa.statusId;

        return {
          id: despesa.id,
          Data: new Date(despesa.data_despesa).toLocaleDateString("pt-BR"),
          Categoria: categoria,
          Filial: filial,
          Descrição: tipoDespesa?.nome || despesa.descricao || "",
          Valor: formatCurrency(despesa.valor),
          Status: statusNome,
          statusId: despesa.statusId,
          valor: despesa.valor,
          data_despesa: despesa.data_despesa,
          tipoDespesaId: despesa.tipoDespesaId,
        };
      });

      setData(despesasEnriquecidas);
    };

    fetchData();
  }, []);

  useEffect(() => {
    filterData();
  }, [filterData]);

  // Event handlers
  const handleEdit = useCallback(
    (row) => {
      setSelectedRow(row);
      setEditValor(row.valor);
      setEditStatus(statusList.find((s) => s.nome === row.Status)?.id || "");
      setShowEditForm(true);
    },
    [statusList]
  );

  const handleSaveEdit = async () => {
    const despesaOriginal = despesasOriginais.find(
      (d) => d.id === selectedRow.id
    );
    if (!despesaOriginal) return;

    const despesaAtualizada = {
      ...despesaOriginal,
      tipoDespesaId: selectedRow.tipoDespesaId,
      valor: Number(editValor),
      statusId: editStatus,
      data_despesa: selectedRow.data_despesa,
      descricao: selectedRow.Descrição,
    };

    await fetch(`http://localhost:3001/despesas/${selectedRow.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(despesaAtualizada),
    });

    const tipoDespesa = tiposDespesas.find(
      (t) => t.id === selectedRow.tipoDespesaId
    );
    const categoria =
      categoriasDespesas.find((c) => c.id === tipoDespesa?.categoriaId)?.nome ||
      "";

    setData((prev) =>
      prev.map((item) =>
        item.id === selectedRow.id
          ? {
              ...item,
              Valor: formatCurrency(editValor),
              Status: statusMap[editStatus] || editStatus,
              data_despesa: despesaAtualizada.data_despesa,
              Descrição: despesaAtualizada.descricao,
              valor: Number(editValor),
              statusId: editStatus,
              tipoDespesaId: selectedRow.tipoDespesaId,
              Categoria: categoria,
            }
          : item
      )
    );

    setShowEditForm(false);
    setSelectedRow(null);
  };

  const handleDelete = async (row) => {
    if (window.confirm("Tem certeza que deseja excluir esta despesa?")) {
      await fetch(`http://localhost:3001/despesas/${row.id}`, {
        method: "DELETE",
      });
      setData((prev) => prev.filter((item) => item.id !== row.id));
    }
  };

  const handleNewExpenseSubmit = async (e) => {
    e.preventDefault();
    const novoId = getNextId(data);
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
    const tipoDespesa = tiposDespesas.find((t) => t.id === form.tipoDespesaId);
    const categoria =
      categoriasDespesas.find((c) => c.id === tipoDespesa?.categoriaId)?.nome ||
      "";
    const filial = filiais.find((f) => f.id === form.filialId)?.nome || "";
    const status = statusList.find((s) => s.id === form.statusId)?.nome || "";

    const novaDespesaFormatada = {
      id: novoId,
      Data: new Date(despesaSalva.data_despesa).toLocaleDateString("pt-BR"),
      Categoria: categoria,
      Filial: filial,
      Descrição: tipoDespesa?.nome || form.descricao || "",
      Valor: formatCurrency(form.valor),
      Status: status,
      statusId: form.statusId,
      valor: Number(form.valor),
      data_despesa: despesaSalva.data_despesa,
      tipoDespesaId: form.tipoDespesaId,
    };

    setShowNewExpenseModal(false);
    setForm({
      tipoDespesaId: "",
      valor: "",
      filialId: "",
      statusId: "",
      data_despesa: "",
      descricao: "",
    });

    setData((prev) => [...prev, novaDespesaFormatada]);
  };

  // Summary cards data
  const summaryCards = [
    {
      title: "Total Fixas",
      value: formatCurrency(totalFixa),
      icon: <LocateFixed size={24} className="text-blue-500" />,
      color: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      title: "Total Variáveis",
      value: formatCurrency(totalVariavel),
      icon: <TrendingUpDown size={24} className="text-green-500" />,
      color: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      title: "Total Geral",
      value: formatCurrency(totalGeral),
      icon: <BanknoteArrowDown size={24} className="text-purple-500" />,
      color: "bg-purple-50",
      borderColor: "border-purple-200",
    },
  ];

  const renderActions = (row) => (
    <div className="flex justify-center items-center gap-1 sm:gap-3 mx-1 sm:mx-2">
      <button
        className="p-1 sm:p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
        title="Visualizar"
        onClick={() => {
          setViewRow(row);
          setShowViewModal(true);
        }}
      >
        <Eye size={16} className="sm:w-4 sm:h-4" />
      </button>
      <button
        className="p-1 sm:p-1.5 text-[#a243d2] hover:bg-purple-50 rounded-full transition-colors"
        onClick={() => handleEdit(row)}
        title="Editar"
      >
        <PenLine size={16} className="sm:w-4 sm:h-4" />
      </button>
      <button
        className="p-1 sm:p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
        onClick={() => handleDelete(row)}
        title="Excluir"
      >
        <Trash2 size={16} className="sm:w-4 sm:h-4" />
      </button>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-[#f3f8fc] flex flex-col items-center">
      <div className="w-full max-w-6xl flex flex-col items-center">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mb-6 gap-4 sm:gap-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#a243d2] mt-2 sm:mt-6 mb-1">
              Despesas
            </h2>
            <p className="text-sm sm:text-base text-[#a243d2]">
              Lançamento e gerenciamento de despesas fixas e variáveis
            </p>
          </div>
          <Buttons
            className="flex flex-row items-center gap-2 rounded-lg px-4 py-2 border border-[#a243d2] bg-[#a243d2] text-white font-semibold shadow-sm mt-0 sm:mt-6 w-full sm:w-auto justify-center"
            onClick={() => setShowNewExpenseModal(true)}
          >
            <SquarePlus size={16} className="sm:w-5 sm:h-5" />
            <span>Nova Despesa</span>
          </Buttons>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 w-full">
          {summaryCards.map((card, i) => (
            <SummaryCard key={i} {...card} />
          ))}
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between w-full mb-4 gap-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1 text-[#a243d2] text-sm sm:text-base">
              <CalendarDays size={16} />
              <span>Período:</span>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                className="border border-[#a243d2] rounded px-2 py-1 text-[#a243d2] bg-transparent w-full sm:w-auto"
              />
              <span className="hidden sm:inline">até</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                className="border border-[#a243d2] rounded px-2 py-1 text-[#a243d2] bg-transparent w-full sm:w-auto"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end w-full gap-2">
            <div className="flex w-full sm:w-auto gap-2">
              <button
                className="flex items-center gap-2 px-3 py-1 rounded bg-transparent border border-[#a243d2] text-[#a243d2] hover:bg-[#e9e0f7] text-sm sm:text-base"
                onClick={() => setShowFilterModal(!showFilterModal)}
                type="button"
                style={{ minWidth: 40 }}
              >
                <Funnel size={16} />
              </button>
              {showFilterModal && (
                <select
                  className="border border-[#a243d2] rounded px-2 py-1 text-[#a243d2] bg-transparent text-sm sm:text-base"
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
            </div>

            <div className="w-full sm:w-auto">
              <SearchFilterExpenses
                data={data}
                columns={columns}
                setFilteredData={setFilteredData}
                selectedField={selectedField}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-0 w-full border border-[#a243d2] sm:border-2 overflow-x-auto">
          <Table
            data={filteredData}
            columns={columns}
            renderActions={renderActions}
          />
        </div>
      </div>

      {/* Edit Modal */}
      {showEditForm && selectedRow && (
        <ExpenseModal
          title="Editar Despesa"
          onClose={() => {
            setShowEditForm(false);
            setSelectedRow(null);
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveEdit();
            }}
            className="flex flex-col gap-3"
          >
            <div>
              <label className="block text-sm text-[#a243d2] mb-1">Data:</label>
              <input
                type="date"
                value={selectedRow.data_despesa?.slice(0, 10) || ""}
                onChange={(e) =>
                  setSelectedRow({
                    ...selectedRow,
                    data_despesa: e.target.value,
                  })
                }
                className="border border-[#a243d2] p-2 w-full rounded text-sm sm:text-base focus:ring-2 focus:ring-[#a243d2] focus:border-[#a243d2]"
              />
            </div>

            <div>
              <label className="block text-sm text-[#a243d2] mb-1">
                Tipo de Despesa:
              </label>
              <select
                value={selectedRow.tipoDespesaId || ""}
                onChange={(e) => {
                  const tipoId = e.target.value;
                  const tipo = tiposDespesas.find((t) => t.id === tipoId);
                  setSelectedRow({
                    ...selectedRow,
                    tipoDespesaId: tipoId,
                    Descrição: tipo?.nome || selectedRow.Descrição,
                  });
                }}
                className="border border-[#a243d2] p-2 w-full rounded text-sm sm:text-base focus:ring-2 focus:ring-[#a243d2] focus:border-[#a243d2]"
              >
                <option value="">Selecione</option>
                {tiposDespesas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
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
                className="border border-[#a243d2] p-2 w-full rounded text-sm sm:text-base focus:ring-2 focus:ring-[#a243d2] focus:border-[#a243d2]"
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
                  setSelectedRow({ ...selectedRow, Descrição: e.target.value })
                }
                className="border border-[#a243d2] p-2 w-full rounded text-sm sm:text-base focus:ring-2 focus:ring-[#a243d2] focus:border-[#a243d2]"
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
                className="border border-[#a243d2] p-2 w-full rounded text-sm sm:text-base focus:ring-2 focus:ring-[#a243d2] focus:border-[#a243d2]"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-[#a243d2] mb-1">
                Status:
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="border border-[#a243d2] p-2 w-full rounded text-sm sm:text-base focus:ring-2 focus:ring-[#a243d2] focus:border-[#a243d2]"
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

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                className="flex-1 bg-gray-200 text-gray-700 rounded px-4 py-2 font-semibold text-sm sm:text-base hover:bg-gray-300 transition-colors"
                onClick={() => {
                  setShowEditForm(false);
                  setSelectedRow(null);
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#a243d2] text-white rounded px-4 py-2 font-semibold text-sm sm:text-base hover:bg-[#580581] transition-colors"
              >
                Salvar
              </button>
            </div>
          </form>
        </ExpenseModal>
      )}

      {/* New Expense Modal */}
      {showNewExpenseModal && (
        <ExpenseModal
          title="Nova Despesa"
          onClose={() => setShowNewExpenseModal(false)}
        >
          <form
            onSubmit={handleNewExpenseSubmit}
            className="flex flex-col gap-3"
          >
            <select
              name="tipoDespesaId"
              value={form.tipoDespesaId}
              onChange={handleFormChange}
              className="border border-[#a243d2] rounded p-2 text-[#a243d2] text-sm sm:text-base focus:ring-2 focus:ring-[#a243d2] focus:border-[#a243d2]"
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
              className="border border-[#a243d2] rounded p-2 text-[#a243d2] text-sm sm:text-base focus:ring-2 focus:ring-[#a243d2] focus:border-[#a243d2]"
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
              className="border border-[#a243d2] rounded p-2 text-[#a243d2] text-sm sm:text-base focus:ring-2 focus:ring-[#a243d2] focus:border-[#a243d2]"
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
              className="border border-[#a243d2] rounded p-2 text-[#a243d2] text-sm sm:text-base focus:ring-2 focus:ring-[#a243d2] focus:border-[#a243d2]"
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
              className="border border-[#a243d2] rounded p-2 text-[#a243d2] text-sm sm:text-base focus:ring-2 focus:ring-[#a243d2] focus:border-[#a243d2]"
              name="data_despesa"
              type="date"
              value={form.data_despesa}
              onChange={handleFormChange}
            />

            <input
              className="border border-[#a243d2] rounded p-2 text-[#a243d2] text-sm sm:text-base focus:ring-2 focus:ring-[#a243d2] focus:border-[#a243d2]"
              name="descricao"
              placeholder="Descrição"
              value={form.descricao}
              onChange={handleFormChange}
            />

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                className="flex-1 bg-gray-200 text-gray-700 rounded px-4 py-2 font-semibold text-sm sm:text-base hover:bg-gray-300 transition-colors"
                onClick={() => setShowNewExpenseModal(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#a243d2] text-white rounded px-4 py-2 font-semibold text-sm sm:text-base hover:bg-[#580581] transition-colors"
              >
                Salvar
              </button>
            </div>
          </form>
        </ExpenseModal>
      )}

      {/* View Modal */}
      {showViewModal && viewRow && (
        <ExpenseModal
          title="Detalhes da Despesa"
          onClose={() => setShowViewModal(false)}
        >
          <div className="flex flex-col gap-2 text-sm sm:text-base">
            {Object.entries(viewRow)
              .filter(
                ([key]) =>
                  !key.toLowerCase().includes("id") &&
                  key !== "id" &&
                  key !== "valor" &&
                  key !== "data_despesa"
              )
              .map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between py-2 border-b border-gray-200"
                >
                  <span className="font-semibold text-[#a243d2]">{key}:</span>
                  <span className="text-gray-700">
                    {key === "Valor"
                      ? formatCurrency(viewRow.valor)
                      : value}
                  </span>
                </div>
              ))}
          </div>
        </ExpenseModal>
      )}
    </div>
  );
};

export default ExpensesPage;