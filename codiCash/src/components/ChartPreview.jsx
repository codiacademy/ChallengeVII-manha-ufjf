import React, { useRef } from "react";
import { 
  BarChart, LineChart, AreaChart, PieChart, ScatterChart,
  Bar, Line, Area, Pie, Scatter, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell
} from "recharts";
import { Download } from "lucide-react";
import { toPng } from 'html-to-image';

const ChartPreview = ({ config, showExport, containerClassName, isModal = false }) => {
  const chartRef = useRef(null);
  
  const handleExportChart = async () => {
    if (!chartRef.current) return;
    
    try {
      console.log("Exporting chart:", config.title);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const dataUrl = await toPng(chartRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: 'white'
      });
      
      const link = document.createElement('a');
      link.download = `${config.title || 'grafico'}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Erro ao exportar gráfico:', error);
      alert('Ocorreu um erro ao exportar o gráfico. Por favor, tente novamente.');
    }
  };

  const prepareChartData = () => {
    if (!config?.data || !config.xAxisKey || !config.dataKeys || config.dataKeys.length === 0) {
      return [];
    }
    
    if (config.type === 'pie') {
      const groups = {};
      config.data.forEach(item => {
        const key = item[config.xAxisKey];
        const value = item[config.dataKeys[0]] || 0;
        groups[key] = (groups[key] || 0) + value;
      });
      
      return Object.keys(groups).map(key => ({
        [config.xAxisKey]: key,
        [config.dataKeys[0]]: groups[key]
      }));
    }
    
    return config.data;
  };

  const renderChart = () => {
    if (!config) {
      return (
        <div className="flex items-center justify-center h-full border border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-400">Configuração não disponível</p>
        </div>
      );
    }

    const chartData = prepareChartData();
    
    if (chartData.length === 0 || !config.xAxisKey || !config.dataKeys || config.dataKeys.length === 0) {
      return (
        <div className="flex items-center justify-center h-full border border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-400">Dados não disponíveis ou configuração incompleta</p>
        </div>
      );
    }

    const commonProps = {
      data: chartData,
      margin: isModal ? { top: 20, right: 30, left: 20, bottom: 20 } : { top: 20, right: 30, left: 20, bottom: 20 }
    };

    const legendProps = config.showLegend ? {
      layout: config.legendPosition === 'left' || config.legendPosition === 'right' ? 'vertical' : 'horizontal',
      align: config.legendPosition === 'right' ? 'right' : (config.legendPosition === 'left' ? 'left' : 'center'),
      verticalAlign: config.legendPosition === 'top' ? 'top' : (config.legendPosition === 'bottom' ? 'bottom' : 'middle')
    } : {};

    switch (config.type) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis 
              dataKey={config.xAxisKey} 
              angle={isModal && chartData.length > 10 ? -45 : 0}
              textAnchor={isModal && chartData.length > 10 ? "end" : "middle"}
              height={isModal && chartData.length > 10 ? 80 : 60}
            />
            <YAxis />
            {config.showTooltip && <Tooltip />}
            {config.showLegend && <Legend {...legendProps} />}
            {config.dataKeys.map((key, index) => (
              <Bar 
                key={key} 
                dataKey={key} 
                fill={config.colors[index % config.colors.length]} 
                name={key} 
              />
            ))}
          </BarChart>
        );
      
      case 'line':
        return (
          <LineChart {...commonProps}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis 
              dataKey={config.xAxisKey} 
              angle={isModal && chartData.length > 10 ? -45 : 0}
              textAnchor={isModal && chartData.length > 10 ? "end" : "middle"}
              height={isModal && chartData.length > 10 ? 80 : 60}
            />
            <YAxis />
            {config.showTooltip && <Tooltip />}
            {config.showLegend && <Legend {...legendProps} />}
            {config.dataKeys.map((key, index) => (
              <Line 
                key={key} 
                type="monotone" 
                dataKey={key} 
                stroke={config.colors[index % config.colors.length]} 
                name={key} 
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        );
      
      case 'area':
        return (
          <AreaChart {...commonProps}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis 
              dataKey={config.xAxisKey} 
              angle={isModal && chartData.length > 10 ? -45 : 0}
              textAnchor={isModal && chartData.length > 10 ? "end" : "middle"}
              height={isModal && chartData.length > 10 ? 80 : 60}
            />
            <YAxis />
            {config.showTooltip && <Tooltip />}
            {config.showLegend && <Legend {...legendProps} />}
            {config.dataKeys.map((key, index) => (
              <Area 
                key={key} 
                type="monotone" 
                dataKey={key} 
                fill={config.colors[index % config.colors.length]}
                stroke={config.colors[index % config.colors.length]}
                fillOpacity={0.6} 
                name={key} 
              />
            ))}
          </AreaChart>
        );
      
      case 'pie':
        return (
          <PieChart {...commonProps}>
            {config.showTooltip && <Tooltip />}
            {config.showLegend && <Legend {...legendProps} />}
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={isModal ? Math.min(120, 80) : 80}
              label={!isModal || chartData.length <= 8}
              dataKey={config.dataKeys[0]}
              nameKey={config.xAxisKey}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={config.colors[index % config.colors.length]} />
              ))}
            </Pie>
          </PieChart>
        );
      
      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis type="number" dataKey={config.dataKeys[0]} name={config.dataKeys[0]} />
            <YAxis type="number" dataKey={config.dataKeys[1]} name={config.dataKeys[1]} />
            {config.showTooltip && <Tooltip cursor={{ strokeDasharray: '3 3' }} />}
            {config.showLegend && <Legend {...legendProps} />}
            <Scatter 
              name={`${config.dataKeys[0]} vs ${config.dataKeys[1]}`} 
              data={chartData} 
              fill={config.colors[0]} 
            />
          </ScatterChart>
        );
      
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">Tipo de gráfico não suportado</p>
          </div>
        );
    }
  };

  // Valores padrão para evitar erros
  const defaultConfig = {
    title: 'Gráfico',
    height: isModal ? 500 : 400,
    ...config
  };

  return (
    <div className={`bg-white rounded-lg shadow-md ${isModal ? 'h-full' : 'p-4'} ${containerClassName || ''}`}>
      <div className={`flex justify-between items-center ${isModal ? 'p-4 pb-2' : 'mb-4'}`}>
        <h3 className="text-lg font-semibold text-[#a243d2]">{defaultConfig.title}</h3>
        {showExport && (
          <button 
            onClick={handleExportChart}
            className="p-2 text-gray-600 hover:text-[#a243d2] rounded-full hover:bg-gray-100 transition-colors"
            title="Baixar como PNG"
          >
            <Download size={18} />
          </button>
        )}
      </div>
      <div 
        ref={chartRef}
        className={`overflow-hidden ${isModal ? 'px-4 pb-4' : ''}`}
        style={{ 
          width: '100%', 
          height: isModal ? 'calc(100% - 60px)' : `${defaultConfig.height}px`,
          minHeight: isModal ? '500px' : `${defaultConfig.height}px`
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartPreview;