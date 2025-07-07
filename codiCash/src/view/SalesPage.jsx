import React, { useEffect, useState, useRef } from "react";
import Table from "../components/Table";
import { SquarePlus } from "lucide-react";
import Buttons from "../components/Buttons";

const SalesPage = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [showPopover, setShowPopover] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const [selectedRow, setSelectedRow] = useState(null);
  const popoverRef = useRef();
  const modalRef = useRef(); // Adicione este ref

  // Para edição
  const [showEditForm, setShowEditForm] = useState(false);
  const [editValor, setEditValor] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [statusList, setStatusList] = useState([]);
  const [vendasOriginais, setVendasOriginais] = useState([]);
  const [statusMap, setStatusMap] = useState({});

  // Para modal de nova venda
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [modalidades, setModalidades] = useState([]);
  const [filiais, setFiliais] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [tiposPagamento, setTiposPagamento] = useState([]);

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
        clientesData,
        cursosData,
        vendedoresData,
        tiposPagamentoData,
        status,
        filiaisData,
        modalidadesData,
      ]) => {
        setVendasOriginais(vendas);
        setClientes(clientesData);
        setCursos(cursosData);
        setModalidades(modalidadesData);
        setFiliais(filiaisData);
        setVendedores(vendedoresData);
        setTiposPagamento(tiposPagamentoData);

        const vendasEnriquecidas = vendas.map((venda) => ({
          id: venda.id,
          Data: new Date(venda.data_venda).toLocaleDateString("pt-BR"),
          Cliente:
            clientesData.find((c) => c.id === venda.clienteId)?.nome ||
            venda.clienteId,
          Curso:
            cursosData.find((c) => c.id === venda.cursoId)?.nome || venda.cursoId,
          Modalidade:
            modalidadesData.find((m) => m.id === venda.modalidadeId)?.tipo ||
            venda.modalidadeId,
          Valor: `R$ ${Number(venda.valorTotal).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}`,
          Filial:
            filiaisData.find((f) => f.id === venda.filialId)?.nome ||
            venda.filialId,
          Vendedor:
            vendedoresData.find((v) => v.id === venda.vendedorId)?.nome ||
            venda.vendedorId,
          Pagamento:
            tiposPagamentoData.find((t) => t.id === venda.tipoPagamentoId)?.nome ||
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
    await fetch(`http://localhost:3001/vendas/${selectedRow.id}`, {
      method: "DELETE",
    });
    setData((prev) => prev.filter((item) => item.id !== selectedRow.id));
    setShowPopover(false);
    setSelectedRow(null);
  };

  // --- Modal Nova Venda ---
  const [form, setForm] = useState({
    clienteId: "",
    cursoId: "",
    modalidadeId: "",
    valorTotal: "",
    filialId: "",
    vendedorId: "",
    tipoPagamentoId: "",
    statusId: "",
    data_venda: "",
  });

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNewSaleSubmit = async (e) => {
    e.preventDefault();
    const novaVenda = {
      ...form,
      valorTotal: Number(form.valorTotal),
      data_venda: form.data_venda || new Date().toISOString(),
    };
    await fetch("http://localhost:3001/vendas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novaVenda),
    });
    setShowNewSaleModal(false);
    setForm({
      clienteId: "",
      cursoId: "",
      modalidadeId: "",
      valorTotal: "",
      filialId: "",
      vendedorId: "",
      tipoPagamentoId: "",
      statusId: "",
      data_venda: "",
    });
    // Atualiza a lista
    // (Ideal: refaça o fetch, mas aqui só para exemplo)
    setData((prev) => [
      ...prev,
      {
        ...novaVenda,
        id: Math.random().toString(36).substr(2, 9),
        Data: new Date(novaVenda.data_venda).toLocaleDateString("pt-BR"),
        Cliente: clientes.find((c) => c.id === novaVenda.clienteId)?.nome || "",
        Curso: cursos.find((c) => c.id === novaVenda.cursoId)?.nome || "",
        Modalidade:
          modalidades.find((m) => m.id === novaVenda.modalidadeId)?.tipo || "",
        Valor: `R$ ${Number(novaVenda.valorTotal).toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
        })}`,
        Filial: filiais.find((f) => f.id === novaVenda.filialId)?.nome || "",
        Vendedor:
          vendedores.find((v) => v.id === novaVenda.vendedorId)?.nome || "",
        Pagamento:
          tiposPagamento.find((t) => t.id === novaVenda.tipoPagamentoId)?.nome ||
          "",
        Status:
          statusList.find((s) => s.id === novaVenda.statusId)?.nome || "",
      },
    ]);
  };

  useEffect(() => {
    if (!showNewSaleModal) return;
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowNewSaleModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNewSaleModal]);

  return (
    <div className="p-0 min-h-screen bg-[#f3f8fc] flex flex-col items-center">
      <div className="w-full max-w-6xl flex flex-col items-center">
        <h2 className="text-4xl font-bold text-[#a243d2] mt-6 mb-1 w-full text-left">
          Vendas
        </h2>
        <p className="text-[#a243d2] text-lg mb-6 w-full text-left">
          Lançamento e gerenciamento de vendas de cursos
        </p>
        <div className="flex flex-row justify-between w-full mb-4">
          <div />
          <Buttons
            className="flex flex-row items-center gap-2 rounded-lg px-4 py-2 border border-[#a243d2] bg-[#a243d2] text-white font-semibold shadow-sm"
            onClick={() => setShowNewSaleModal(true)}
          >
            <SquarePlus size={18} />
            <span>Nova Venda</span>
          </Buttons>
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
      {/* Modal Nova Venda */}
      {showNewSaleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent">
          <div
            ref={modalRef}
            className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg border-2 border-[#a243d2] relative"
          >
            <button
              className="absolute top-2 right-4 text-2xl text-[#a243d2] font-bold"
              onClick={() => setShowNewSaleModal(false)}
            >
              ×
            </button>
            <h3 className="text-2xl font-bold text-[#a243d2] mb-4">Nova Venda</h3>
            <form onSubmit={handleNewSaleSubmit} className="flex flex-col gap-4">
              <select
                name="clienteId"
                value={form.clienteId}
                onChange={handleFormChange}
                className="border rounded p-2"
                required
              >
                <option value="">Selecione o Cliente</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
              <select
                name="cursoId"
                value={form.cursoId}
                onChange={handleFormChange}
                className="border rounded p-2"
                required
              >
                <option value="">Selecione o Curso</option>
                {cursos.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
              <select
                name="modalidadeId"
                value={form.modalidadeId}
                onChange={handleFormChange}
                className="border rounded p-2"
                required
              >
                <option value="">Selecione a Modalidade</option>
                {modalidades.map((m) => (
                  <option key={m.id} value={m.id}>{m.tipo}</option>
                ))}
              </select>
              <input
                className="border rounded p-2"
                name="valorTotal"
                placeholder="Valor"
                type="number"
                value={form.valorTotal}
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
                  <option key={f.id} value={f.id}>{f.nome}</option>
                ))}
              </select>
              <select
                name="vendedorId"
                value={form.vendedorId}
                onChange={handleFormChange}
                className="border rounded p-2"
                required
              >
                <option value="">Selecione o Vendedor</option>
                {vendedores.map((v) => (
                  <option key={v.id} value={v.id}>{v.nome}</option>
                ))}
              </select>
              <select
                name="tipoPagamentoId"
                value={form.tipoPagamentoId}
                onChange={handleFormChange}
                className="border rounded p-2"
                required
              >
                <option value="">Selecione o Pagamento</option>
                {tiposPagamento.map((t) => (
                  <option key={t.id} value={t.id}>{t.nome}</option>
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
                  <option key={s.id} value={s.id}>{s.nome}</option>
                ))}
              </select>
              <input
                className="border rounded p-2"
                name="data_venda"
                type="date"
                value={form.data_venda}
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

export default SalesPage;