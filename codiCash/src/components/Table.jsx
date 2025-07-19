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
            {columns.map((column, colIndex) => {
              const baseClasses = "inline-block px-2 py-[1px] rounded-full text-white font-semibold text-sm leading-tight"; // <- aqui está o segredo
              let cellClass = "text-center";

              if (column === "Modalidade") {
                cellClass =
                  row[column] === "Presencial"
                    ? `${baseClasses} bg-[#a243d2]`
                    : `${baseClasses} bg-emerald-600`;
              } else if (column === "Pagamento") {
                cellClass =
                  row[column] === "PIX"
                    ? `${baseClasses} bg-emerald-500`
                    : `${baseClasses} bg-blue-700`;
              } else if (column === "Status") {
                cellClass =
                  row[column] === "Pago"
                    ? `${baseClasses} bg-emerald-500`
                    : row[column] === "Pendente"
                    ? `${baseClasses} bg-orange-400`
                    : `${baseClasses} bg-gray-400`;
              }

              return (
                <td key={colIndex}>
                  <span className={cellClass}>{row[column]}</span>
                </td>
              );
            })}
            {renderActions && (
              <td
                className="px-4 py-2 text-center align-middle"
                style={{ minWidth: 160 }}
              >
                {renderActions(row)}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
