import React, { useState, useEffect, useRef, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ResponsiveContainer } from "recharts";
import { GripVertical, X as XIcon, RefreshCw, BarChart3, TrendingUp, TrendingDown, DollarSign, Building } from "lucide-react";
import { debounce } from 'lodash';
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "http://localhost:3001";

const ChartRenderer = ({ config, containerWidth, containerHeight }) => {
  const { type, data, dataKeys, xAxisKey, colors, showLegend, showGrid, showTooltip, legends = {} } = config;
  const chartHeight = containerHeight - 60;

  const commonProps = { data, width: containerWidth, height: chartHeight };
  const renderProps = { key: "key", dataKey: "dataKey", fill: "fill", stroke: "stroke", name: "name" };

  const charts = {
    bar: () => (
      <ResponsiveContainer width="100%" height="90%">
        <BarChart {...commonProps}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey={xAxisKey} />
          <YAxis />
          {showTooltip && <Tooltip />}
          {showLegend && <Legend />}
          {dataKeys.map((key, i) => (
            <Bar key={key} dataKey={key} fill={colors[i % colors.length]} name={legends[key] || key} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    ),
    line: () => (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <LineChart {...commonProps}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey={xAxisKey} />
          <YAxis />
          {showTooltip && <Tooltip />}
          {showLegend && <Legend />}
          {dataKeys.map((key, i) => (
            <Line key={key} type="monotone" dataKey={key} stroke={colors[i % colors.length]} name={legends[key] || key} strokeWidth={2} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    ),
    pie: () => (
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
            {data.map((_, i) => <Cell key={`cell-${i}`} fill={colors[i % colors.length]} />)}
          </Pie>
          {showTooltip && <Tooltip />}
          {showLegend && <Legend />}
        </PieChart>
      </ResponsiveContainer>
    ),
    area: () => (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <AreaChart {...commonProps}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey={xAxisKey} />
          <YAxis />
          {showTooltip && <Tooltip />}
          {showLegend && <Legend />}
          {dataKeys.map((key, i) => (
            <Area key={key} type="monotone" dataKey={key} stackId="1" stroke={colors[i % colors.length]} fill={colors[i % colors.length]} fillOpacity={0.6} name={legends[key] || key} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    )
  };

  return charts[type]?.() || (
    <div className="flex items-center justify-center h-full text-gray-500">
      Tipo de gráfico não suportado
    </div>
  );
};

const DraggableChart = ({ chart, position, onMove, onResize, onRemove, onRefresh, isSelected, onSelect, isAdmin }) => {
  const [dragState, setDragState] = useState({ isDragging: false, isResizing: false, dragStart: { x: 0, y: 0 }, resizeStart: { x: 0, y: 0, width: 0, height: 0 } });
  const cardRef = useRef(null);

  const handleMouseDown = (e, action) => {
    if (!isAdmin) return;
    
    e.preventDefault();
    onSelect(chart.id);

    if (action === "drag") {
      setDragState({
        isDragging: true,
        dragStart: { x: e.clientX - position.x, y: e.clientY - position.y },
        isResizing: false
      });
    } else if (action === "resize") {
      setDragState({
        isResizing: true,
        resizeStart: { x: e.clientX, y: e.clientY, width: position.width, height: position.height },
        isDragging: false
      });
      cardRef.current.classList.add('resizing');
    }
  };

  const handleMouseMove = useCallback((e) => {
    if (!isAdmin) return;
    
    if (dragState.isDragging) {
      const newX = Math.max(0, e.clientX - dragState.dragStart.x);
      const newY = Math.max(0, e.clientY - dragState.dragStart.y);
      onMove(chart.id, newX, newY);
    } else if (dragState.isResizing) {
      const deltaX = e.clientX - dragState.resizeStart.x;
      const deltaY = e.clientY - dragState.resizeStart.y;
      const newWidth = Math.max(300, dragState.resizeStart.width + deltaX);
      const newHeight = Math.max(200, dragState.resizeStart.height + deltaY);
      onResize(chart.id, newWidth, newHeight);
    }
  }, [dragState, isAdmin, chart.id, onMove, onResize]);

  const handleMouseUp = useCallback(() => {
    if (!isAdmin) return;
    
    if (dragState.isResizing) {
      cardRef.current?.classList.remove('resizing');
    }
    setDragState(prev => ({ ...prev, isDragging: false, isResizing: false }));
  }, [dragState, isAdmin]);

  useEffect(() => {
    if (dragState.isDragging || dragState.isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [dragState, handleMouseMove, handleMouseUp]);

  const cardClasses = `absolute bg-white rounded-lg shadow-lg border-2 transition-all duration-200 ${
    isSelected ? "border-[#a243d2] shadow-xl" : "border-gray-200 hover:border-gray-300"
  } ${dragState.isDragging ? "cursor-grabbing z-50" : "cursor-auto"}`;

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
        className={`flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg ${isAdmin ? "cursor-grab" : "cursor-default"}`}
        onMouseDown={isAdmin ? (e) => handleMouseDown(e, "drag") : undefined}
      >
        <div className="flex items-center gap-2">
          {isAdmin && <GripVertical size={16} className="text-gray-400" />}
          <span className="text-sm font-medium text-gray-700 truncate">{chart.title}</span>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onRefresh(chart.id); }}
              className="p-1 text-gray-500 hover:text-[#a243d2] rounded transition-colors"
              title="Atualizar dados"
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(chart.id); }}
              className="p-1 text-gray-500 hover:text-red-500 rounded transition-colors"
              title="Remover do dashboard"
            >
              <XIcon size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="p-4 h-full pb-8">
        <ChartRenderer config={chart} containerWidth={position.width - 32} containerHeight={position.height - 120} />
      </div>

      {isAdmin && (
        <>
          <div
            className="absolute bottom-0 right-0 w-4 h-4 bg-[#a243d2] rounded-tl-lg cursor-se-resize opacity-70 hover:opacity-100 transition-opacity"
            onMouseDown={(e) => handleMouseDown(e, "resize")}
            title="Redimensionar"
          />
          {isSelected && <div className="absolute -top-1 -left-1 w-3 h-3 bg-[#a243d2] rounded-full border-2 border-white" />}
        </>
      )}
    </div>
  );
};

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

const DashboardPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.papel === 'admin';
  const [state, setState] = useState({
    dashboardCharts: [],
    chartPositions: {},
    selectedChart: null,
    loading: true,
    lastSaved: null,
    isInitialized: false,
    isSaving: false,
    summaryData: {
      totalRevenue: 0,
      totalExpenses: 0,
      netBalance: 0,
      mostProfitableBranch: "Carregando..."
    }
  });

  const containerRef = useRef(null);
  const saveQueue = useRef({ timeout: null, idleCallback: null, pendingSave: null });

  const formatCurrency = (value) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const summaryCards = [
    {
      title: "Receitas Totais",
      value: formatCurrency(state.summaryData.totalRevenue),
      icon: <TrendingUp size={24} className="text-green-500" />,
      color: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      title: "Despesas Totais",
      value: formatCurrency(state.summaryData.totalExpenses),
      icon: <TrendingDown size={24} className="text-red-500" />,
      color: "bg-red-50",
      borderColor: "border-red-200"
    },
    {
      title: "Saldo Líquido",
      value: formatCurrency(state.summaryData.netBalance),
      icon: <DollarSign size={24} className={state.summaryData.netBalance >= 0 ? "text-blue-500" : "text-red-500"} />,
      color: state.summaryData.netBalance >= 0 ? "bg-blue-50" : "bg-red-50",
      borderColor: state.summaryData.netBalance >= 0 ? "border-blue-200" : "border-red-200"
    },
    {
      title: "Filial com Maior Lucro",
      value: state.summaryData.mostProfitableBranch,
      icon: <Building size={24} className="text-purple-500" />,
      color: "bg-purple-50",
      borderColor: "border-purple-200"
    }
  ];

  const fetchFinancialData = useCallback(async () => {
    try {
      const [vendas, despesas, filiais] = await Promise.all([
        fetch(`${API_BASE_URL}/vendas`).then(res => res.json()),
        fetch(`${API_BASE_URL}/despesas`).then(res => res.json()),
        fetch(`${API_BASE_URL}/filiais`).then(res => res.json()),
      ]);

      const totalRevenue = vendas.reduce((sum, v) => sum + v.valorTotal, 0);
      const totalExpenses = despesas.reduce((sum, d) => sum + d.valor, 0);
      const netBalance = totalRevenue - totalExpenses;

      const branchProfits = {};
      vendas.forEach(v => branchProfits[v.filialId] = (branchProfits[v.filialId] || 0) + v.valorTotal);
      despesas.forEach(d => branchProfits[d.filialId] = (branchProfits[d.filialId] || 0) - d.valor);

      const mostProfitableBranchId = Object.keys(branchProfits).reduce((a, b) => branchProfits[a] > branchProfits[b] ? a : b);
      const mostProfitableBranch = filiais.find(f => f.id === mostProfitableBranchId)?.nome || "N/A";

      setState(prev => ({
        ...prev,
        summaryData: { totalRevenue, totalExpenses, netBalance, mostProfitableBranch }
      }));
    } catch (error) {
      console.error("Erro ao buscar dados financeiros:", error);
    }
  }, []);

  const fetchData = useCallback(async (endpoint) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Erro ao buscar ${endpoint}:`, error);
      return endpoint === 'dashboard' ? { layout: [] } : [];
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    if (state.isInitialized) return;

    try {
      setState(prev => ({ ...prev, loading: true }));
      const [dashboardData, allCharts] = await Promise.all([
        fetchData('dashboard'),
        fetchData('graficos')
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

      setState(prev => ({
        ...prev,
        dashboardCharts: chartsInDashboard,
        chartPositions: positions,
        isInitialized: true,
        loading: false
      }));
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [state.isInitialized, fetchData]);

  const saveLayout = useCallback(async (positions) => {
    if (!isAdmin) return;
    
    try {
      setState(prev => ({ ...prev, isSaving: true }));
      const layout = Object.entries(positions).map(([chartId, position]) => ({ chartId, ...position }));

      await fetch(`${API_BASE_URL}/dashboard`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layout }),
      });

      setState(prev => ({ ...prev, lastSaved: new Date(), isSaving: false }));
    } catch (error) {
      console.error("Erro ao salvar layout:", error);
      setState(prev => ({ ...prev, isSaving: false }));
    }
  }, [isAdmin]);

  const scheduleLayoutSave = useCallback((positions) => {
    if (!isAdmin) return;
    
    if (saveQueue.current.timeout) clearTimeout(saveQueue.current.timeout);
    if (saveQueue.current.idleCallback) cancelIdleCallback(saveQueue.current.idleCallback);

    saveQueue.current.pendingSave = positions;
    saveQueue.current.timeout = setTimeout(() => {
      saveQueue.current.idleCallback = requestIdleCallback(
        () => { saveQueue.current.pendingSave && saveLayout(saveQueue.current.pendingSave); },
        { timeout: 1000 }
      );
    }, 800);
  }, [saveLayout, isAdmin]);

  const handleChartAction = useCallback((action, chartId, ...args) => {
    if (!isAdmin) return;
    
    if (action === 'move') {
      setState(prev => {
        const newPositions = { ...prev.chartPositions, [chartId]: { ...prev.chartPositions[chartId], x: args[0], y: args[1] } };
        scheduleLayoutSave(newPositions);
        return { ...prev, chartPositions: newPositions };
      });
    } else if (action === 'resize') {
      setState(prev => {
        const newPositions = { ...prev.chartPositions, [chartId]: { ...prev.chartPositions[chartId], width: args[0], height: args[1] } };
        scheduleLayoutSave(newPositions);
        return { ...prev, chartPositions: newPositions };
      });
    } else if (action === 'select') {
      setState(prev => ({ ...prev, selectedChart: chartId }));
    }
  }, [scheduleLayoutSave, isAdmin]);

  const handleChartRemove = useCallback(async (chartId) => {
    if (!isAdmin || !window.confirm("Remover este gráfico do dashboard?")) return;
    
    try {
      const currentDashboard = await fetchData('dashboard');
      const updatedLayout = (currentDashboard.layout || []).filter(item => item.chartId !== chartId.toString());

      await fetch(`${API_BASE_URL}/dashboard`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layout: updatedLayout }),
      });

      setState(prev => ({
        ...prev,
        dashboardCharts: prev.dashboardCharts.filter(chart => chart.id.toString() !== chartId.toString()),
        chartPositions: Object.fromEntries(Object.entries(prev.chartPositions).filter(([id]) => id !== chartId.toString())),
        selectedChart: null
      }));
    } catch (error) {
      console.error("Erro ao remover gráfico:", error);
    }
  }, [fetchData, isAdmin]);

  const handleChartRefresh = useCallback(async (chartId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/graficos/${chartId}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const updatedChart = await response.json();

      setState(prev => ({
        ...prev,
        dashboardCharts: prev.dashboardCharts.map(chart => chart.id.toString() === chartId.toString() ? updatedChart : chart)
      }));
    } catch (error) {
      console.error("Erro ao atualizar gráfico:", error);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    fetchFinancialData();
  }, [loadDashboard, fetchFinancialData]);

  useEffect(() => {
    return () => {
      if (saveQueue.current.timeout) clearTimeout(saveQueue.current.timeout);
      if (saveQueue.current.idleCallback) cancelIdleCallback(saveQueue.current.idleCallback);
      if (saveQueue.current.pendingSave) saveLayout(saveQueue.current.pendingSave);
    };
  }, [saveLayout]);

  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#a243d2] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

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
            {summaryCards.map((card, i) => <SummaryCard key={i} {...card} />)}
          </div>

          <div className="relative w-full h-[calc(100vh-260px)] overflow-auto p-4 bg-white rounded-lg shadow">
            {state.dashboardCharts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {state.dashboardCharts.map(chart => (
                  <div key={chart.id} className="bg-white rounded-lg shadow p-4 h-[400px]">
                    <h3 className="text-lg font-medium text-[#a243d2] mb-2">{chart.title}</h3>
                    <div className="h-[calc(100%-40px)]">
                      <ChartRenderer config={chart} containerWidth={500} containerHeight={350} />
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50 flex flex-col">
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#a243d2]">Dashboard</h2>
            <p className="text-[#a243d2]">Visão geral financeira e gráficos compartilhados</p>
          </div>
          <div className="flex items-center">
            {state.lastSaved && <p className="text-sm text-gray-500">Última atualização: {state.lastSaved.toLocaleTimeString()}</p>}
            {state.isSaving && <span className="text-xs text-gray-400 ml-2">Salvando...</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {summaryCards.map((card, i) => <SummaryCard key={i} {...card} />)}
        </div>

        <div
          ref={containerRef}
          className="relative w-full h-[calc(100vh-260px)] overflow-auto p-4 bg-white rounded-lg shadow"
          onClick={() => setState(prev => ({ ...prev, selectedChart: null }))}
        >
          {state.dashboardCharts.length === 0 ? (
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
            state.dashboardCharts.map(chart => (
              <DraggableChart
                key={chart.id}
                chart={chart}
                position={state.chartPositions[chart.id] || { x: 0, y: 0, width: 400, height: 300 }}
                onMove={(id, x, y) => handleChartAction('move', id, x, y)}
                onResize={(id, w, h) => handleChartAction('resize', id, w, h)}
                onRemove={handleChartRemove}
                onRefresh={handleChartRefresh}
                isSelected={state.selectedChart === chart.id}
                onSelect={(id) => handleChartAction('select', id)}
                isAdmin={isAdmin}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;