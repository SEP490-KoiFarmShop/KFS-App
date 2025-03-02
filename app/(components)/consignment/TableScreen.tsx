import React, { useState } from "react";
import { DataTable } from "react-native-paper";
import { View, Text } from "react-native";

const TableExample = () => {
  const [sortBy, setSortBy] = useState("amount");
  const [sortAscending, setSortAscending] = useState(true);

  const data = [
    { consignment: "Kohaku - Online", amount: 85000, status: "Finish" },
    { consignment: "Tancho - Offline", amount: 80000, status: "Finish" },
    { consignment: "Kohaku - Online", amount: 75000, status: "Staff Approve" },
    { consignment: "Tancho - Offline", amount: 70000, status: "Pending" },
    { consignment: "Kohaku - Online", amount: 65000, status: "Fail" },
    { consignment: "Tancho - Online", amount: 60000, status: "Fail" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Finish":
        return "green";
      case "Staff Approve":
        return "orange";
      case "Pending":
        return "gold";
      case "Fail":
        return "red";
      default:
        return "black";
    }
  };

  // Function sắp xếp theo status hoặc amount
  const sortedData = [...data].sort((a, b) => {
    if (sortBy === "amount") {
      return sortAscending ? a.amount - b.amount : b.amount - a.amount;
    } else {
      return sortAscending
        ? a.status.localeCompare(b.status)
        : b.status.localeCompare(a.status);
    }
  });

  return (
    <View>
      <DataTable>
        <DataTable.Header>
          <DataTable.Title>Consignment</DataTable.Title>

          <DataTable.Title
            onPress={() => {
              setSortBy("amount");
              setSortAscending(!sortAscending);
            }}
          >
            Amount {sortBy === "amount" ? (sortAscending ? "↑" : "↓") : ""}
          </DataTable.Title>

          <DataTable.Title
            onPress={() => {
              setSortBy("status");
              setSortAscending(!sortAscending);
            }}
          >
            Status {sortBy === "status" ? (sortAscending ? "↑" : "↓") : ""}
          </DataTable.Title>
        </DataTable.Header>

        {sortedData.map((row, index) => (
          <DataTable.Row key={index}>
            <DataTable.Cell>{row.consignment}</DataTable.Cell>
            <DataTable.Cell>${row.amount.toLocaleString()}</DataTable.Cell>
            <DataTable.Cell>
              <Text style={{ color: getStatusColor(row.status) }}>
                {row.status}
              </Text>
            </DataTable.Cell>
          </DataTable.Row>
        ))}
      </DataTable>
    </View>
  );
};

export default TableExample;
