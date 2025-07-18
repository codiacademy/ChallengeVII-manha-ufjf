import React, { useEffect, useState, useRef } from "react";
import Table from "../components/Table";
import {
  SquarePlus,
  Funnel,
  Eye,
  Trash2,
  PenLine,
  CalendarDays,
} from "lucide-react";
import Buttons from "../components/Buttons";

function getNextId(array) {
  if (!array || array.length === 0) return "1";
  const maxId = Math.max(...array.map((item) => Number(item.id) || 0));
  return String(maxId + 1);
}

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
    <div className="flex flex-row gap-2 items-center w-full mb-2 h-[38px]">
      <input
        type="text"
        placeholder="Buscar..."
        className="border border-[#a243d2] rounded px-2 py-1.5 text-[#a243d2] placeholder-[#a243d2] bg-transparent h-full"
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
      />
      <button
        className="px-3 py-1.5 rounded bg-[#a243d2] text-white font-semibold border border-[#a243d2] hover:bg-[#580581] h-full"
        onClick={handleSearch}
        type="button"
      >
        Buscar
      </button>
      <button
        className="px-3 py-1.5 rounded bg-gray-200 text-[#a243d2] font-semibold border border-[#a243d2] ml-1 hover:bg-gray-300 h-full"
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
  const viewModalRef = useRef();

  const [showEditForm, setShowEditForm] = useState(false);
  const [editValor, setEditValor] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [statusList, setStatusList] = useState([]);
  const [despesasOriginais, setDespesasOriginais] = useState([]);
  const [statusMap, setStatusMap] = useState({});

  const [showNewExpenseModal, setShowNewExpenseModal] = useState(false);
  const [tiposDespesas, setTiposDespesas] = useState([]);
  const [filiais, setFiliais] = useState([]);
  const [categoriasDespesas, setCategoriasDespesas] = useState([]);

  const [filteredData, setFilteredData] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedField, setSelectedField] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewRow, setViewRow] = useState(null);

  const totalFixa = data
    .filter((item) => item.Categoria === "Fixa")
    .reduce((sum, item) => sum + (item.valor || 0), 0);

  const totalVariavel = data
    .filter((item) => item.Categoria === "Variável")
    .reduce((sum, item) => sum + (item.valor || 0), 0);

  const totalGeral = totalFixa + totalVariavel;

  useEffect(() => {
    let result = [...data];

    if (activeCategory) {
      result = result.filter((item) => item.Categoria === activeCategory);
    }

    if (dateRange.start || dateRange.end) {
      result = result.filter((item) => {
        const itemDate = new Date(item.data_despesa);
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        const endDate = dateRange.end ? new Date(dateRange.end) : null;

        if (startDate && itemDate < startDate) return false;
        if (endDate && itemDate > endDate) return false;
        return true;
      });
    }

    setFilteredData(result);
  }, [data, activeCategory, dateRange]);

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

        const despesasEnriquecidas = despesas.map((despesa) => {
          const tipoDespesa = tiposDespesasData.find(
            (t) => t.id === despesa.tipoDespesaId
          );
          const categoria = categoriasDespesasData.find(
            (c) => c.id === tipoDespesa?.categoriaId
          );

          return {
            id: despesa.id,
            Data: new Date(despesa.data_despesa).toLocaleDateString("pt-BR"),
            Categoria: categoria?.nome || "",
            Filial:
              filiaisData.find((f) => f.id === despesa.filialId)?.nome ||
              despesa.filialId,
            Descrição: tipoDespesa?.nome || despesa.descricao || "",
            Valor: `R$ ${Number(despesa.valor).toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}`,
            Status:
              status.find((s) => s.id === despesa.statusId)?.nome ||
              despesa.statusId,
            statusId: despesa.statusId,
            valor: despesa.valor,
            data_despesa: despesa.data_despesa,
            tipoDespesaId: despesa.tipoDespesaId,
          };
        });

        setData(despesasEnriquecidas);
        setColumns([
          "Data",
          "Categoria",
          "Filial",
          "Descrição",
          "Valor",
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

  useEffect(() => {
    if (!showViewModal) return;
    const handleClickOutside = (event) => {
      if (viewModalRef.current && !viewModalRef.current.contains(event.target)) {
        setShowViewModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showViewModal]);

  const handleEdit = () => {
    setEditValor(selectedRow.valor);
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
              Valor: `R$ ${Number(editValor).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}`,
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

  const handleDelete = async () => {
    await fetch(`http://localhost:3001/despesas/${selectedRow.id}`, {
      method: "DELETE",
    });
    setData((prev) => prev.filter((item) => item.id !== selectedRow.id));
    setShowPopover(false);
    setSelectedRow(null);
  };

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
      Valor: `R$ ${Number(form.valor).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })}`,
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

  return (
    <div className="p-0 min-h-screen bg-[#f3f8fc] flex flex-col items-center">
      <div className="w-full max-w-5xl flex flex-col items-center">
        <div className="flex justify-between items-center w-full mb-6">
          <div>
            <h2 className="text-4xl font-bold text-[#a243d2] mt-6 mb-1">
              Despesas
            </h2>
            <p className="text-[#a243d2] text-lg">
              Lançamento e gerenciamento de despesas fixas e variáveis
            </p>
          </div>
          <Buttons
            className="flex flex-row items-center gap-2 rounded-lg px-4 py-2 border border-[#a243d2] bg-[#a243d2] text-white font-semibold shadow-sm mt-6"
            onClick={() => setShowNewExpenseModal(true)}
          >
            <SquarePlus size={18} />
            <span>Nova Despesa</span>
          </Buttons>
        </div>

        <div className="flex gap-4 mb-4 w-full">
          <div className="bg-white p-4 rounded-lg shadow-md flex-1 border-l-4 border-blue-500">
            <h3 className="font-bold text-gray-700">Total Fixas</h3>
            <p className="text-2xl font-bold">
              {totalFixa.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md flex-1 border-l-4 border-green-500">
            <h3 className="font-bold text-gray-700">Total Variáveis</h3>
            <p className="text-2xl font-bold">
              {totalVariavel.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md flex-1 border-l-4 border-purple-500">
            <h3 className="font-bold text-gray-700">Total Geral</h3>
            <p className="text-2xl font-bold">
              {totalGeral.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
        </div>

        <div className="flex flex-row items-center justify-between w-full mb-4 gap-2">
          <div className="flex items-center gap-2 h-[38px]">
            <div className="flex items-center gap-1 text-[#a243d2]">
              <CalendarDays size={18} />
              <span>Período:</span>
            </div>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
              className="border border-[#a243d2] rounded px-2 py-1.5 text-[#a243d2] bg-transparent h-full"
            />
            <span>até</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
              className="border border-[#a243d2] rounded px-2 py-1.5 text-[#a243d2] bg-transparent h-full"
            />
          </div>

          <div className="flex flex-row gap-2 items-center h-[38px]">
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded bg-transparent border border-[#a243d2] text-[#a243d2] hover:bg-[#e9e0f7] h-full"
              onClick={() => setShowFilterModal(!showFilterModal)}
              type="button"
              style={{ minWidth: 40 }}
            >
              <Funnel />
            </button>
            {showFilterModal && (
              <select
                className="border border-[#a243d2] rounded px-2 py-1.5 text-[#a243d2] bg-transparent h-full"
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
              className="flex flex-row gap-2 items-center h-full"
              style={{ minWidth: 320 }}
            >
              <SearchFilterExpenses
                data={data}
                columns={columns}
                setFilteredData={setFilteredData}
                selectedField={selectedField}
              />
            </div>
          </div>
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
                  onClick={() => {
                    setViewRow(row);
                    setShowViewModal(true);
                  }}
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

      {showEditForm && selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent">
          <div
            ref={popoverRef}
            className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg border-2 border-[#a243d2] relative"
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
                      Descrição: tipo ? tipo.nome : selectedRow.Descrição,
                    });
                  }}
                  className="border border-[#a243d2] p-1 w-full rounded"
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

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-200 text-[#a243d2] font-semibold hover:bg-gray-300"
                  onClick={() => {
                    setShowEditForm(false);
                    setSelectedRow(null);
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#a243d2] text-white font-semibold hover:bg-[#580581]"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showNewExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent">
          <div
            ref={modalRef}
            className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg border-2 border-[#a243d2] relative"
          >
            <button
              className="absolute top-4 right-4 text-2xl text-[#a243d2] font-bold"
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
                className="border border-[#a243d2] rounded p-2 text-[#a243d2]"
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
                className="border border-[#a243d2] rounded p-2 text-[#a243d2]"
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
                className="border border-[#a243d2] rounded p-2 text-[#a243d2]"
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
                className="border border-[#a243d2] rounded p-2 text-[#a243d2]"
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
                className="border border-[#a243d2] rounded p-2 text-[#a243d2]"
                name="data_despesa"
                type="date"
                value={form.data_despesa}
                onChange={handleFormChange}
              />

              <input
                className="border border-[#a243d2] rounded p-2 text-[#a243d2]"
                name="descricao"
                placeholder="Descrição"
                value={form.descricao}
                onChange={handleFormChange}
              />

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-200 text-[#a243d2] font-semibold hover:bg-gray-300"
                  onClick={() => setShowNewExpenseModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#a243d2] text-white font-semibold hover:bg-[#580581]"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && viewRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent">
          <div 
            ref={viewModalRef}
            className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg border-2 border-[#a243d2] relative"
          >
            <button
              className="absolute top-4 right-4 text-2xl text-[#a243d2] font-bold"
              onClick={() => setShowViewModal(false)}
            >
              ×
            </button>
            <h3 className="text-2xl font-bold text-[#a243d2] mb-4">
              Detalhes da Despesa
            </h3>
            <div className="flex flex-col gap-2">
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
                        ? `R$ ${Number(viewRow.valor).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}`
                        : value}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;