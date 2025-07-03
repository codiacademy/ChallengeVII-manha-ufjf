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
                      ? "px-2 py-1 rounded-full border border-[#a243d2] text-[#a243d2] font-semibold bg-white"
                      : "px-2 py-1 rounded-full border border-black text-white bg-black font-semibold"
                    : column === "Pagamento"
                    ? row[column] === "PIX"
                      ? "px-2 py-1 rounded-full bg-emerald-500 text-white font-semibold"
                      : "px-2 py-1 rounded-full bg-blue-700 text-white font-semibold"
                    : column === "Status"
                    ? row[column] === "Pago"
                      ? "px-2 py-1 rounded-full bg-emerald-500 text-white font-semibold"
                      : row[column] === "Pendente"
                      ? "px-2 py-1 rounded-full bg-orange-400 text-white font-semibold"
                      : "px-2 py-1 rounded-full bg-gray-400 text-white font-semibold"
                    : "text-center"
                }
              >
                {row[column]}
              </td>
            ))}
            {renderActions && <td>{renderActions(row)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
