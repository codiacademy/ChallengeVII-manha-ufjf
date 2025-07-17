import React, { useEffect, useState, useRef } from "react";
import Table from "../components/Table";
import { SquarePlus, Funnel, Eye, Trash2, PenLine } from "lucide-react";
import Buttons from "../components/Buttons";

// Função utilitária para IDs sequenciais
function getNextId(array) {
  if (!array || array.length === 0) return "1";
  const maxId = Math.max(...array.map((item) => Number(item.id) || 0));
  return String(maxId + 1);
}

// Componente de busca/filtro para vendas
function SearchFilterSales({ data, columns, setFilteredData, selectedField }) {
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

const SalesPage = () => {
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
  const [vendasOriginais, setVendasOriginais] = useState([]);
  const [statusMap, setStatusMap] = useState({});

  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [modalidades, setModalidades] = useState([]);
  const [filiais, setFiliais] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [tiposPagamento, setTiposPagamento] = useState([]);

  // Filtro
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedField, setSelectedField] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  // Modal Nova Venda fecha ao clicar fora
  useEffect(() => {
    if (!showNewSaleModal) return;
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowNewSaleModal(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNewSaleModal]);

  // Modal Editar fecha ao clicar fora
  useEffect(() => {
    if (!showEditForm) return;
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setShowEditForm(false);
        setSelectedRow(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEditForm]);

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
            cursosData.find((c) => c.id === venda.cursoId)?.nome ||
            venda.cursoId,
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
            tiposPagamentoData.find((t) => t.id === venda.tipoPagamentoId)
              ?.nome || venda.tipoPagamentoId,
          Status:
            status.find((s) => s.id === venda.statusId)?.nome || venda.statusId,
          statusId: venda.statusId,
          valorTotal: venda.valorTotal,
          data_venda: venda.data_venda,
          clienteId: venda.clienteId,
          cursoId: venda.cursoId,
          modalidadeId: venda.modalidadeId,
          filialId: venda.filialId,
          vendedorId: venda.vendedorId,
          tipoPagamentoId: venda.tipoPagamentoId,
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
        setFilteredData(vendasEnriquecidas);
      }
    );
  }, []);

  // Formulário de Nova Venda
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
      id: getNextId(data),
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

    // Atualiza tabela
    setData((prev) => [
      ...prev,
      {
        ...novaVenda,
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
          tiposPagamento.find((t) => t.id === novaVenda.tipoPagamentoId)
            ?.nome || "",
        Status: statusList.find((s) => s.id === novaVenda.statusId)?.nome || "",
        statusId: novaVenda.statusId,
        valorTotal: novaVenda.valorTotal,
        data_venda: novaVenda.data_venda,
        clienteId: novaVenda.clienteId,
        cursoId: novaVenda.cursoId,
        modalidadeId: novaVenda.modalidadeId,
        filialId: novaVenda.filialId,
        vendedorId: novaVenda.vendedorId,
        tipoPagamentoId: novaVenda.tipoPagamentoId,
      },
    ]);
    setFilteredData((prev) => [
      ...prev,
      {
        ...novaVenda,
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
          tiposPagamento.find((t) => t.id === novaVenda.tipoPagamentoId)
            ?.nome || "",
        Status: statusList.find((s) => s.id === novaVenda.statusId)?.nome || "",
        statusId: novaVenda.statusId,
        valorTotal: novaVenda.valorTotal,
        data_venda: novaVenda.data_venda,
        clienteId: novaVenda.clienteId,
        cursoId: novaVenda.cursoId,
        modalidadeId: novaVenda.modalidadeId,
        filialId: novaVenda.filialId,
        vendedorId: novaVenda.vendedorId,
        tipoPagamentoId: novaVenda.tipoPagamentoId,
      },
    ]);
  };

  // Editar venda
  const handleEdit = (row) => {
    setSelectedRow(row);
    setEditValor(row.valorTotal);
    setEditStatus(row.statusId);
    setShowEditForm(true);
  };

  const handleSaveEdit = async () => {
    const vendaOriginal = vendasOriginais.find((v) => v.id === selectedRow.id);
    if (!vendaOriginal) return;

    const vendaAtualizada = {
      ...vendaOriginal,
      valorTotal: Number(editValor),
      statusId: editStatus,
      modalidadeId: selectedRow.modalidadeId,
      tipoPagamentoId: selectedRow.tipoPagamentoId,
      vendedorId: selectedRow.vendedorId,
      filialId: selectedRow.filialId,
      clienteId: selectedRow.clienteId,
      cursoId: selectedRow.cursoId,
      data_venda: selectedRow.data_venda,
    };

    await fetch(`http://localhost:3001/vendas/${selectedRow.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vendaAtualizada),
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
              Modalidade:
                modalidades.find((m) => m.id === selectedRow.modalidadeId)
                  ?.tipo || selectedRow.modalidadeId,
              Pagamento:
                tiposPagamento.find((t) => t.id === selectedRow.tipoPagamentoId)
                  ?.nome || selectedRow.tipoPagamentoId,
              Vendedor:
                vendedores.find((v) => v.id === selectedRow.vendedorId)?.nome ||
                selectedRow.vendedorId,
              Filial:
                filiais.find((f) => f.id === selectedRow.filialId)?.nome ||
                selectedRow.filialId,
              Cliente:
                clientes.find((c) => c.id === selectedRow.clienteId)?.nome ||
                selectedRow.clienteId,
              Curso:
                cursos.find((c) => c.id === selectedRow.cursoId)?.nome ||
                selectedRow.cursoId,
              statusId: editStatus,
              valorTotal: Number(editValor),
              modalidadeId: selectedRow.modalidadeId,
              tipoPagamentoId: selectedRow.tipoPagamentoId,
              vendedorId: selectedRow.vendedorId,
              filialId: selectedRow.filialId,
              clienteId: selectedRow.clienteId,
              cursoId: selectedRow.cursoId,
              data_venda: selectedRow.data_venda,
            }
          : item
      )
    );
    setShowEditForm(false);
    setSelectedRow(null);
  };

  // Excluir venda
  const handleDelete = async (row) => {
    if (!window.confirm("Tem certeza que deseja excluir esta venda?")) return;
    await fetch(`http://localhost:3001/vendas/${row.id}`, {
      method: "DELETE",
    });
    setData((prev) => prev.filter((item) => item.id !== row.id));
    setFilteredData((prev) => prev.filter((item) => item.id !== row.id));
  };

  // Novo estado para modal de visualização
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewRow, setViewRow] = useState(null);

  return (
    <div className="p-0 min-h-screen bg-[#f3f8fc] flex flex-col items-center">
      <div className="w-full max-w-6xl flex flex-col items-center">
        <h2 className="text-4xl font-bold text-[#a243d2] mt-6 mb-1 w-full text-left">
          Vendas
        </h2>
        <p className="text-[#a243d2] text-lg mb-6 w-full text-left">
          Lançamento e gerenciamento de vendas de cursos
        </p>
        <div className="flex flex-row items-center justify-end w-full mb-4 gap-2">
          <button
            className="flex items-center gap-2 px-3 py-1 rounded bg-transparent border border-[#a243d2] text-[#a243d2] hover:bg-[#e9e0f7]"
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
            <SearchFilterSales
              data={data}
              columns={columns}
              setFilteredData={setFilteredData}
              selectedField={selectedField}
            />
          </div>
          <Buttons
            className="flex flex-row items-center gap-2 rounded-lg px-4 py-2 border border-[#a243d2] bg-[#a243d2] text-white font-semibold shadow-sm ml-4"
            onClick={() => setShowNewSaleModal(true)}
            style={{ marginLeft: "auto" }}
          >
            <SquarePlus size={18} />
            <span>Nova Venda</span>
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
                  onClick={() => {
                    setViewRow(row);
                    setShowViewModal(true);
                  }}
                >
                  <Eye size={18} />
                </button>
                <button
                  className="p-1.5 text-[#a243d2] hover:bg-purple-50 rounded-full transition-colors"
                  title="Editar"
                  onClick={() => handleEdit(row)}
                >
                  <PenLine size={18} />
                </button>
                <button
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Excluir"
                  onClick={() => handleDelete(row)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          />
        </div>
      </div>
      {/* Modal Editar Venda */}
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
                    selectedRow.data_venda
                      ? selectedRow.data_venda.slice(0, 10)
                      : ""
                  }
                  onChange={(e) =>
                    setSelectedRow({
                      ...selectedRow,
                      data_venda: e.target.value,
                    })
                  }
                  className="border border-[#a243d2] p-1 w-full rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-[#a243d2] mb-1">
                  Cliente:
                </label>
                <select
                  value={selectedRow.clienteId || ""}
                  onChange={(e) =>
                    setSelectedRow({
                      ...selectedRow,
                      clienteId: e.target.value,
                    })
                  }
                  className="border border-[#a243d2] p-1 w-full rounded"
                >
                  <option value="">Selecione</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#a243d2] mb-1">
                  Curso:
                </label>
                <select
                  value={selectedRow.cursoId || ""}
                  onChange={(e) =>
                    setSelectedRow({ ...selectedRow, cursoId: e.target.value })
                  }
                  className="border border-[#a243d2] p-1 w-full rounded"
                >
                  <option value="">Selecione</option>
                  {cursos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#a243d2] mb-1">
                  Modalidade:
                </label>
                <select
                  value={selectedRow.modalidadeId || ""}
                  onChange={(e) =>
                    setSelectedRow({
                      ...selectedRow,
                      modalidadeId: e.target.value,
                    })
                  }
                  className="border border-[#a243d2] p-1 w-full rounded"
                >
                  <option value="">Selecione</option>
                  {modalidades.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.tipo}
                    </option>
                  ))}
                </select>
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
                  Filial:
                </label>
                <select
                  value={selectedRow.filialId || ""}
                  onChange={(e) =>
                    setSelectedRow({ ...selectedRow, filialId: e.target.value })
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
                  Vendedor:
                </label>
                <select
                  value={selectedRow.vendedorId || ""}
                  onChange={(e) =>
                    setSelectedRow({
                      ...selectedRow,
                      vendedorId: e.target.value,
                    })
                  }
                  className="border border-[#a243d2] p-1 w-full rounded"
                >
                  <option value="">Selecione</option>
                  {vendedores.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#a243d2] mb-1">
                  Pagamento:
                </label>
                <select
                  value={selectedRow.tipoPagamentoId || ""}
                  onChange={(e) =>
                    setSelectedRow({
                      ...selectedRow,
                      tipoPagamentoId: e.target.value,
                    })
                  }
                  className="border border-[#a243d2] p-1 w-full rounded"
                >
                  <option value="">Selecione</option>
                  {tiposPagamento.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome}
                    </option>
                  ))}
                </select>
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
            <h3 className="text-2xl font-bold text-[#a243d2] mb-4">
              Nova Venda
            </h3>
            <form
              onSubmit={handleNewSaleSubmit}
              className="flex flex-col gap-4"
            >
              <input
                className="border rounded p-2"
                name="data_venda"
                type="date"
                value={form.data_venda}
                onChange={handleFormChange}
                required
              />
              <select
                name="clienteId"
                value={form.clienteId}
                onChange={handleFormChange}
                className="border rounded p-2"
                required
              >
                <option value="">Selecione o Cliente</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
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
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
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
                  <option key={m.id} value={m.id}>
                    {m.tipo}
                  </option>
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
                  <option key={f.id} value={f.id}>
                    {f.nome}
                  </option>
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
                  <option key={v.id} value={v.id}>
                    {v.nome}
                  </option>
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
                  <option key={t.id} value={t.id}>
                    {t.nome}
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
      {/* Modal Visualizar Venda */}
      {showViewModal && viewRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg border-2 border-[#a243d2] relative">
            <button
              className="absolute top-2 right-4 text-2xl text-[#a243d2] font-bold"
              onClick={() => setShowViewModal(false)}
            >
              ×
            </button>
            <h3 className="text-2xl font-bold text-[#a243d2] mb-4">
              Detalhes da Venda
            </h3>
            <div className="flex flex-col gap-2">
              {Object.entries(viewRow)
                .filter(
                  ([key]) => !key.toLowerCase().includes("id") && key !== "id"
                ) // Filtra apenas campos de ID
                .map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between py-1 border-b border-gray-100"
                  >
                    <span className="font-semibold text-[#a243d2]">{key}:</span>
                    <span className="text-gray-700">{String(value)}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesPage;
