import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart } from 'chart.js';
import {  registerables } from 'chart.js';
Chart.register(...registerables);

function Home() {
  const [products, setProducts] = useState<{
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
    }[];
  }>({ labels: [], datasets: [] });

  useEffect(() => {
    fetch('http://localhost:3001/products')
    .then(response => response.json())
    .then((data: { date: string; product1: number; product2: number }[]) => {
      // Фильтрация записей с отсутствующей датой или нулевыми значениями продукции
      const filteredData = data.filter(
        (item: { date: string; product1: number; product2: number }) =>
          item.date && item.product1 && item.product2
      );

      const monthlyData: { [month: string]: { product1: number; product2: number } } = {};

      filteredData.forEach((item: { date: string; product1: number; product2: number }) => {
        const date = new Date(item.date);
        const month = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
        if (!monthlyData[month]) {
          monthlyData[month] = { product1: 0, product2: 0 };
        }
      
        monthlyData[month].product1 += item.product1;
        monthlyData[month].product2 += item.product2;
      });
      
      const russianMonths = [
        "янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек",
      ];
      
      const labels = Object.keys(monthlyData).map((month) => {
        const [monthNum] = month.split("/");
        const monthIndex = parseInt(monthNum, 10) - 1;
        const monthLabel = russianMonths[monthIndex] || "неизвестно";
        return `${monthLabel}`;
      });
      console.log(monthlyData)
      const dataA = filteredData.map((item) => {
        if (item.product1 !== null) {
          return item.product1;
        }
        return 0; 
      });
      const dataB = filteredData.map((item) => {
        if (item.product2 !== null) {
          return item.product2;
        }
        return 0; 
      });

        const chartData = {
          labels: labels,
          datasets: [
            {
              label: 'Фабрика А',
              data: dataA,
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
            {
              label: 'Фабрика Б',
              data: dataB,
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            },
          ],
        };

        setProducts(chartData);
      })
      .catch(error => console.error(error));
  }, []);  


  return (
    <div>
      <h1>Столбчатая диаграмма</h1>
      <Bar
        data={products}
        
        options={{
          scales: {
            y: {
              beginAtZero: true
            }
          },
          onClick: (event, elements) => {
            if (elements.length > 0) {
              const clickedElement = elements[0];
              const datasetIndex = clickedElement.datasetIndex;
              const index = clickedElement.index;
              const factoryId = datasetIndex + 1;
              const monthNumber = index + 1;
              const url = `/details/${factoryId}/${monthNumber}`;
              window.location.href = url;
            }}
        }}
      />
    </div>
  );
}

export default Home;