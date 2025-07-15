const Table = ({ data, columns, renderActions }) => {
  return (
    <table className="w-full text-center text-[#a243d2]">
      <thead>
        <tr>
          {columns.map((column, index) => (
            <th key={index}>{column}</th>
          ))}
          {renderActions && <th>Ações</th>}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map((column, colIndex) => (
              <td
                key={colIndex}
                className={
                  column === "Modalidade"
                    ? row[column] === "Presencial"
                       ? "px-1.5 py-0.5 rounded-full bg-[#a243d2] text-white font-semibold text-sm"
                       : "px-1.5 py-0.5 rounded-full bg-emerald-600 text-white font-semibold text-sm"
                    : column === "Pagamento"
                    ? row[column] === "PIX"
                       ? "px-1.5 py-0.5 rounded-full bg-emerald-500 text-white font-semibold text-sm"
                       : "px-1.5 py-0.5 rounded-full bg-blue-700 text-white font-semibold text-sm"
                    : column === "Status"
                    ? row[column] === "Pago"
                       ? "px-1.5 py-0.5 rounded-full bg-emerald-500 text-white font-semibold text-sm"
                       : row[column] === "Pendente"
                       ? "px-1.5 py-0.5 rounded-full bg-orange-400 text-white font-semibold text-sm"
                       : "px-1.5 py-0.5 rounded-full bg-gray-400 text-white font-semibold text-sm"
                    : "text-center"
                }
              >
                {row[column]}
              </td>
            ))}
                {renderActions && <td className="px-4 py-2 text-center align-middle" style={{ minWidth: 160 }}>{renderActions(row)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
