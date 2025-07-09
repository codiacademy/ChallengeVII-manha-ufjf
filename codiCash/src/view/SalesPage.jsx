import React, { useEffect, useState, useRef } from "react";
import Table from "../components/Table";
import { SquarePlus } from "lucide-react";
import Buttons from "../components/Buttons";

function getNextId(array) {
  if (!array || array.length === 0) return "1";
  const maxId = Math.max(...array.map((item) => Number(item.id) || 0));
  return String(maxId + 1);
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

  // ...existing code for editing and deleting sales...

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
    const novoId = getNextId(data);
    const novaVenda = {
      ...form,
      id: novoId,
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
    setData((prev) => [...prev, novaVenda]);
  };

  // ...existing code for modals and rendering...
  return (
    <div className="p-0 min-h-screen bg-[#f3f8fc] flex flex-col items-center">
      <div className="w-full max-w-6xl flex flex-col items-center">
        <h2 className="text-4xl font-bold text-[#a243d2] mt-6 mb-1 w-full text-left">
          Vendas
        </h2>
        <p className="text-[#a243d2] text-lg mb-6 w-full text-left">
          Lançamento e gerenciamento de vendas de cursos
        </p>
        <div className="flex flex-row justify-end w-full mb-4">
          <Buttons
            className="flex flex-row items-center gap-2 rounded-lg px-4 py-2 border border-[#a243d2] bg-[#a243d2] text-white font-semibold shadow-sm ml-4"
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
      {/* ...existing code for popover, edit form, and modals... */}
    </div>
  );
};

export default SalesPage;