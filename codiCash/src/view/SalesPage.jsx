import React, { useEffect, useState, useRef, useCallback } from "react";
import Table from "../components/Table";
import {
  SquarePlus,
  Funnel,
  Eye,
  Trash2,
  PenLine,
  TrendingUp,
  DollarSign,
  TrendingDown,
} from "lucide-react";
import Buttons from "../components/Buttons";
import SummaryCard from "../components/SummaryCard";

const getNextId = (array) =>
  array?.length
    ? String(Math.max(...array.map((item) => Number(item.id) || 0)) + 1)
    : "1";

const SearchFilterSales = ({
  data,
  columns,
  setFilteredData,
  selectedField,
}) => {
  const [localSearch, setLocalSearch] = useState("");

  const handleSearch = () => {
    if (!localSearch.trim()) return setFilteredData(data);

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
  };

  const handleClearSearch = () => {
    setLocalSearch("");
    setFilteredData(data);
  };

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
        >
          Buscar
        </button>
        <button
          className="px-3 py-1 rounded bg-gray-200 text-[#a243d2] font-semibold border border-[#a243d2] hover:bg-gray-300 w-full sm:w-auto"
          onClick={handleClearSearch}
        >
          Limpar
        </button>
      </div>
    </div>
  );
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

const calculateDetailedValues = (venda, cursos) => {
  const cursoSelecionado = cursos.find((c) => c.id === venda.cursoId);
  const baseValue = cursoSelecionado?.preco || venda.valorTotal;
  const discount = Number(venda.desconto) || 0;
  const commission = Number(venda.comissao) || 0;
  const valorLiquido = baseValue - discount;
  const taxes = valorLiquido * 0.08;
  const cardFee = venda.tipoPagamentoId === "1" ? valorLiquido * 0.03 : 0;
  const total = valorLiquido - taxes - cardFee - commission;

  return {
    baseValue,
    discount,
    commission,
    taxes,
    cardFee,
    total: Math.max(0, total),
  };
};

const SalesPage = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [viewRow, setViewRow] = useState(null);
  const [statusList, setStatusList] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [vendasOriginais, setVendasOriginais] = useState([]);

  const [form, setForm] = useState({
    clienteId: "",
    cursoId: "",
    filialId: "",
    vendedorId: "",
    tipoPagamentoId: "",
    statusId: "",
    data_venda: "",
    desconto: 0,
    comissao: 0,
  });

  const [clientes, setClientes] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [modalidades, setModalidades] = useState([]);
  const [filiais, setFiliais] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [tiposPagamento, setTiposPagamento] = useState([]);

  const [showPopover, setShowPopover] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedField, setSelectedField] = useState("");

  const popoverRef = useRef();
  const modalRef = useRef();

  const totalVendas = data.reduce(
    (sum, item) => sum + (item.valorTotal || 0),
    0
  );
  const totalComissoes = data.reduce(
    (sum, item) => sum + (item.comissao || 0),
    0
  );
  const totalDescontos = data.reduce(
    (sum, item) => sum + (item.desconto || 0),
    0
  );

  const summaryCards = [
    {
      title: "Total em Vendas",
      value: formatCurrency(totalVendas),
      icon: <TrendingUp size={24} className="text-green-500" />,
      color: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      title: "Total em Comissões",
      value: formatCurrency(totalComissoes),
      icon: <DollarSign size={24} className="text-blue-500" />,
      color: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      title: "Total em Descontos",
      value: formatCurrency(totalDescontos),
      icon: <TrendingDown size={24} className="text-red-500" />,
      color: "bg-red-50",
      borderColor: "border-red-200",
    },
  ];

  const calcularValorTotal = useCallback(
    (cursoPreco, desconto, comissao, tipoPagamentoId) => {
      const preco = Number(cursoPreco) || 0;
      const desc = Number(desconto) || 0;
      const com = Number(comissao) || 0;
      const valorLiquido = preco - desc;
      const impostos = valorLiquido * 0.08;
      const taxaCartao = tipoPagamentoId === "1" ? valorLiquido * 0.03 : 0;
      return Math.max(0, valorLiquido - impostos - taxaCartao - com);
    },
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      const [
        vendas,
        clientesData,
        cursosData,
        vendedoresData,
        tiposPagamentoData,
        status,
        filiaisData,
        modalidadesData,
      ] = await Promise.all([
        fetch("http://localhost:3001/vendas").then((res) => res.json()),
        fetch("http://localhost:3001/clientes").then((res) => res.json()),
        fetch("http://localhost:3001/cursos").then((res) => res.json()),
        fetch("http://localhost:3001/vendedores").then((res) => res.json()),
        fetch("http://localhost:3001/tiposPagamento").then((res) => res.json()),
        fetch("http://localhost:3001/status").then((res) => res.json()),
        fetch("http://localhost:3001/filiais").then((res) => res.json()),
        fetch("http://localhost:3001/modalidades").then((res) => res.json()),
      ]);

      setVendasOriginais(vendas);
      setClientes(clientesData);
      setCursos(cursosData);
      setModalidades(modalidadesData);
      setFiliais(filiaisData);
      setVendedores(vendedoresData);
      setTiposPagamento(tiposPagamentoData);
      setStatusList(status);

      const statusMap = {};
      status.forEach((s) => (statusMap[s.id] = s.nome));
      setStatusMap(statusMap);

      const vendasEnriquecidas = vendas.map((venda) => ({
        ...venda,
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
        Valor: formatCurrency(venda.valorTotal || 0),
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
      }));

      setData(vendasEnriquecidas);
      setFilteredData(vendasEnriquecidas);
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
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showNewSaleModal &&
        modalRef.current &&
        !modalRef.current.contains(event.target)
      ) {
        setShowNewSaleModal(false);
      }
      if (
        showEditForm &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target)
      ) {
        setShowEditForm(false);
        setSelectedRow(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNewSaleModal, showEditForm]);

  useEffect(() => {
    if (!form.cursoId) return;

    const cursoSelecionado = cursos.find((c) => c.id === form.cursoId);
    if (!cursoSelecionado) return;

    const valorTotal = calcularValorTotal(
      cursoSelecionado.preco,
      form.desconto || 0,
      form.comissao || 0,
      form.tipoPagamentoId
    );

    setForm((prev) => ({
      ...prev,
      valorTotal,
      modalidadeId: cursoSelecionado.modalidadeId,
    }));
  }, [
    form.cursoId,
    form.desconto,
    form.comissao,
    form.tipoPagamentoId,
    cursos,
    calcularValorTotal,
  ]);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNewSaleSubmit = async (e) => {
    e.preventDefault();

    if (isNaN(form.desconto) || isNaN(form.comissao)) {
      alert(
        "Por favor, insira valores numéricos válidos para desconto e comissão"
      );
      return;
    }

    const novaVenda = {
      ...form,
      id: getNextId(data),
      valorTotal: Number(form.valorTotal || 0),
      desconto: Number(form.desconto || 0),
      comissao: Number(form.comissao || 0),
      data_venda: form.data_venda || new Date().toISOString(),
    };

    await fetch("http://localhost:3001/vendas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novaVenda),
    });

    const enrichedVenda = {
      ...novaVenda,
      Data: new Date(novaVenda.data_venda).toLocaleDateString("pt-BR"),
      Cliente: clientes.find((c) => c.id === novaVenda.clienteId)?.nome || "",
      Curso: cursos.find((c) => c.id === novaVenda.cursoId)?.nome || "",
      Modalidade:
        modalidades.find((m) => m.id === novaVenda.modalidadeId)?.tipo || "",
      Valor: formatCurrency(novaVenda.valorTotal || 0),
      Filial: filiais.find((f) => f.id === novaVenda.filialId)?.nome || "",
      Vendedor:
        vendedores.find((v) => v.id === novaVenda.vendedorId)?.nome || "",
      Pagamento:
        tiposPagamento.find((t) => t.id === novaVenda.tipoPagamentoId)?.nome ||
        "",
      Status: statusList.find((s) => s.id === novaVenda.statusId)?.nome || "",
    };

    setData((prev) => [...prev, enrichedVenda]);
    setFilteredData((prev) => [...prev, enrichedVenda]);
    setShowNewSaleModal(false);
    setForm({
      clienteId: "",
      cursoId: "",
      filialId: "",
      vendedorId: "",
      tipoPagamentoId: "",
      statusId: "",
      data_venda: "",
      desconto: 0,
      comissao: 0,
    });
  };

  const handleEdit = (row) => {
    setSelectedRow(row);
    setShowEditForm(true);
  };

  const handleSaveEdit = async () => {
    const vendaOriginal = vendasOriginais.find((v) => v.id === selectedRow.id);
    if (!vendaOriginal) return;

    const cursoSelecionado = cursos.find((c) => c.id === selectedRow.cursoId);
    const valorTotal = calcularValorTotal(
      cursoSelecionado?.preco || selectedRow.valorTotal,
      selectedRow.desconto || 0,
      selectedRow.comissao || 0,
      selectedRow.tipoPagamentoId
    );

    const vendaAtualizada = {
      ...vendaOriginal,
      valorTotal: Number(valorTotal),
      statusId: selectedRow.statusId,
      desconto: Number(selectedRow.desconto || 0),
      comissao: Number(selectedRow.comissao || 0),
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
              Valor: formatCurrency(valorTotal),
              Status: statusMap[selectedRow.statusId] || selectedRow.statusId,
            }
          : item
      )
    );

    setShowEditForm(false);
    setSelectedRow(null);
  };

  const handleDelete = async (row) => {
    if (!window.confirm("Tem certeza que deseja excluir esta venda?")) return;

    await fetch(`http://localhost:3001/vendas/${row.id}`, {
      method: "DELETE",
    });

    setData((prev) => prev.filter((item) => item.id !== row.id));
    setFilteredData((prev) => prev.filter((item) => item.id !== row.id));
  };

  const renderCell = (column, row) => {
    if (column === "Status") {
      return (
        <span className="inline-block px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
          {row[column]}
        </span>
      );
    }
    if (column === "Pagamento") {
      return (
        <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
          {row[column]}
        </span>
      );
    }
    return row[column];
  };

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
        title="Editar"
        onClick={() => handleEdit(row)}
      >
        <PenLine size={16} className="sm:w-4 sm:h-4" />
      </button>
      <button
        className="p-1 sm:p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
        title="Excluir"
        onClick={() => handleDelete(row)}
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
              Vendas
            </h2>
            <p className="text-sm sm:text-base text-[#a243d2]">
              Lançamento e gerenciamento de vendas de cursos
            </p>
          </div>
          <Buttons
            className="flex flex-row items-center gap-2 rounded-lg px-4 py-2 border border-[#a243d2] bg-[#a243d2] text-white font-semibold shadow-sm mt-0 sm:mt-6 w-full sm:w-auto justify-center"
            onClick={() => setShowNewSaleModal(true)}
          >
            <SquarePlus size={16} className="sm:w-5 sm:h-5" />
            <span>Nova Venda</span>
          </Buttons>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 w-full">
          {summaryCards.map((card, i) => (
            <SummaryCard key={i} {...card} />
          ))}
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end w-full mb-4 gap-2">
          <div className="flex w-full sm:w-auto gap-2">
            <button
              className="flex items-center gap-2 px-3 py-1 rounded bg-transparent border border-[#a243d2] text-[#a243d2] hover:bg-[#e9e0f7] text-sm sm:text-base"
              onClick={() => setShowFilterModal(!showFilterModal)}
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
            <SearchFilterSales
              data={data}
              columns={columns}
              setFilteredData={setFilteredData}
              selectedField={selectedField}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-0 w-full border border-[#a243d2] sm:border-2 overflow-x-auto">
          <Table
            data={filteredData}
            columns={columns}
            renderCell={renderCell}
            renderActions={renderActions}
          />
        </div>
      </div>

      {/* Edit Modal */}
      {showEditForm && selectedRow && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-opacity-50 pt-22 pb-10 overflow-y-auto">
          <div
            ref={popoverRef}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 w-full max-w-lg border border-[#a243d2] relative"
            style={{ marginTop: "20px" }}
          >
            <div className="sticky top-0 bg-white pt-2 pb-4 border-b border-[#a243d2] z-10">
              <h3 className="text-xl sm:text-2xl font-bold text-[#a243d2]">
                Editar Venda
              </h3>
            </div>

            <div className="mt-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveEdit();
                }}
                className="flex flex-col gap-3"
              >
                {[
                  {
                    label: "Data",
                    type: "date",
                    value: selectedRow.data_venda?.slice(0, 10),
                    onChange: (e) =>
                      setSelectedRow({
                        ...selectedRow,
                        data_venda: e.target.value,
                      }),
                  },
                  {
                    label: "Cliente",
                    type: "select",
                    options: clientes,
                    value: selectedRow.clienteId,
                    onChange: (e) =>
                      setSelectedRow({
                        ...selectedRow,
                        clienteId: e.target.value,
                      }),
                  },
                  {
                    label: "Curso",
                    type: "select",
                    options: cursos,
                    value: selectedRow.cursoId,
                    onChange: (e) => {
                      const curso = cursos.find((c) => c.id === e.target.value);
                      setSelectedRow({
                        ...selectedRow,
                        cursoId: e.target.value,
                        valorTotal: curso?.preco || selectedRow.valorTotal,
                      });
                    },
                  },
                  {
                    label: "Desconto (R$)",
                    type: "number",
                    value: selectedRow.desconto || 0,
                    onChange: (e) =>
                      setSelectedRow({
                        ...selectedRow,
                        desconto: e.target.value,
                      }),
                  },
                  {
                    label: "Comissão (R$)",
                    type: "number",
                    value: selectedRow.comissao || 0,
                    onChange: (e) =>
                      setSelectedRow({
                        ...selectedRow,
                        comissao: e.target.value,
                      }),
                  },
                  {
                    label: "Valor Total",
                    readOnly: true,
                    value: formatCurrency(selectedRow.valorTotal || 0),
                  },
                  {
                    label: "Filial",
                    type: "select",
                    options: filiais,
                    value: selectedRow.filialId,
                    onChange: (e) =>
                      setSelectedRow({
                        ...selectedRow,
                        filialId: e.target.value,
                      }),
                  },
                  {
                    label: "Vendedor",
                    type: "select",
                    options: vendedores,
                    value: selectedRow.vendedorId,
                    onChange: (e) =>
                      setSelectedRow({
                        ...selectedRow,
                        vendedorId: e.target.value,
                      }),
                  },
                  {
                    label: "Pagamento",
                    type: "select",
                    options: tiposPagamento,
                    value: selectedRow.tipoPagamentoId,
                    onChange: (e) =>
                      setSelectedRow({
                        ...selectedRow,
                        tipoPagamentoId: e.target.value,
                      }),
                  },
                  {
                    label: "Status",
                    type: "select",
                    options: statusList,
                    value: selectedRow.statusId,
                    onChange: (e) =>
                      setSelectedRow({
                        ...selectedRow,
                        statusId: e.target.value,
                      }),
                  },
                ].map((field, i) => (
                  <div key={i}>
                    <label className="block text-sm text-[#a243d2] mb-1">
                      {field.label}:
                    </label>
                    {field.readOnly ? (
                      <div className="border border-[#a243d2] p-2 w-full rounded bg-gray-50 text-sm sm:text-base">
                        {field.value}
                      </div>
                    ) : field.type === "select" ? (
                      <select
                        value={field.value || ""}
                        onChange={field.onChange}
                        className="border border-[#a243d2] p-2 w-full rounded text-sm sm:text-base focus:ring-2 focus:ring-[#a243d2] focus:border-[#a243d2]"
                        required={!field.readOnly}
                      >
                        <option value="">Selecione</option>
                        {field.options.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.nome}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={field.value || ""}
                        onChange={field.onChange}
                        className="border border-[#a243d2] p-2 w-full rounded text-sm sm:text-base focus:ring-2 focus:ring-[#a243d2] focus:border-[#a243d2]"
                        required={!field.readOnly}
                        min={field.type === "number" ? "0" : undefined}
                        step={field.type === "number" ? "0.01" : undefined}
                      />
                    )}
                  </div>
                ))}

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
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* New Sale Modal */}
      {showNewSaleModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-opacity-50 p-4 pt-16 sm:pt-20 overflow-y-auto">
          <div
            ref={modalRef}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-8 w-full max-w-lg border border-[#a243d2] sm:border-2 relative my-4 sm:my-8"
          >
            <button
              className="absolute top-2 right-4 text-2xl text-[#a243d2] font-bold hover:text-[#580581]"
              onClick={() => setShowNewSaleModal(false)}
            >
              ×
            </button>
            <h3 className="text-xl sm:text-2xl font-bold text-[#a243d2] mb-4">
              Nova Venda
            </h3>
            <form
              onSubmit={handleNewSaleSubmit}
              className="flex flex-col gap-3 sm:gap-4"
            >
              {/* Data */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[#a243d2]">
                  Data:
                </label>
                <input
                  type="date"
                  name="data_venda"
                  value={form.data_venda || ""}
                  onChange={handleFormChange}
                  className="w-full p-2 border border-[#a243d2] rounded-md focus:ring-2 focus:ring-[#a243d2] focus:border-[#a243d2] text-sm sm:text-base"
                  required
                />
              </div>

              {/* Cliente */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[#a243d2]">
                  Selecione cliente:
                </label>
                <select
                  name="clienteId"
                  value={form.clienteId || ""}
                  onChange={handleFormChange}
                  className="w-full p-2 border border-[#a243d2] rounded-md focus:ring-2 focus:ring-[#a243d2] focus:border-[#a243d2] text-sm sm:text-base"
                  required
                >
                  <option value="">Selecione cliente</option>
                  {clientes.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Curso */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[#a243d2]">
                  Selecione curso:
                </label>
                <select
                  name="cursoId"
                  value={form.cursoId || ""}
                  onChange={handleFormChange}
                  className="w-full p-2 border border-[#a243d2] rounded-md focus:ring-2 focus:ring-[#a243d2] focus:border-[#a243d2] text-sm sm:text-base"
                  required
                >
                  <option value="">Selecione curso</option>
                  {cursos.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Desconto */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[#a243d2]">
                  Desconto (R$):
                </label>
                <input
                  type="number"
                  name="desconto"
                  value={form.desconto || 0}
                  onChange={handleFormChange}
                  className="w-full p-2 border border-[#a243d2] rounded-md focus:ring-2 focus:ring-[#a243d2] focus:border-[#a243d2] text-sm sm:text-base"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Comissão */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[#a243d2]">
                  Comissão (R$):
                </label>
                <input
                  type="number"
                  name="comissao"
                  value={form.comissao || 0}
                  onChange={handleFormChange}
                  className="w-full p-2 border border-[#a243d2] rounded-md focus:ring-2 focus:ring-[#a243d2] focus:border-[#a243d2] text-sm sm:text-base"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="border border-[#a243d2] rounded-md p-3 bg-gray-50">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Valor Total:
                </label>
                <div className="text-base sm:text-lg font-semibold text-[#a243d2]">
                  {form.valorTotal
                    ? formatCurrency(form.valorTotal)
                    : "Selecione um curso"}
                </div>
              </div>

              {/* Filial */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[#a243d2]">
                  Selecione Filial:
                </label>
                <select
                  name="filialId"
                  value={form.filialId || ""}
                  onChange={handleFormChange}
                  className="w-full p-2 border border-[#a243d2] rounded-md focus:ring-2 focus:ring-[#a243d2] focus:border-[#a243d2] text-sm sm:text-base"
                >
                  <option value="">Selecione filial</option>
                  {filiais.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Vendedor */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[#a243d2]">
                  Selecione Vendedor:
                </label>
                <select
                  name="vendedorId"
                  value={form.vendedorId || ""}
                  onChange={handleFormChange}
                  className="w-full p-2 border border-[#a243d2] rounded-md focus:ring-2 focus:ring-[#a243d2] focus:border-[#a243d2] text-sm sm:text-base"
                  required
                >
                  <option value="">Selecione vendedor</option>
                  {vendedores.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pagamento */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[#a243d2]">
                  Selecione Pagamento:
                </label>
                <select
                  name="tipoPagamentoId"
                  value={form.tipoPagamentoId || ""}
                  onChange={handleFormChange}
                  className="w-full p-2 border border-[#a243d2] rounded-md focus:ring-2 focus:ring-[#a243d2] focus:border-[#a243d2] text-sm sm:text-base"
                  required
                >
                  <option value="">Selecione pagamento</option>
                  {tiposPagamento.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[#a243d2]">
                  Selecione Status:
                </label>
                <select
                  name="statusId"
                  value={form.statusId || ""}
                  onChange={handleFormChange}
                  className="w-full p-2 border border-[#a243d2] rounded-md focus:ring-2 focus:ring-[#a243d2] focus:border-[#a243d2] text-sm sm:text-base"
                  required
                >
                  <option value="">Selecione status</option>
                  {statusList.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Botões */}
              <div className="flex gap-2 sm:gap-3 pt-2">
                <button
                  type="button"
                  className="flex-1 px-3 sm:px-4 py-1 sm:py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition-colors text-sm sm:text-base"
                  onClick={() => setShowNewSaleModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 sm:px-4 py-1 sm:py-2 bg-[#a243d2] text-white rounded-md font-medium hover:bg-[#580581] transition-colors text-sm sm:text-base"
                >
                  Salvar Venda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-8 w-full max-w-lg border border-[#a243d2] sm:border-2 relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-2 right-4 text-2xl text-[#a243d2] font-bold"
              onClick={() => setShowViewModal(false)}
            >
              ×
            </button>
            <h3 className="text-xl sm:text-2xl font-bold text-[#a243d2] mb-4">
              Detalhes da Venda
            </h3>

            <div className="flex flex-col gap-2 text-sm sm:text-base">
              {[
                { label: "Data", value: viewRow.Data },
                { label: "Cliente", value: viewRow.Cliente },
                { label: "Curso", value: viewRow.Curso },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between py-1 border-b border-gray-100"
                >
                  <span className="font-semibold text-[#a243d2]">
                    {item.label}:
                  </span>
                  <span className="text-gray-700">{item.value}</span>
                </div>
              ))}

              <div className="space-y-2 mt-2">
                {Object.entries(calculateDetailedValues(viewRow, cursos)).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between py-1 border-b border-gray-100"
                    >
                      <span className="capitalize">{key}:</span>
                      <span>{formatCurrency(value)}</span>
                    </div>
                  )
                )}
              </div>

              {[
                { label: "Filial", value: viewRow.Filial },
                { label: "Vendedor", value: viewRow.Vendedor },
                { label: "Pagamento", value: viewRow.Pagamento },
                { label: "Status", value: viewRow.Status },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between py-1 border-b border-gray-100"
                >
                  <span className="font-semibold text-[#a243d2]">
                    {item.label}:
                  </span>
                  <span className="text-gray-700">{item.value}</span>
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
