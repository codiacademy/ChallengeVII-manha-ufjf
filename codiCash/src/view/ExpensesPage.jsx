import React, { useEffect, useState, useRef } from "react";
import Table from "../components/Table";

const ExpensesPage = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [showPopover, setShowPopover] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const [selectedRow, setSelectedRow] = useState(null);
  const popoverRef = useRef();

  const [showEditForm, setShowEditForm] = useState(false);
  const [editValor, setEditValor] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [statusList, setStatusList] = useState([]);
  const [despesasOriginais, setDespesasOriginais] = useState([]);
  const [statusMap, setStatusMap] = useState({});

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
      fetch("http://localhost:3001/categoriasDespesas").then((res) => res.json()),
    ]).then(
      ([
        despesas,
        tiposDespesas,
        status,
        filiais,
        categoriasDespesas,
      ]) => {
        setDespesasOriginais(despesas);

        const despesasEnriquecidas = despesas.map((despesa) => ({
          id: despesa.id,
          Data: new Date(despesa.data_despesa).toLocaleDateString("pt-BR"),
          Categoria:
            categoriasDespesas.find((c) => c.id === tiposDespesas.find((t) => t.id === despesa.tipoDespesaId)?.categoriaId)?.nome ||
            "",
          Filial:
            filiais.find((f) => f.id === despesa.filialId)?.nome ||
            despesa.filialId,
          Descrição:
            tiposDespesas.find((t) => t.id === despesa.tipoDespesaId)?.descricao ||
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
    setEditValor(selectedRow.Valor);
    setEditStatus(
      statusList.find((s) => s.nome === selectedRow.Status)?.id || ""
    );
    setShowEditForm(true);
    setShowPopover(false);
  };

  const handleSaveEdit = async () => {
    const despesaOriginal = despesasOriginais.find((d) => d.id === selectedRow.id);
    if (!despesaOriginal) return;

    await fetch(`http://localhost:3001/despesas/${selectedRow.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...despesaOriginal,
        valor: Number(editValor),
        statusId: editStatus,
      }),
    });

    setData((prev) =>
      prev.map((item) =>
        item.id === selectedRow.id
          ? {
              ...item,
              Valor: `R$ ${Number(editValor).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}`,
              Status: statusMap[editStatus] || editStatus,
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

  return (
    <div className="p-0 min-h-screen bg-[#f3f8fc] flex flex-col items-center">
      <div className="w-full max-w-5xl flex flex-col items-center">
        <h2 className="text-4xl font-bold text-[#a243d2] mt-6 mb-1 w-full text-left">
          Despesas
        </h2>
        <p className="text-[#a243d2] text-lg mb-6 w-full text-left">
          Lançamento e gerenciamento de despesas fixas e variáveis
        </p>
        <div className="flex flex-row gap-2 mb-4 w-full">
          <button className="px-4 py-2 rounded-full bg-[#e9e0f7] text-[#a243d2] font-semibold border border-[#a243d2] shadow-sm">
            Despesas fixas
          </button>
          <button className="px-4 py-2 rounded-full bg-[#e9e0f7] text-[#a243d2] font-semibold border border-[#a243d2] shadow-sm opacity-60">
            Despesas Variáveis
          </button>
          <div className="flex-1" />
          <button
            className="flex flex-row items-center gap-2 rounded-full px-4 py-2 text-[#a243d2] border border-[#a243d2] bg-white hover:bg-[#a243d2] hover:text-white transition-colors font-semibold shadow-sm"
            // onClick para nova despesa
          >
            <span className="text-lg">➕</span>
            <span>Nova Despesa</span>
          </button>
        </div>
        <div className="flex flex-row justify-end w-full mb-2">
          <input
            className="border border-[#a243d2] rounded px-2 py-1 text-[#a243d2] placeholder-[#a243d2] bg-transparent"
            placeholder="Buscar"
          />
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-0 w-full border-2 border-[#a243d2]">
          <Table
            data={data}
            columns={columns}
            renderActions={(row) => (
              <button
                className="text-xl px-2 rounded hover:bg-[#f3f8fc]"
                onClick={(e) => handleOpenPopover(row, e)}
                title="Ações"
              >
                &#8942;
              </button>
            )}
          />
        </div>
        <div className="w-full flex justify-end mt-2">
          <span className="text-[#a243d2] text-sm cursor-pointer hover:underline">
            Mostrar mais
          </span>
        </div>
      </div>
      {showPopover && selectedRow && (
        <div
          ref={popoverRef}
          style={{
            position: "absolute",
            top: popoverPos.top,
            left: popoverPos.left,
            zIndex: 1000,
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            minWidth: "150px",
            padding: "8px",
          }}
        >
          <button
            className="flex items-center gap-2 w-full text-left mb-2 text-[#a243d2] hover:bg-[#f3f8fc] px-2 py-1 rounded"
          >
            <span role="img" aria-label="Visualizar">👁️</span> Visualizar
          </button>
          <button
            className="flex items-center gap-2 w-full text-left mb-2 text-[#a243d2] hover:bg-[#f3f8fc] px-2 py-1 rounded"
            onClick={handleEdit}
          >
            <span role="img" aria-label="Editar">✏️</span> Editar
          </button>
          <button
            className="flex items-center gap-2 w-full text-left text-red-600 hover:bg-red-50 px-2 py-1 rounded"
            onClick={handleDelete}
          >
            <span role="img" aria-label="Excluir">🗑️</span> Excluir
          </button>
        </div>
      )}
      {showEditForm && selectedRow && (
        <div
          ref={popoverRef}
          style={{
            position: "absolute",
            top: popoverPos.top,
            left: popoverPos.left,
            zIndex: 1000,
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            minWidth: "220px",
            padding: "12px",
          }}
        >
          <div className="mb-2">
            <label className="block text-sm">Valor:</label>
            <input
              type="number"
              value={editValor}
              onChange={(e) => setEditValor(e.target.value)}
              className="border p-1 w-full rounded"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm">Status:</label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              className="border p-1 w-full rounded"
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
            className="block w-full text-left text-green-600 mb-2"
            onClick={handleSaveEdit}
          >
            Salvar
          </button>
          <button
            className="block w-full text-left text-gray-600"
            onClick={() => {
              setShowEditForm(false);
              setSelectedRow(null);
            }}
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;