import React, { useState, useEffect } from "react";
import {
  Plus,
  Pin,
  Eye,
  Download,
  Trash2,
  PenLine,
  X,
  BarChart,
  SquarePlus,
  ShoppingBag,
  Wallet,
  CreditCard,
  Database,
  TrendingUp,
  DollarSign,
  FileText,
} from "lucide-react";
import Modal from "../components/Modal";
import ModalChart from "../components/ModalChartVisualization";
import Buttons from "../components/Buttons";
import { useNavigate } from "react-router-dom";
import ChartCustomizer from "../components/ChartCustomizer";
import ChartPreview from "../components/ChartPreview";
import Table from "../components/Table";
import { useAuth } from "../context/AuthContext";
import SummaryCard from "../components/SummaryCard";

const API_BASE_URL = "http://localhost:3001";

const ReportsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.papel === "admin";
  const [showChartModal, setShowChartModal] = useState(false);
  const [charts, setCharts] = useState([]);
  const [activeChart, setActiveChart] = useState(null);
  const [editingChart, setEditingChart] = useState(null);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [availableData, setAvailableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [relatedData, setRelatedData] = useState({});
  const navigate = useNavigate();

  const availableTables = [
    {
      id: "vendas",
      name: "Vendas",
      icon: ShoppingBag,
    },
    {
      id: "despesas",
      name: "Despesas",
      icon: Wallet,
    },
    {
      id: "pagamentos",
      name: "Pagamentos",
      icon: CreditCard,
    },
  ];

  const tableRelations = {
    vendas: {
      clienteId: { table: "clientes", field: "nome" },
      cursoId: { table: "cursos", field: "nome" },
      vendedorId: { table: "vendedores", field: "nome" },
      tipoPagamentoId: { table: "tiposPagamento", field: "nome" },
      statusId: { table: "status", field: "nome" },
    },
    despesas: {
      tipoDespesaId: { table: "tiposDespesas", field: "nome" },
      filialId: { table: "filiais", field: "nome" },
      statusId: { table: "status", field: "nome" },
    },
    pagamentos: {
      vendaId: { table: "vendas", field: "id" },
      tipoPagamentoId: { table: "tiposPagamento", field: "nome" },
    },
  };

  const fetchCharts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/graficos`);
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      const data = await response.json();
      setCharts(data);
    } catch (error) {
      console.error("Error fetching charts:", error);
      console.log(`Tentando acessar: ${API_BASE_URL}/graficos`);
      alert(
        "Erro ao carregar gráficos. Verifique se o servidor JSON está rodando corretamente."
      );
    }
  };

  const saveChartToDB = async (chart) => {
    try {
      const isExisting =
        editingChart &&
        editingChart.id !== null &&
        editingChart.id !== undefined &&
        editingChart.id !== "";

      const method = isExisting ? "PUT" : "POST";
      const url = isExisting
        ? `${API_BASE_URL}/graficos/${editingChart.id}`
        : `${API_BASE_URL}/graficos`;

      const chartData = { ...chart };

      if (isExisting) {
        chartData.id = editingChart.id.toString();
      } else {
        chartData.id = Date.now().toString();
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chartData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Erro ao salvar gráfico: ${response.status} - ${errorText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error saving chart:", error);
      throw error;
    }
  };

  const isDefaultChart = (chartId) => {
    const defaultChartIds = ["1", "2", "3", "4"];
    return defaultChartIds.includes(chartId.toString());
  };

  const handleSaveChart = async () => {
    if (!activeChart) return;

    if (
      !activeChart.xAxisKey ||
      !activeChart.dataKeys?.length ||
      !activeChart.data?.length
    ) {
      alert(
        "Configuração incompleta! Verifique:\n- Eixo X selecionado\n- Pelo menos um campo de valor\n- Dados disponíveis"
      );
      return;
    }

    try {
      const savedChart = await saveChartToDB({
        ...activeChart,
        dateCreated: activeChart.dateCreated || Date.now(),
      });

      if (editingChart && editingChart.id) {
        setCharts((prevCharts) =>
          prevCharts.map((chart) =>
            chart.id.toString() === editingChart.id.toString()
              ? savedChart
              : chart
          )
        );
      } else {
        setCharts((prevCharts) => [...prevCharts, savedChart]);
      }

      setShowCustomizeModal(false);
      resetChartState();

      alert(
        editingChart
          ? "Gráfico atualizado com sucesso!"
          : "Gráfico criado com sucesso!"
      );
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar gráfico. Por favor, tente novamente.");
    }
  };

  const handleEditChart = (chartId) => {
    const chartToEdit = charts.find(
      (chart) => chart.id.toString() === chartId.toString()
    );
    if (chartToEdit) {
      setEditingChart(chartToEdit);
      setActiveChart({ ...chartToEdit });
      setSelectedTable(chartToEdit.dataSource);
      setAvailableData(chartToEdit.data || []);
      setRelatedData(chartToEdit.relationsData || {});
      setShowCustomizeModal(true);
    }
  };

  const deleteChartFromDB = async (chartId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/graficos/${chartId.toString()}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Erro ao excluir gráfico");
    } catch (error) {
      console.error("Error deleting chart:", error);
      throw error;
    }
  };

  const shareToDashboard = async (chartId) => {
    if (!isAdmin) {
      alert("Apenas administradores podem fixar gráficos no Dashboard.");
      return false;
    }

    try {
      const chartResponse = await fetch(
        `${API_BASE_URL}/graficos/${chartId.toString()}`
      );
      if (!chartResponse.ok) throw new Error("Gráfico não encontrado");
      const chart = await chartResponse.json();

      const dashboardResponse = await fetch(`${API_BASE_URL}/dashboard`);
      let dashboard = await dashboardResponse.json();

      if (!dashboard.layout) {
        dashboard.layout = [];
      }

      const alreadyShared = dashboard.layout.some(
        (item) => item.chartId.toString() === chartId.toString()
      );

      if (alreadyShared) {
        alert("Este gráfico já está compartilhado no dashboard!");
        return false;
      }

      const existingCharts = dashboard.layout.length;
      const columns = 3;
      const chartWidth = 400;
      const chartHeight = 300;
      const margin = 20;

      const row = Math.floor(existingCharts / columns);
      const col = existingCharts % columns;

      const newItem = {
        chartId: chartId.toString(),
        x: col * (chartWidth + margin),
        y: row * (chartHeight + margin),
        width: chartWidth,
        height: chartHeight,
      };

      dashboard.layout.push(newItem);

      const updateResponse = await fetch(`${API_BASE_URL}/dashboard`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dashboard),
      });

      if (!updateResponse.ok) {
        throw new Error("Erro ao atualizar dashboard");
      }

      return true;
    } catch (error) {
      console.error("Error sharing to dashboard:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchCharts();
  }, []);

  const fetchRelatedData = async (tableName) => {
    const relations = tableRelations[tableName];
    if (!relations) return {};

    const data = {};
    for (const [field, relation] of Object.entries(relations)) {
      try {
        const response = await fetch(`${API_BASE_URL}/${relation.table}`);
        const items = await response.json();
        data[field] = items.reduce((acc, item) => {
          acc[item.id.toString()] = item[relation.field];
          return acc;
        }, {});
      } catch (error) {
        console.error(`Error loading ${relation.table}:`, error);
      }
    }
    return data;
  };

  const resolveForeignKeys = (data, tableName, relationsData) => {
    const relations = tableRelations[tableName];
    if (!relations) return data;

    return data.map((item) => {
      const resolvedItem = { ...item };
      for (const [field, relation] of Object.entries(relations)) {
        if (item[field] && relationsData[field]?.[item[field].toString()]) {
          resolvedItem[`${field}_label`] =
            relationsData[field][item[field].toString()];
        }
      }
      return resolvedItem;
    });
  };

  const fetchAvailableData = async (tableId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/${tableId}`);
      const data = await response.json();

      const relationsData = await fetchRelatedData(tableId);
      setRelatedData(relationsData);

      const resolvedData = resolveForeignKeys(data, tableId, relationsData);
      setAvailableData(resolvedData);

      const numericColumns = Object.keys(resolvedData[0] || {}).filter(
        (key) => typeof resolvedData[0][key] === "number"
      );
      const nonNumericColumns = Object.keys(resolvedData[0] || {}).filter(
        (key) => typeof resolvedData[0][key] !== "number"
      );

      setActiveChart({
        id: Date.now().toString(),
        title: `Gráfico de ${
          availableTables.find((t) => t.id === tableId)?.name || "Dados"
        }`,
        type: "bar",
        data: resolvedData,
        dataKeys: numericColumns.slice(0, 2),
        xAxisKey: nonNumericColumns[0] || Object.keys(resolvedData[0] || {})[0],
        width: 600,
        height: 400,
        colors: [
          "#3B82F6",
          "#8B5CF6",
          "#06B6D4",
          "#10B981",
          "#F97316",
          "#EF4444",
        ],
        showLegend: true,
        legendPosition: "bottom",
        showGrid: true,
        showTooltip: true,
        dateCreated: Date.now(),
        dataSource: tableId,
        relationsData: relationsData,
        legends: {},
      });

      setSelectedTable(tableId);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetChartState = () => {
    setActiveChart(null);
    setEditingChart(null);
    setSelectedTable(null);
    setAvailableData([]);
    setRelatedData({});
  };

  const handleDeleteChart = async (chartId) => {
    if (window.confirm("Tem certeza que deseja excluir este gráfico?")) {
      try {
        await deleteChartFromDB(chartId);
        setCharts(
          charts.filter((chart) => chart.id.toString() !== chartId.toString())
        );

        try {
          const dashboardResponse = await fetch(`${API_BASE_URL}/dashboard`);
          const dashboard = await dashboardResponse.json();

          if (dashboard.layout) {
            const updatedLayout = dashboard.layout.filter(
              (item) => item.chartId.toString() !== chartId.toString()
            );

            if (updatedLayout.length !== dashboard.layout.length) {
              await fetch(`${API_BASE_URL}/dashboard`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...dashboard, layout: updatedLayout }),
              });
            }
          }
        } catch (dashboardError) {
          console.error("Erro ao remover do dashboard:", dashboardError);
        }

        alert("Gráfico excluído com sucesso!");
      } catch (error) {
        alert("Erro ao excluir gráfico. Por favor, tente novamente.");
      }
    }
  };

  const handleShareToDashboard = async (chartId) => {
    try {
      const success = await shareToDashboard(chartId);
      if (success) {
        alert("Gráfico fixado no Dashboard com sucesso!");
      }
    } catch (error) {
      alert("Erro ao fixar gráfico. Por favor, tente novamente.");
    }
  };

  const handleViewChart = (chartId) => {
    const chartToView = charts.find(
      (chart) => chart.id.toString() === chartId.toString()
    );
    if (chartToView) {
      setActiveChart(chartToView);
      setShowChartModal(true);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const tableData = charts.map((chart) => ({
    id: chart.id,
    Título: chart.title,
    Tipo: chart.type.charAt(0).toUpperCase() + chart.type.slice(1),
    Campos: isDefaultChart(chart.id) ? " " : chart.dataKeys.join(", "),
    Fonte: isDefaultChart(chart.id)
      ? " "
      : availableTables.find((t) => t.id === chart.dataSource)?.name || "N/A",
    "Criado em": isDefaultChart(chart.id) ? " " : formatDate(chart.dateCreated),
    Dimensões: `${chart.width} × ${chart.height}`,
    Gráfico: isDefaultChart(chart.id) ? "Padrão" : "Personalizado",
  }));

  const tableColumns = [
    "Título",
    "Tipo",
    "Campos",
    "Fonte",
    "Criado em",
    "Dimensões",
    "Gráfico",
  ];

  const renderActions = (row) => {
    const chartId = row.id;
    const isDefault = isDefaultChart(chartId);

    return (
      <div className="flex justify-center items-center gap-3 mx-2">
        <button
          onClick={() => handleViewChart(chartId)}
          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
          title="Visualizar"
        >
          <Eye size={18} />
        </button>
        <button
          onClick={() => !isDefault && handleEditChart(chartId)}
          className={`p-1.5 ${
            isDefault
              ? "text-gray-400 cursor-not-allowed"
              : "text-[#a243d2] hover:bg-purple-50"
          } rounded-full transition-colors`}
          title={isDefault ? "Gráfico padrão - não editável" : "Editar"}
          disabled={isDefault}
        >
          <PenLine size={18} />
        </button>
        {isAdmin && (
          <button
            onClick={() => handleShareToDashboard(chartId)}
            className="p-1.5 text-green-600 hover:bg-green-50 rounded-full transition-colors"
            title="Fixar Dashboard"
          >
            <Pin size={18} />
          </button>
        )}
        <button
          onClick={() => !isDefault && handleDeleteChart(chartId)}
          className={`p-1.5 ${
            isDefault
              ? "text-gray-400 cursor-not-allowed"
              : "text-red-600 hover:bg-red-50"
          } rounded-full transition-colors`}
          title={isDefault ? "Gráfico padrão - não removível" : "Excluir"}
          disabled={isDefault}
        >
          <Trash2 size={18} />
        </button>
      </div>
    );
  };

  return (
    <div className="p-0 min-h-screen bg-[#f3f8fc] flex flex-col items-center">
      <div className="w-full max-w-5xl flex flex-col items-center px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mb-6 gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#a243d2] mt-6 mb-1">
              Relatórios
            </h2>
            <p className="text-[#a243d2] text-sm sm:text-base">
              Crie e gerencie gráficos personalizados para análise de dados
            </p>
          </div>
          <Buttons
            className="flex flex-row items-center gap-2 rounded-lg px-4 py-2 border border-[#a243d2] bg-[#a243d2] text-white font-semibold shadow-sm mt-0 sm:mt-6 w-full sm:w-auto justify-center"
            onClick={() => {
              resetChartState();
              setShowCustomizeModal(true);
            }}
          >
            <SquarePlus size={18} />
            <span>Novo Gráfico</span>
          </Buttons>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-0 w-full border-2 border-[#a243d2] overflow-x-auto">
          {charts.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              Nenhum gráfico criado ainda. Clique em "Novo Gráfico" para
              começar.
            </div>
          ) : (
            <Table
              data={tableData}
              columns={tableColumns}
              renderActions={renderActions}
            />
          )}
        </div>
      </div>

      <ModalChart
        isOpen={showChartModal}
        onClose={() => setShowChartModal(false)}
        position="center"
        size="4xl"
        className="z-[1000]"
      >
        <div className="w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl p-4 font-bold text-[#a243d2]">
              Visualização do Gráfico
            </h3>
            <button
              onClick={() => setShowChartModal(false)}
              className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
              title="Fechar"
            >
              <X size={24} />
            </button>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            {activeChart ? (
              <div className="w-full h-[600px]">
                <ChartPreview
                  config={{
                    ...activeChart,
                    width: 1000,
                    height: 550,
                  }}
                  showExport={true}
                  containerClassName="w-full h-full"
                />
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nenhum gráfico selecionado para visualização
              </div>
            )}
          </div>
        </div>
      </ModalChart>

      <Modal
        isOpen={showCustomizeModal}
        onClose={() => {
          setShowCustomizeModal(false);
          resetChartState();
        }}
        position="center"
        size={selectedTable ? "2xl" : "md"}
        className="z-[1000]"
      >
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#a243d2]"></div>
          </div>
        ) : !selectedTable ? (
          <div className="p-6">
            <h3 className="text-lg font-medium text-[#a243d2] mb-6 text-center">
              Selecione a fonte de dados
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {availableTables.map((table) => {
                const Icon = table.icon || Database;
                return (
                  <button
                    key={table.id}
                    onClick={() => fetchAvailableData(table.id)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-[#a243d2] hover:bg-purple-50 transition-colors flex flex-col items-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#a243d2] bg-opacity-10 flex items-center justify-center mb-2">
                      <Icon size={20} className="text-white" />
                    </div>
                    <span className="text-gray-800 text-center">
                      {table.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6 h-full max-h-[80vh] overflow-hidden">
            <div className="flex-1 overflow-auto">
              <div className="bg-white rounded-lg shadow p-4 mb-4 flex justify-between items-center sticky top-0 z-10">
                <div>
                  <span className="text-sm text-gray-500">Fonte de dados:</span>
                  <h4 className="font-medium text-[#a243d2]">
                    {availableTables.find((t) => t.id === selectedTable)?.name}
                  </h4>
                </div>
                <button
                  onClick={() => {
                    resetChartState();
                    setShowCustomizeModal(true);
                  }}
                  className="text-sm text-[#a243d2] hover:underline"
                >
                  Alterar fonte
                </button>
              </div>
              {activeChart && (
                <ChartCustomizer
                  config={activeChart}
                  onChange={setActiveChart}
                  onCancel={() => {
                    setShowCustomizeModal(false);
                    resetChartState();
                  }}
                  onSave={handleSaveChart}
                />
              )}
            </div>
            <div className="flex-1 bg-gray-50 p-4 rounded-lg overflow-auto">
              <h3 className="text-lg font-medium text-[#a243d2] mb-4">
                Pré-visualização
              </h3>
              <div className="h-[400px] md:h-auto">
                <ChartPreview config={activeChart} showExport={false} />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReportsPage;
