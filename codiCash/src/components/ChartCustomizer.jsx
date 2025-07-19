import React, { useState, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import {
  BarChart,
  LineChart,
  AreaChart,
  PieChart,
  ScatterChart,
  Plus,
  Minus,
  Check,
  PenLine,
  AlertCircle,
} from "lucide-react";

const CHART_TYPES = [
  { type: "bar", icon: <BarChart size={20} />, label: "Barras" },
  { type: "line", icon: <LineChart size={20} />, label: "Linhas" },
  { type: "area", icon: <AreaChart size={20} />, label: "Área" },
  { type: "pie", icon: <PieChart size={20} />, label: "Pizza" },
  { type: "scatter", icon: <ScatterChart size={20} />, label: "Dispersão" },
];

const LEGEND_POSITIONS = [
  { value: "top", label: "Topo" },
  { value: "right", label: "Direita" },
  { value: "bottom", label: "Baixo" },
  { value: "left", label: "Esquerda" },
];

const ChartCustomizer = ({ config, onChange, onCancel, onSave }) => {
  const [activeColorIndex, setActiveColorIndex] = useState(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingLegend, setEditingLegend] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const newErrors = {};
    
    if (!config.title?.trim()) {
      newErrors.title = "Título é obrigatório";
    }
    
    if (!config.xAxisKey) {
      newErrors.xAxisKey = "Selecione um campo para o eixo X";
    }
    
    if (!config.dataKeys?.length) {
      newErrors.dataKeys = "Selecione pelo menos um campo para o eixo Y";
    }
    
    setErrors(newErrors);
  }, [config]);

  const getAvailableFields = () => {
    if (!config.data || !config.data.length) return [];
    
    const sampleItem = config.data[0];
    return Object.keys(sampleItem)
      .filter(field => typeof sampleItem[field] === "string" || typeof sampleItem[field] === "number")
      .sort((a, b) => (a.endsWith("_label") ? -1 : 1) - (b.endsWith("_label") ? -1 : 1));
  };

  const getNumericFields = () => {
    if (!config.data || !config.data.length) return [];
    const sampleItem = config.data[0];
    return Object.keys(sampleItem).filter(key => typeof sampleItem[key] === "number");
  };

  const handleTitleChange = (e) => {
    onChange({ ...config, title: e.target.value });
  };

  const handleTypeChange = (type) => {
    const updates = { type };
    
    if (type === "pie" && config.showGrid) {
      updates.showGrid = false;
    }
    
    onChange({ ...config, ...updates });
  };

  const handleXAxisChange = (e) => {
    onChange({ ...config, xAxisKey: e.target.value });
  };

  const handleDataKeyToggle = (key) => {
    const updatedDataKeys = config.dataKeys.includes(key)
      ? config.dataKeys.filter(k => k !== key)
      : [...config.dataKeys, key];
    
    onChange({ ...config, dataKeys: updatedDataKeys });
  };

  const handleColorChange = (color) => {
    if (activeColorIndex !== null) {
      const newColors = [...config.colors];
      newColors[activeColorIndex] = color;
      onChange({ ...config, colors: newColors });
    }
  };

  const handleAddColor = () => {
    onChange({ 
      ...config, 
      colors: [...config.colors, `#${Math.floor(Math.random()*16777215).toString(16)}`] 
    });
    setActiveColorIndex(config.colors.length);
  };

  const handleRemoveColor = (index) => {
    if (config.colors.length <= 1) return;
    
    const newColors = [...config.colors];
    newColors.splice(index, 1);
    onChange({ ...config, colors: newColors });
    setActiveColorIndex(null);
  };

  const handleDimensionChange = (dimension, value) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      const clampedValue = Math.min(Math.max(numValue, 200), 1200);
      onChange({ ...config, [dimension]: clampedValue });
    }
  };

  const handleLegendChange = (key, newName) => {
    const updatedLegends = { ...config.legends, [key]: newName };
    onChange({ ...config, legends: updatedLegends });
  };

  const toggleOption = (option) => {
    onChange({ ...config, [option]: !config[option] });
  };

  const handleSave = () => {
    if (Object.keys(errors).length === 0) {
      onSave();
    }
  };

  const availableXAxisKeys = getAvailableFields();
  const availableYAxisKeys = getNumericFields();

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
      {/* Cabeçalho */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center gap-4">
          {/* Título editável */}
          <div className="flex-1 min-w-0">
            {editingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={config.title}
                  onChange={handleTitleChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#a243d2]"
                  autoFocus
                  onBlur={() => setEditingTitle(false)}
                  onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
                />
                <button
                  onClick={() => setEditingTitle(false)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                >
                  <Check size={16} />
                </button>
              </div>
            ) : (
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 truncate">
                {config.title}
                <button
                  onClick={() => setEditingTitle(true)}
                  className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                >
                  <PenLine size={14} />
                </button>
              </h2>
            )}
            {errors.title && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.title}
              </p>
            )}
          </div>

          {/* Botões de ação */}
          <div className="flex gap-2 shrink-0">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={Object.keys(errors).length > 0}
              className={`px-4 py-2 rounded-md transition-colors ${
                Object.keys(errors).length > 0
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#a243d2] text-white hover:bg-[#8a36b5]"
              }`}
            >
              Salvar Gráfico
            </button>
          </div>
        </div>
      </div>

      {/* Corpo do formulário */}
      <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Seção: Tipo de Gráfico */}
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <BarChart size={16} />
              Tipo de Gráfico
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {CHART_TYPES.map(({ type, icon, label }) => (
                <button
                  key={type}
                  onClick={() => handleTypeChange(type)}
                  className={`flex flex-col items-center justify-center py-3 px-2 rounded-md transition-colors ${
                    config.type === type
                      ? "bg-[#a243d2] text-white"
                      : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {icon}
                  <span className="text-xs mt-1">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Seção: Eixos */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Eixo X (Categorias)
              </h3>
              <select
                value={config.xAxisKey || ""}
                onChange={handleXAxisChange}
                className={`w-full px-3 py-2 border ${
                  errors.xAxisKey ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-[#a243d2] focus:border-[#a243d2]`}
              >
                <option value="">Selecione o campo do eixo X</option>
                {availableXAxisKeys.map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
              {errors.xAxisKey && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.xAxisKey}
                </p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Eixo Y (Valores)
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto p-1">
                {availableYAxisKeys.length > 0 ? (
                  availableYAxisKeys.map((key) => (
                    <div key={key} className="flex items-center justify-between">
                      <label className="flex items-center flex-1 gap-2">
                        <input
                          type="checkbox"
                          checked={config.dataKeys.includes(key)}
                          onChange={() => handleDataKeyToggle(key)}
                          className="h-4 w-4 text-[#a243d2] focus:ring-[#a243d2] border-gray-300 rounded"
                        />
                        {editingLegend === key ? (
                          <input
                            type="text"
                            value={config.legends?.[key] || key}
                            onChange={(e) => handleLegendChange(key, e.target.value)}
                            onBlur={() => setEditingLegend(null)}
                            onKeyDown={(e) => e.key === "Enter" && setEditingLegend(null)}
                            autoFocus
                            className="flex-1 text-sm text-gray-700 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#a243d2]"
                          />
                        ) : (
                          <span
                            className="text-sm text-gray-700 flex-1 truncate"
                            onClick={() => setEditingLegend(key)}
                            title="Clique para editar a legenda"
                          >
                            {config.legends?.[key] || key}
                          </span>
                        )}
                      </label>
                      <button
                        onClick={() => setEditingLegend(key)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Editar legenda"
                      >
                        <PenLine size={14} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    Nenhum campo numérico disponível
                  </p>
                )}
              </div>
              {errors.dataKeys && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.dataKeys}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Seção: Configurações de exibição */}
        <div className="space-y-6">
          {/* Dimensões */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Dimensões do Gráfico
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Largura (px)
                </label>
                <input
                  type="number"
                  min="200"
                  max="1200"
                  value={config.width}
                  onChange={(e) => handleDimensionChange("width", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#a243d2] focus:border-[#a243d2]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Altura (px)
                </label>
                <input
                  type="number"
                  min="200"
                  max="1200"
                  value={config.height}
                  onChange={(e) => handleDimensionChange("height", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#a243d2] focus:border-[#a243d2]"
                />
              </div>
            </div>
          </div>

          {/* Opções de exibição */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Opções de Exibição
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.showLegend}
                    onChange={() => toggleOption("showLegend")}
                    className="h-4 w-4 text-[#a243d2] focus:ring-[#a243d2] border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Mostrar Legendas</span>
                </label>
              </div>

              {config.showLegend && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Posição das Legendas
                  </label>
                  <select
                    value={config.legendPosition}
                    onChange={(e) => onChange({ ...config, legendPosition: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#a243d2] focus:border-[#a243d2]"
                  >
                    {LEGEND_POSITIONS.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {config.type !== "pie" && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.showGrid}
                      onChange={() => toggleOption("showGrid")}
                      className="h-4 w-4 text-[#a243d2] focus:ring-[#a243d2] border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Mostrar Grade</span>
                  </label>
                </div>
              )}

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.showTooltip}
                    onChange={() => toggleOption("showTooltip")}
                    className="h-4 w-4 text-[#a243d2] focus:ring-[#a243d2] border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Mostrar Tooltip</span>
                </label>
              </div>
            </div>
          </div>

          {/* Cores */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Paleta de Cores
            </h3>
            <div className="flex flex-wrap gap-3 mb-4">
              {config.colors.map((color, index) => (
                <button
                  key={index}
                  onClick={() => setActiveColorIndex(index)}
                  className={`h-8 w-8 rounded-full border-2 transition-all ${
                    activeColorIndex === index
                      ? "border-gray-900 scale-110"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                  style={{ backgroundColor: color }}
                  title={`Cor ${index + 1}`}
                />
              ))}
              <button
                onClick={handleAddColor}
                className="h-8 w-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-500"
                title="Adicionar cor"
              >
                <Plus size={14} />
              </button>
            </div>

            {activeColorIndex !== null && (
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-600">
                    Editando Cor {activeColorIndex + 1}
                  </span>
                  <button
                    onClick={() => handleRemoveColor(activeColorIndex)}
                    disabled={config.colors.length <= 1}
                    className={`p-1 rounded-full ${
                      config.colors.length > 1
                        ? "text-red-500 hover:bg-red-50"
                        : "text-gray-300 cursor-not-allowed"
                    }`}
                    title="Remover cor"
                  >
                    <Minus size={14} />
                  </button>
                </div>
                <HexColorPicker
                  color={config.colors[activeColorIndex]}
                  onChange={handleColorChange}
                  style={{ width: "100%" }}
                />
                <input
                  type="text"
                  value={config.colors[activeColorIndex]}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="mt-3 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#a243d2] focus:border-[#a243d2]"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartCustomizer;