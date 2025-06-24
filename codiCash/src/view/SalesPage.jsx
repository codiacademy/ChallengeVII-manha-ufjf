import React, { useEffect, useState, useRef } from "react";
import Table from "../components/Table";
import { useNavigate } from "react-router-dom";

const SalesPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [showPopover, setShowPopover] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const [selectedRow, setSelectedRow] = useState(null);
  const popoverRef = useRef();

  // Para edição
  const [showEditForm, setShowEditForm] = useState(false);
  const [editValor, setEditValor] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [statusList, setStatusList] = useState([]);
  const [vendasOriginais, setVendasOriginais] = useState([]);
  const [statusMap, setStatusMap] = useState({});

  // Dados auxiliares para edição
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
      fetch("http://localhost:3001/vendas").then((res) => res.json()),
      fetch("http://localhost:3001/clientes").then((res) => res.json()),
      fetch("http://localhost:3001/cursos").then((res) => res.json()),
      fetch("http://localhost:3001/vendedores").then((res) => res.json()),
      fetch("http://localhost:3001/tiposPagamento").then((res) => res.json()),
      fetch("http://localhost:3001/status").then((res) => res.json()),
      fetch("http://localhost:3001/filiais").then((res) => res.json()),
      fetch("http://localhost:3001/modalidades").then((res) => res.json()),
    ]).then(
      ([
        vendas,
        clientes,
        cursos,
        vendedores,
        tiposPagamento,
        status,
        filiais,
        modalidades,
      ]) => {
        setVendasOriginais(vendas); // Para saber o id real ao editar

        const vendasEnriquecidas = vendas.map((venda) => ({
          id: venda.id,
          Data: new Date(venda.data_venda).toLocaleDateString("pt-BR"),
          Cliente:
            clientes.find((c) => c.id === venda.clienteId)?.nome ||
            venda.clienteId,
          Curso:
            cursos.find((c) => c.id === venda.cursoId)?.nome || venda.cursoId,
          Modalidade:
            modalidades.find((m) => m.id === venda.modalidadeId)?.tipo ||
            venda.modalidadeId,
          Valor: venda.valorTotal,
          Filial:
            filiais.find((f) => f.id === venda.filialId)?.nome ||
            venda.filialId,
          Vendedor:
            vendedores.find((v) => v.id === venda.vendedorId)?.nome ||
            venda.vendedorId,
          "Tipo de Pagamento":
            tiposPagamento.find((t) => t.id === venda.tipoPagamentoId)?.nome ||
            venda.tipoPagamentoId,
          Status:
            status.find((s) => s.id === venda.statusId)?.nome || venda.statusId,
          statusId: venda.statusId,
          valorTotal: venda.valorTotal,
          data_venda: venda.data_venda,
        }));

        setData(vendasEnriquecidas);
        setColumns([
          "Data",
          "Cliente",
          "Curso",
          "Modalidade",
          "Valor",
          "Filial",
          "Vendedor",
          "Tipo de Pagamento",
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
    // Busca o id real da venda
    const vendaOriginal = vendasOriginais.find((v) => v.id === selectedRow.id);
    if (!vendaOriginal) return;

    await fetch(`http://localhost:3001/vendas/${selectedRow.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...vendaOriginal,
        valorTotal: Number(editValor),
        statusId: editStatus,
      }),
    });

    setData((prev) =>
      prev.map((item) =>
        item.id === selectedRow.id
          ? {
              ...item,
              Valor: editValor,
              Status: statusMap[editStatus] || editStatus,
            }
          : item
      )
    );
    setShowEditForm(false);
    setSelectedRow(null);
  };

  const handleDelete = async () => {
    await fetch(`http://localhost:3001/vendas/${selectedRow.id}`, {
      method: "DELETE",
    });
    setData((prev) => prev.filter((item) => item.id !== selectedRow.id));
    setShowPopover(false);
    setSelectedRow(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50 flex flex-col items-center">
      <div className="w-full max-w-6xl flex flex-col items-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 w-full text-left">
          Vendas
        </h2>
        <button
          className="mb-6 bg-purple-600 text-white font-bold py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 self-end"
          onClick={() => navigate("/newSale")}
        >
          Nova Venda
        </button>
        <div className="bg-white rounded-xl shadow p-6 w-full">
          <Table
            data={data}
            columns={columns}
            renderActions={(row) => (
              <button
                className="text-xl px-2"
                onClick={(e) => handleOpenPopover(row, e)}
                title="Ações"
              >
                &#8942;
              </button>
            )}
          />
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
            className="block w-full text-left mb-2 text-blue-600"
            onClick={handleEdit}
          >
            Editar
          </button>
          <button
            className="block w-full text-left text-red-600"
            onClick={handleDelete}
          >
            Excluir
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
              className="border p-1 w-full"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm">Status:</label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              className="border p-1 w-full"
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

export default SalesPage;