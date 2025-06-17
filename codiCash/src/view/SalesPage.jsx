import React, { useEffect, useState } from "react";
import Table from "../components/Table";

const SalesPage = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    // Busca todas as tabelas necessárias
    Promise.all([
      fetch("http://localhost:3001/vendas").then((res) => res.json()),
      fetch("http://localhost:3001/clientes").then((res) => res.json()),
      fetch("http://localhost:3001/cursos").then((res) => res.json()),
      fetch("http://localhost:3001/vendedores").then((res) => res.json()),
      fetch("http://localhost:3001/tiposPagamento").then((res) => res.json()),
      fetch("http://localhost:3001/status").then((res) => res.json()),
      fetch("http://localhost:3001/filiais").then((res) => res.json()),
      fetch("http://localhost:3001/modalidades").then((res) => res.json()),
    ]).then(
      ({
        0: vendas,
        1: clientes,
        2: cursos,
        3: vendedores,
        4: tiposPagamento,
        5: status,
        6: filiais,
        7: modalidades,
      }) => {
        // Monta os dados enriquecidos
        const vendasEnriquecidas = vendas.map((venda) => ({
          Data: new Date(venda.data_venda).toLocaleDateString("pt-BR"),
          Cliente:
            clientes.find((c) => c.id === venda.clienteId)?.nome ||
            venda.clienteId,
          Curso:
            cursos.find((c) => c.id === venda.cursoId)?.nome || venda.cursoId,
          Modalidade:
            modalidades.find((m) => m.id === venda.modalidadeId)?.tipo ||
            venda.modalidadeId,
          Valor: venda.valorTotal,
          Filial:
            filiais.find((f) => f.id === venda.filialId)?.nome ||
            venda.filialId,
          Vendedor:
            vendedores.find((v) => v.id === venda.vendedorId)?.nome ||
            venda.vendedorId,
          "Tipo de Pagamento":
            tiposPagamento.find((t) => t.id === venda.tipoPagamentoId)?.nome ||
            venda.tipoPagamentoId,
          Status:
            status.find((s) => s.id === venda.statusId)?.nome || venda.statusId,
        }));

        setData(vendasEnriquecidas);
        setColumns([
          "Data",
          "Cliente",
          "Curso",
          "Modalidade",
          "Valor",
          "Filial",
          "Vendedor",
          "Tipo de Pagamento",
          "Status",
        ]);
      }
    );
  }, []);

  return (
    <div className="bg-[#ffffff] h-full flex flex-col items-center justify-center">
      <div className="h-auto w-300 bg-[#a243d2] rounded-lg shadow-lg">
        <Table data={data} columns={columns} />
      </div>
    </div>
  );
};

export default SalesPage;
