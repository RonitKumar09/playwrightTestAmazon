// function jsonToCsv(jsonData) {
//   let arrData = jsonData;
//   let CSV = [];
//   const headers = Object.keys(arrData[0]);
//   CSV.push(headers.join(","));
//   for (const row of arrData) {
//     const values = headers.map((header) => `"${row[header]}"`);
//     CSV.push(values.join(","));
//   }
//   let link = document.createElement("a");
//   link.setAttribute("type", "hidden");
//   let fileType = "text/csv;charset=utf-8";
//   let fileExt = ".csv";
//   const blob = new Blob([CSV.join("\n")], { type: fileType });
//   const url = URL.createObjectURL(blob);
//   link.href = url;
//   document.body.appendChild(link);
//   link.setAttribute("download", "mobilePhonePrices" + fileExt);
//   link.click();
// }

const exportFromJSON = require("export-from-json");

function jsonToCsv(data) {
  const fileName = "mobilePhonePrices";
  const exportType = exportFromJSON.types.csv;
  exportFromJSON({ data, fileName, exportType });
}

module.exports = jsonToCsv;
