import React, { useEffect, useState } from 'react';
import { HistoryCard } from '../../components/HistoryCard';
import { Container, Header, Title, Content, ChartContainer  } from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { categories } from '../../utils/categories';
import { VictoryPie } from 'victory-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from 'styled-components'

//interface de transactions 
interface TransactionData {
  type: 'positive' | 'negative';
  name: string;
  amount: string;
  category: string;
  date: string;
}
// interface categoryData 
interface CategoryData {
  key: string;
  name: string;
  total: number;
  totalFormatted: string;
  color: string;
  percent: string;
}

export function Resume() {
  // estado 
  const [totalByCategories, setTotalByCategories] = useState<CategoryData[]>([]);
  // theme
  const theme = useTheme();

  async function loadData() {
    const dataKey = '@gofinances:transactions';
    const response = await AsyncStorage.getItem(dataKey);
    const responseFormatted = response ? JSON.parse(response) : [];

    const expensives = responseFormatted.filter((expensive: TransactionData) => expensive.type === 'negative');
    //calcular o valor total
    const expensivesTotal = expensives.reduce((accumulator: number, expensive: TransactionData) => {
      return accumulator + Number(expensive.amount);
    }, 0);

    //vetor auxilias 
    const totalByCategory: CategoryData[] = [];

    // percorre as categorias
    categories.forEach(category => {
      let categorySum = 0;
      // percorre todos os gastos 
      expensives.forEach((expensive: TransactionData) => {
        // verifica se a categoria do gasto é igual a key da categoria do outro forEach
        if (expensive.category === category.key) {
          categorySum += Number(expensive.amount);
        }
      });

      // se a categoria for maior que 0
      // adiciona o valor da categoria no vetor auxiliar
      if (categorySum > 0) {
        const totalFormatted = categorySum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        // descobrir o valor por categoria
        const percent = `${((categorySum / expensivesTotal) * 100).toFixed(0)}%`;

        totalByCategory.push({
          key: category.key,
          name: category.name,
          color: category.color,
          total: categorySum,
          totalFormatted,
          percent,
        });
      }
    });

    setTotalByCategories(totalByCategory);
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Container>
      <Header>
        <Title>Resumo por categoria</Title>
      </Header>
      <Content>
      <ChartContainer>
        <VictoryPie 
            data={totalByCategories}
            colorScale={totalByCategories.map(category => category.color)}
            style={{ labels: { fontWeight: 'bold', fontSize: RFValue(18), fill: theme.colors.shape } }}
            labelRadius={50}
            x="percent"
            y="total"
          />
      </ChartContainer>
        {
          totalByCategories.map(item => (
            <HistoryCard
              key={item.key}
              title={item.name}
              amount={item.totalFormatted}
              color={item.color}
            />
          ))
        }
      </Content>

    </Container>
  );
}