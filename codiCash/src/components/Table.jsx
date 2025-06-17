const Table = ({ data, columns }) => {
  return (
    <table className="w-full">
      <thead>
        <tr>
          {columns.map((column, index) => (
            <th key={index} className="text-center">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map((column, colIndex) => (
              <td key={colIndex} className="text-center">
                {row[column]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
