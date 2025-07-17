import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";
import {
  GripVertical,
  X as XIcon,
  RefreshCw,
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building,
} from "lucide-react";
import { debounce } from 'lodash';
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "http://localhost:3001";

// Componente para renderizar diferentes tipos de gráficos
const ChartRenderer = ({ config, containerWidth, containerHeight }) => {
  const {
    type,
    data,
    dataKeys,
    xAxisKey,
    colors,
    showLegend,
    showGrid,
    showTooltip,
    legends = {},
  } = config;

  const chartHeight = containerHeight - 60;

  const commonProps = {
    data,
    width: containerWidth,
    height: chartHeight,
  };

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height="90%">
      <BarChart {...commonProps}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        {showTooltip && <Tooltip />}
        {showLegend && <Legend />}
        {dataKeys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            fill={colors[index % colors.length]}
            name={legends[key] || key}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <LineChart {...commonProps}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        {showTooltip && <Tooltip />}
        {showLegend && <Legend />}
        {dataKeys.map((key, index) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={colors[index % colors.length]}
            name={legends[key] || key}
            strokeWidth={2}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${legends[name] || name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={Math.min(containerWidth, chartHeight) / 4}
          fill="#8884d8"
          dataKey={dataKeys[0]}
          nameKey={xAxisKey}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        {showTooltip && <Tooltip />}
        {showLegend && <Legend />}
      </PieChart>
    </ResponsiveContainer>
  );

  const renderAreaChart = () => (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <AreaChart {...commonProps}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        {showTooltip && <Tooltip />}
        {showLegend && <Legend />}
        {dataKeys.map((key, index) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stackId="1"
            stroke={colors[index % colors.length]}
            fill={colors[index % colors.length]}
            fillOpacity={0.6}
            name={legends[key] || key}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );

  switch (type) {
    case "bar": return renderBarChart();
    case "line": return renderLineChart();
    case "pie": return renderPieChart();
    case "area": return renderAreaChart();
    default:
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          Tipo de gráfico não suportado
        </div>
      );
  }
};

// Componente para gráficos arrastáveis
const DraggableChart = ({
  chart,
  position,
  onMove,
  onResize,
  onRemove,
  onRefresh,
  isSelected,
  onSelect,
  isAdmin
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const cardRef = useRef(null);

  const handleMouseDown = (e, action) => {
    if (!isAdmin) return;
    
    e.preventDefault();
    onSelect(chart.id);

    if (action === "drag") {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    } else if (action === "resize") {
      setIsResizing(true);
      cardRef.current.classList.add('resizing');
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: position.width,
        height: position.height,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (!isAdmin) return;
    
    if (isDragging) {
      const newX = Math.max(0, e.clientX - dragStart.x);
      const newY = Math.max(0, e.clientY - dragStart.y);
      onMove(chart.id, newX, newY);
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      const newWidth = Math.max(300, resizeStart.width + deltaX);
      const newHeight = Math.max(200, resizeStart.height + deltaY);
      onResize(chart.id, newWidth, newHeight);
    }
  };

  const handleMouseUp = () => {
    if (!isAdmin) return;
    
    setIsDragging(false);
    if (isResizing) {
      cardRef.current.classList.remove('resizing');
      setIsResizing(false);
    }
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, resizeStart]);

  const cardClasses = `absolute bg-white rounded-lg shadow-lg border-2 transition-all duration-200 ${
    isSelected
      ? "border-[#a243d2] shadow-xl"
      : "border-gray-200 hover:border-gray-300"
  } ${isDragging ? "cursor-grabbing z-50" : "cursor-auto"}`;

  const headerClasses = `flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg ${
    isAdmin ? "cursor-grab" : "cursor-default"
  }`;

  return (
    <div
      ref={cardRef}
      className={cardClasses}
      style={{
        left: position.x,
        top: position.y,
        width: position.width,
        height: position.height,
        zIndex: isSelected ? 40 : 30,
      }}
      onClick={() => onSelect(chart.id)}
    >
      <div
        className={headerClasses}
        onMouseDown={isAdmin ? (e) => handleMouseDown(e, "drag") : undefined}
      >
        <div className="flex items-center gap-2">
          {isAdmin && <GripVertical size={16} className="text-gray-400" />}
          <span className="text-sm font-medium text-gray-700 truncate">
            {chart.title}
          </span>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRefresh(chart.id);
              }}
              className="p-1 text-gray-500 hover:text-[#a243d2] rounded transition-colors"
              title="Atualizar dados"
            >
              <RefreshCw size={14} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(chart.id);
              }}
              className="p-1 text-gray-500 hover:text-red-500 rounded transition-colors"
              title="Remover do dashboard"
            >
              <XIcon size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="p-4 h-full pb-8">
        <ChartRenderer
          config={chart}
          containerWidth={position.width - 32}
          containerHeight={position.height - 120}
        />
      </div>

      {isAdmin && (
        <>
          <div
            className="absolute bottom-0 right-0 w-4 h-4 bg-[#a243d2] rounded-tl-lg cursor-se-resize opacity-70 hover:opacity-100 transition-opacity"
            onMouseDown={(e) => handleMouseDown(e, "resize")}
            title="Redimensionar"
          />

          {isSelected && (
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-[#a243d2] rounded-full border-2 border-white" />
          )}
        </>
      )}
    </div>
  );
};

// Componente para os cards de resumo
const SummaryCard = ({ title, value, icon, color, borderColor }) => (
  <div className={`p-4 rounded-lg border ${borderColor} ${color} shadow-sm`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-semibold mt-1">{value}</p>
      </div>
      <div className="p-2 rounded-full bg-white">{icon}</div>
    </div>
  </div>
);

// Componente principal do Dashboard
const DashboardPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.papel === 'admin';
  
  // Estados
  const [dashboardCharts, setDashboardCharts] = useState([]);
  const [chartPositions, setChartPositions] = useState({});
  const [selectedChart, setSelectedChart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [summaryData, setSummaryData] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netBalance: 0,
    mostProfitableBranch: "Carregando...",
  });

  const containerRef = useRef(null);
  const saveQueue = useRef({
    timeout: null,
    idleCallback: null,
    pendingSave: null
  });

  // Formata valores monetários
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Dados para os cards de resumo
  const summaryCards = [
    {
      title: "Receitas Totais",
      value: formatCurrency(summaryData.totalRevenue),
      icon: <TrendingUp size={24} className="text-green-500" />,
      color: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      title: "Despesas Totais",
      value: formatCurrency(summaryData.totalExpenses),
      icon: <TrendingDown size={24} className="text-red-500" />,
      color: "bg-red-50",
      borderColor: "border-red-200"
    },
    {
      title: "Saldo Líquido",
      value: formatCurrency(summaryData.netBalance),
      icon: <DollarSign size={24} className={
        summaryData.netBalance >= 0 ? "text-blue-500" : "text-red-500"
      } />,
      color: summaryData.netBalance >= 0 ? "bg-blue-50" : "bg-red-50",
      borderColor: summaryData.netBalance >= 0 ? "border-blue-200" : "border-red-200"
    },
    {
      title: "Filial com Maior Lucro",
      value: summaryData.mostProfitableBranch,
      icon: <Building size={24} className="text-purple-500" />,
      color: "bg-purple-50",
      borderColor: "border-purple-200"
    }
  ];

  // Busca dados financeiros
  const fetchFinancialData = useCallback(async () => {
    try {
      const [vendas, despesas, filiais] = await Promise.all([
        fetch(`${API_BASE_URL}/vendas`).then(res => res.json()),
        fetch(`${API_BASE_URL}/despesas`).then(res => res.json()),
        fetch(`${API_BASE_URL}/filiais`).then(res => res.json()),
      ]);

      const totalRevenue = vendas.reduce((sum, venda) => sum + venda.valorTotal, 0);
      const totalExpenses = despesas.reduce((sum, despesa) => sum + despesa.valor, 0);
      const netBalance = totalRevenue - totalExpenses;

      // Calcula filial mais lucrativa
      const branchProfits = {};
      vendas.forEach(venda => {
        branchProfits[venda.filialId] = (branchProfits[venda.filialId] || 0) + venda.valorTotal;
      });
      despesas.forEach(despesa => {
        branchProfits[despesa.filialId] = (branchProfits[despesa.filialId] || 0) - despesa.valor;
      });

      const mostProfitableBranchId = Object.keys(branchProfits).reduce((a, b) => 
        branchProfits[a] > branchProfits[b] ? a : b
      );
      const mostProfitableBranch = filiais.find(f => f.id === mostProfitableBranchId)?.nome || "N/A";

      setSummaryData({
        totalRevenue,
        totalExpenses,
        netBalance,
        mostProfitableBranch,
      });
    } catch (error) {
      console.error("Erro ao buscar dados financeiros:", error);
    }
  }, []);

  // Busca dados do dashboard
  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Erro ao buscar dados do dashboard:", error);
      return { layout: [] };
    }
  }, []);

  // Busca todos os gráficos
  const fetchAllCharts = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/graficos`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Erro ao buscar gráficos:", error);
      return [];
    }
  }, []);

  // Carrega o dashboard
  const loadDashboard = useCallback(async () => {
    if (isInitialized) return;

    try {
      setLoading(true);
      const [dashboardData, allCharts] = await Promise.all([
        fetchDashboardData(),
        fetchAllCharts(),
      ]);

      const dashboardLayout = dashboardData.layout || [];
      const chartsInDashboard = allCharts.filter(chart => 
        dashboardLayout.some(item => Number(item.chartId) === Number(chart.id))
      );

      const positions = {};
      dashboardLayout.forEach(item => {
        positions[item.chartId] = {
          x: item.x || 0,
          y: item.y || 0,
          width: item.width || 400,
          height: item.height || 300,
        };
      });

      setDashboardCharts(chartsInDashboard);
      setChartPositions(positions);
      setIsInitialized(true);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, [isInitialized, fetchDashboardData, fetchAllCharts]);

  // Salva o layout no servidor
  const saveLayout = useCallback(async (positions) => {
    if (!isAdmin) return;
    
    try {
      setIsSaving(true);
      const layout = Object.entries(positions).map(([chartId, position]) => ({
        chartId,
        ...position
      }));

      const response = await fetch(`${API_BASE_URL}/dashboard`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layout }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      setLastSaved(new Date());
    } catch (error) {
      console.error("Erro ao salvar layout:", error);
    } finally {
      setIsSaving(false);
    }
  }, [isAdmin]);

  // Agenda o salvamento do layout
  const scheduleLayoutSave = useCallback((positions) => {
    if (!isAdmin) return;
    
    // Limpa qualquer salvamento pendente
    if (saveQueue.current.timeout) clearTimeout(saveQueue.current.timeout);
    if (saveQueue.current.idleCallback) cancelIdleCallback(saveQueue.current.idleCallback);

    saveQueue.current.pendingSave = positions;

    // Agenda novo salvamento
    saveQueue.current.timeout = setTimeout(() => {
      saveQueue.current.idleCallback = requestIdleCallback(
        () => {
          if (saveQueue.current.pendingSave) {
            saveLayout(saveQueue.current.pendingSave);
            saveQueue.current.pendingSave = null;
          }
        },
        { timeout: 1000 }
      );
    }, 800);
  }, [saveLayout, isAdmin]);

  // Manipuladores de eventos
  const handleChartMove = useCallback((chartId, x, y) => {
    if (!isAdmin) return;
    
    setChartPositions(prev => {
      const newPositions = { ...prev, [chartId]: { ...prev[chartId], x, y } };
      scheduleLayoutSave(newPositions);
      return newPositions;
    });
  }, [scheduleLayoutSave, isAdmin]);

  const handleChartResize = useCallback((chartId, width, height) => {
    if (!isAdmin) return;
    
    setChartPositions(prev => {
      const newPositions = { ...prev, [chartId]: { ...prev[chartId], width, height } };
      scheduleLayoutSave(newPositions);
      return newPositions;
    });
  }, [scheduleLayoutSave, isAdmin]);

  const handleChartRemove = useCallback(async (chartId) => {
    if (!isAdmin) return;
    
    if (window.confirm("Remover este gráfico do dashboard?")) {
      try {
        setDashboardCharts(prev => prev.filter(chart => chart.id.toString() !== chartId.toString()));
        setChartPositions(prev => {
          const newPositions = { ...prev };
          delete newPositions[chartId];
          return newPositions;
        });
        setSelectedChart(null);

        // Atualiza o servidor
        const currentDashboard = await fetchDashboardData();
        const updatedLayout = (currentDashboard.layout || []).filter(
          item => item.chartId !== chartId.toString()
        );

        await fetch(`${API_BASE_URL}/dashboard`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ layout: updatedLayout }),
        });
      } catch (error) {
        console.error("Erro ao remover gráfico:", error);
      }
    }
  }, [fetchDashboardData, isAdmin]);

  const handleChartRefresh = useCallback(async (chartId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/graficos/${chartId}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const updatedChart = await response.json();

      setDashboardCharts(prev =>
        prev.map(chart => chart.id.toString() === chartId.toString() ? updatedChart : chart)
      );
    } catch (error) {
      console.error("Erro ao atualizar gráfico:", error);
    }
  }, []);

  const handleChartSelect = useCallback((chartId) => {
    if (!isAdmin) return;
    setSelectedChart(chartId);
  }, [isAdmin]);

  // Efeitos
  useEffect(() => {
    loadDashboard();
    fetchFinancialData();
  }, [loadDashboard, fetchFinancialData]);

  useEffect(() => {
    return () => {
      // Limpa qualquer salvamento pendente ao desmontar
      if (saveQueue.current.timeout) clearTimeout(saveQueue.current.timeout);
      if (saveQueue.current.idleCallback) cancelIdleCallback(saveQueue.current.idleCallback);
      if (saveQueue.current.pendingSave) saveLayout(saveQueue.current.pendingSave);
    };
  }, [saveLayout]);

  // Tela de carregamento
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#a243d2] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // Dashboard para usuários não-admin
  if (!isAdmin) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50 flex flex-col">
        <div className="w-full max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#a243d2]">Dashboard</h2>
              <p className="text-[#a243d2]">Visão geral financeira e gráficos compartilhados</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {summaryCards.map((card, index) => (
              <SummaryCard key={index} {...card} />
            ))}
          </div>

          <div className="relative w-full h-[calc(100vh-260px)] overflow-auto p-4 bg-white rounded-lg shadow">
            {dashboardCharts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardCharts.map(chart => (
                  <div key={chart.id} className="bg-white rounded-lg shadow p-4 h-[400px]">
                    <h3 className="text-lg font-medium text-[#a243d2] mb-2">{chart.title}</h3>
                    <div className="h-[calc(100%-40px)]">
                      <ChartRenderer
                        config={chart}
                        containerWidth={500}
                        containerHeight={350}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Nenhum gráfico compartilhado</h3>
                  <p className="text-sm text-gray-500">
                    Vá para a página de Relatórios e compartilhe um gráfico para começar
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Dashboard para admin
  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50 flex flex-col">
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#a243d2]">Dashboard</h2>
            <p className="text-[#a243d2]">Visão geral financeira e gráficos compartilhados</p>
          </div>
          <div className="flex items-center">
            {lastSaved && <p className="text-sm text-gray-500">Última atualização: {lastSaved.toLocaleTimeString()}</p>}
            {isSaving && <span className="text-xs text-gray-400 ml-2">Salvando...</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {summaryCards.map((card, index) => (
            <SummaryCard key={index} {...card} />
          ))}
        </div>

        <div
          ref={containerRef}
          className="relative w-full h-[calc(100vh-260px)] overflow-auto p-4 bg-white rounded-lg shadow"
          onClick={() => setSelectedChart(null)}
        >
          {dashboardCharts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Nenhum gráfico compartilhado</h3>
                <p className="text-sm text-gray-500">
                  Vá para a página de Relatórios e compartilhe um gráfico para começar
                </p>
              </div>
            </div>
          ) : (
            <>
              {dashboardCharts.map(chart => (
                <DraggableChart
                  key={chart.id}
                  chart={chart}
                  position={chartPositions[chart.id] || { x: 0, y: 0, width: 400, height: 300 }}
                  onMove={handleChartMove}
                  onResize={handleChartResize}
                  onRemove={handleChartRemove}
                  onRefresh={handleChartRefresh}
                  isSelected={selectedChart === chart.id}
                  onSelect={handleChartSelect}
                  isAdmin={isAdmin}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;