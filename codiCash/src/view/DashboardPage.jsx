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
  Plus,
  BarChart3,
} from "lucide-react";

const API_BASE_URL = "http://localhost:3001";

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
  } = config;

  const chartHeight = containerHeight - 60;

  const commonProps = {
    data,
    width: containerWidth,
    height: chartHeight,
  };

  switch (type) {
    case "bar":
      return (
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
                name={key}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );

    case "line":
      return (
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
                strokeWidth={2}
                name={key}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );

    case "pie":
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={Math.min(containerWidth, chartHeight) / 4}
              fill="#8884d8"
              dataKey={dataKeys[0]}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
          </PieChart>
        </ResponsiveContainer>
      );

    case "area":
      return (
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
                name={key}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      );

    default:
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          Tipo de gráfico não suportado
        </div>
      );
  }
};

const DraggableChart = ({
  chart,
  position,
  onMove,
  onResize,
  onRemove,
  onRefresh,
  isSelected,
  onSelect,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const cardRef = useRef(null);

  const handleMouseDown = (e, type) => {
    e.preventDefault();
    onSelect(chart.id);

    if (type === "drag") {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    } else if (type === "resize") {
      setIsResizing(true);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: position.width,
        height: position.height,
      });
    }
  };

  const handleMouseMove = (e) => {
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
    setIsDragging(false);
    setIsResizing(false);
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

  return (
    <div
      ref={cardRef}
      className={`absolute bg-white rounded-lg shadow-lg border-2 transition-all duration-200 ${
        isSelected
          ? "border-[#a243d2] shadow-xl"
          : "border-gray-200 hover:border-gray-300"
      } ${isDragging ? "cursor-grabbing z-50" : "cursor-auto"}`}
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
        className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg cursor-grab"
        onMouseDown={(e) => handleMouseDown(e, "drag")}
      >
        <div className="flex items-center gap-2">
          <GripVertical size={16} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-700 truncate">
            {chart.title}
          </span>
        </div>

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
      </div>

      <div className="p-4 h-full pb-8">
        <ChartRenderer
          config={chart}
          containerWidth={position.width - 32}
          containerHeight={position.height - 120}
        />
      </div>

      <div
        className="absolute bottom-0 right-0 w-4 h-4 bg-[#a243d2] rounded-tl-lg cursor-se-resize opacity-70 hover:opacity-100 transition-opacity"
        onMouseDown={(e) => handleMouseDown(e, "resize")}
        title="Redimensionar"
      />

      {isSelected && (
        <div className="absolute -top-1 -left-1 w-3 h-3 bg-[#a243d2] rounded-full border-2 border-white" />
      )}
    </div>
  );
};

const DashboardPage = () => {
  const [dashboardCharts, setDashboardCharts] = useState([]);
  const [chartPositions, setChartPositions] = useState({});
  const [selectedChart, setSelectedChart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const containerRef = useRef(null);
  const debouncedSave = useRef(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Erro ao buscar dados do dashboard:", error);
      return { layout: [] };
    }
  }, []);

  const fetchAllCharts = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/graficos`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Erro ao buscar gráficos:", error);
      return [];
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    if (isInitialized) return;

    try {
      setLoading(true);

      const [dashboardData, allCharts] = await Promise.all([
        fetchDashboardData(),
        fetchAllCharts(),
      ]);

      const dashboardLayout = dashboardData.layout || [];

      const chartsInDashboard = allCharts.filter((chart) =>
        dashboardLayout.some(
          (item) => Number(item.chartId) === Number(chart.id)
        )
      );

      const positions = {};
      dashboardLayout.forEach((item) => {
        positions[item.chartId] = {
          x: item.x || 0,
          y: item.y || 0,
          width: item.width || 400,
          height: item.height || 300,
        };
      });

      console.log("Dashboard carregado:", {
        dashboardLayout,
        chartsInDashboard,
        positions,
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

  const saveLayout = useCallback(async (positions) => {
    try {
      const layout = Object.entries(positions).map(([chartId, position]) => ({
        chartId,
        x: position.x,
        y: position.y,
        width: position.width,
        height: position.height,
      }));

      const response = await fetch(`${API_BASE_URL}/dashboard`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ layout }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setLastSaved(new Date());
      console.log("Layout salvo com sucesso:", layout);
    } catch (error) {
      console.error("Erro ao salvar layout:", error);
    }
  }, []);

  const scheduleLayoutSave = useCallback(
    (positions) => {
      if (debouncedSave.current) {
        clearTimeout(debouncedSave.current);
      }
      debouncedSave.current = setTimeout(() => {
        saveLayout(positions);
      }, 1000);
    },
    [saveLayout]
  );

  const handleChartMove = useCallback(
    (chartId, x, y) => {
      setChartPositions((prevPositions) => {
        const newPositions = {
          ...prevPositions,
          [chartId]: {
            ...prevPositions[chartId],
            x,
            y,
          },
        };
        scheduleLayoutSave(newPositions);
        return newPositions;
      });
    },
    [scheduleLayoutSave]
  );

  const handleChartResize = useCallback(
    (chartId, width, height) => {
      setChartPositions((prevPositions) => {
        const newPositions = {
          ...prevPositions,
          [chartId]: {
            ...prevPositions[chartId],
            width,
            height,
          },
        };
        scheduleLayoutSave(newPositions);
        return newPositions;
      });
    },
    [scheduleLayoutSave]
  );

  const handleChartRemove = useCallback(
    async (chartId) => {
      if (window.confirm("Remover este gráfico do dashboard?")) {
        try {
          setDashboardCharts((prevCharts) =>
            prevCharts.filter(
              (chart) => chart.id.toString() !== chartId.toString()
            )
          );

          setChartPositions((prevPositions) => {
            const newPositions = { ...prevPositions };
            delete newPositions[chartId];
            return newPositions;
          });

          setSelectedChart(null);

          const currentDashboard = await fetchDashboardData();
          const updatedLayout = (currentDashboard.layout || []).filter(
            (item) => item.chartId !== chartId.toString()
          );

          await fetch(`${API_BASE_URL}/dashboard`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ layout: updatedLayout }),
          });

          console.log("Gráfico removido do dashboard:", chartId);
        } catch (error) {
          console.error("Erro ao remover gráfico:", error);
        }
      }
    },
    [fetchDashboardData]
  );

  const handleChartRefresh = useCallback(async (chartId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/graficos/${chartId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const updatedChart = await response.json();

      setDashboardCharts((prevCharts) =>
        prevCharts.map((chart) =>
          chart.id.toString() === chartId.toString() ? updatedChart : chart
        )
      );

      console.log("Gráfico atualizado:", updatedChart);
    } catch (error) {
      console.error("Erro ao atualizar gráfico:", error);
    }
  }, []);

  const handleChartSelect = useCallback((chartId) => {
    setSelectedChart(chartId);
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    return () => {
      if (debouncedSave.current) {
        clearTimeout(debouncedSave.current);
      }
    };
  }, []);

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

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50 flex flex-col ">
      <div className="w-full max-w-6xl flex flex-col items-center">
        <h2 className="text-2xl font-bold text-[#a243d2] w-full text-left">
          Dashboard
        </h2>
        <div className="flex flex-row justify-between w-full">
          <p className="text-[#a243d2] text-left w-full">
            Compartilhe gráficos da página de Relatórios para visualizá-los aqui
          </p>
          {lastSaved && (
            <p className="text-sm text-gray-500 text-right">
              Última atualização: {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative w-full h-screen overflow-auto p-6"
        onClick={() => setSelectedChart(null)}
      >
        {dashboardCharts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Nenhum gráfico compartilhado
              </h3>
              <p className="text-sm text-gray-500">
                Vá para a página de Relatórios e compartilhe um gráfico para
                começar
              </p>
            </div>
          </div>
        ) : (
          <>
            {dashboardCharts.map((chart) => (
              <DraggableChart
                key={chart.id}
                chart={chart}
                position={
                  chartPositions[chart.id] || {
                    x: 0,
                    y: 0,
                    width: 400,
                    height: 300,
                  }
                }
                onMove={handleChartMove}
                onResize={handleChartResize}
                onRemove={handleChartRemove}
                onRefresh={handleChartRefresh}
                isSelected={selectedChart === chart.id}
                onSelect={handleChartSelect}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
