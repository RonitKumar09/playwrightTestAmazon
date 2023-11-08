const ExcelJS = require("exceljs");

async function jsonToCsv(data, name) {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet("sheet", {
    showGridLines: false,
    properties: { tabColor: { argb: "FF00FF00" } },
  });

  // add a table to a sheet
  ws.addTable({
    name: "ProductPriceList",
    displayName: "ProductPriceList",
    ref: "A1",
    headerRow: true,
    style: {
      theme: "TableStyleDark3",
      showRowStripes: true,
      showGridLines: false,
    },

    columns: [{ name: "Product Name" }, { name: "Product Price" }],

    rows: data,
  });

  ws.columns.forEach(function (column) {
    let maxLength = 0;
    column.eachCell({ includeEmpty: true }, function (cell) {
      let columnLength = cell.value ? cell.value.toString().length : 10;
      if (columnLength > maxLength) {
        maxLength = columnLength;
      }
    });
    column.width = maxLength < 10 ? 10 : maxLength;
  });

  await workbook.xlsx.writeFile(`${name}.xlsx`);
}

module.exports = jsonToCsv;
