import React, { useState } from "react";
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
} from "lucide-react";

const ChartCustomizer = ({ config, onChange, onCancel, onSave }) => {
  const [activeColorIndex, setActiveColorIndex] = useState(null);
  const [editingTitle, setEditingTitle] = useState(false);

  const chartTypes = [
    { type: "bar", icon: <BarChart size={20} />, label: "Barras" },
    { type: "line", icon: <LineChart size={20} />, label: "Linhas" },
    { type: "area", icon: <AreaChart size={20} />, label: "Área" },
    { type: "pie", icon: <PieChart size={20} />, label: "Pizza" },
    { type: "scatter", icon: <ScatterChart size={20} />, label: "Dispersão" },
  ];

  const getAvailableFields = () => {
    if (!config.data || config.data.length === 0) return [];

    const sampleItem = config.data[0];
    const fields = Object.keys(sampleItem);

    return fields
      .filter(
        (field) =>
          typeof sampleItem[field] === "string" ||
          typeof sampleItem[field] === "number"
      )
      .sort((a, b) => {
        const aIsLabel = a.endsWith("_label") ? -1 : 1;
        const bIsLabel = b.endsWith("_label") ? -1 : 1;
        return aIsLabel - bIsLabel;
      });
  };

  const getNumericFields = () => {
    if (!config.data || config.data.length === 0) return [];

    const sampleItem = config.data[0];
    return Object.keys(sampleItem).filter(
      (key) => typeof sampleItem[key] === "number"
    );
  };

  const handleTitleChange = (e) => {
    onChange({ ...config, title: e.target.value });
  };

  const handleTypeChange = (type) => {
    onChange({ ...config, type });
  };

  const handleXAxisChange = (e) => {
    onChange({ ...config, xAxisKey: e.target.value });
  };

  const handleDataKeyToggle = (key) => {
    const updatedDataKeys = config.dataKeys.includes(key)
      ? config.dataKeys.filter((k) => k !== key)
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
    onChange({ ...config, colors: [...config.colors, "#000000"] });
    setActiveColorIndex(config.colors.length);
  };

  const handleRemoveColor = (index) => {
    const newColors = [...config.colors];
    newColors.splice(index, 1);
    onChange({ ...config, colors: newColors });
    setActiveColorIndex(null);
  };

  const handleDimensionChange = (dimension, value) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      onChange({ ...config, [dimension]: numValue });
    }
  };

  const toggleLegend = () => {
    onChange({ ...config, showLegend: !config.showLegend });
  };

  const handleLegendPositionChange = (e) => {
    onChange({
      ...config,
      legendPosition: e.target.value,
    });
  };

  const toggleGrid = () => {
    onChange({ ...config, showGrid: !config.showGrid });
  };

  const toggleTooltip = () => {
    onChange({ ...config, showTooltip: !config.showTooltip });
  };

  const availableXAxisKeys = getAvailableFields();
  const availableYAxisKeys = getNumericFields();

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          {editingTitle ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                type="text"
                value={config.title}
                onChange={handleTitleChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                onClick={() => setEditingTitle(false)}
                className="p-2 text-green-600 hover:bg-green-50 rounded-full"
              >
                <Check size={16} />
              </button>
            </div>
          ) : (
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              {config.title}
              <button
                onClick={() => setEditingTitle(true)}
                className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full"
              >
                <PenLine size={14} />
              </button>
            </h2>
          )}

          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2 bg-[#a243d2] text-white rounded-md hover:bg-[#8a36b5]"
            >
              Salvar Gráfico
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Tipo de Gráfico
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {chartTypes.map(({ type, icon, label }) => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`flex flex-col items-center justify-center py-3 px-4 rounded-md transition-colors ${
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

        <div>
          <div className="mb-4">
            <label
              htmlFor="xAxis"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Eixo X
            </label>
            <select
              id="xAxis"
              value={config.xAxisKey}
              onChange={handleXAxisChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#a243d2] focus:border-[#a243d2]"
            >
              <option value="">Selecione o campo do eixo X</option>
              {availableXAxisKeys.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>

          <div>
            <h3 className="block text-sm font-medium text-gray-700 mb-2">
              Campos Eixo Y
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availableYAxisKeys.map((key) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.dataKeys.includes(key)}
                    onChange={() => handleDataKeyToggle(key)}
                    className="h-4 w-4 text-[#a243d2] focus:ring-[#a243d2] border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{key}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Dimensões do Gráfico
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="width"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Largura (px)
              </label>
              <input
                id="width"
                type="number"
                min="200"
                max="1200"
                value={config.width}
                onChange={(e) => handleDimensionChange("width", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#a243d2] focus:border-[#a243d2]"
              />
            </div>
            <div>
              <label
                htmlFor="height"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Altura (px)
              </label>
              <input
                id="height"
                type="number"
                min="200"
                max="1200"
                value={config.height}
                onChange={(e) =>
                  handleDimensionChange("height", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#a243d2] focus:border-[#a243d2]"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Opções de gráfico
          </h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.showLegend}
                onChange={toggleLegend}
                className="h-4 w-4 text-[#a243d2] focus:ring-[#a243d2] border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Mostrar Legendas
              </span>
            </label>

            {config.showLegend && (
              <div>
                <label
                  htmlFor="legendPosition"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Posição de legendas
                </label>
                <select
                  id="legendPosition"
                  value={config.legendPosition}
                  onChange={handleLegendPositionChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#a243d2] focus:border-[#a243d2]"
                >
                  <option value="top">Topo</option>
                  <option value="right">Direita</option>
                  <option value="bottom">Baixo</option>
                  <option value="left">Esquerda</option>
                </select>
              </div>
            )}

            {config.type !== "pie" && (
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.showGrid}
                  onChange={toggleGrid}
                  className="h-4 w-4 text-[#a243d2] focus:ring-[#a243d2] border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Mostrar Grade
                </span>
              </label>
            )}

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.showTooltip}
                onChange={toggleTooltip}
                className="h-4 w-4 text-[#a243d2] focus:ring-[#a243d2] border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Mostrar Tooltip
              </span>
            </label>
          </div>
        </div>

        <div className="md:col-span-2">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Cores do Gráfico
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
              />
            ))}
            <button
              onClick={handleAddColor}
              className="h-8 w-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-500"
              title="Add color"
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
  );
};

export default ChartCustomizer;
