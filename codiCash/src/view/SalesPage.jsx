import React, { useEffect, useState } from "react";
import Table from "../components/Table";

const SalesPage = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    // Fetch rows
    fetch("http://localhost:3000/vendas")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        // If columns endpoint doesn't exist, infer columns from data
        if (data.length > 0 && columns.length === 0) {
          setColumns(Object.keys(data[0]));
        }
      });

    // Optionally fetch columns from endpoint if available
    fetch("http://localhost:3000/vendas/columns")
      .then((res) => res.json())
      .then((cols) => {
        if (Array.isArray(cols) && cols.length > 0) setColumns(cols);
      })
      .catch(() => {
        // Ignore if endpoint doesn't exist
      });
  }, []);

  return (
    <div className="bg-[#ffffff] h-full flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center h-auto w-100 bg-[#a243d2] rounded-lg shadow-lg">
        <Table data={data} columns={columns} />
      </div>
    </div>
  );
};

export default SalesPage;
