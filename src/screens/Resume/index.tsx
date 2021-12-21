import React, { useEffect, useState } from 'react';
import { HistoryCard } from '../../components/HistoryCard';
import { Container, Header, Title, Content  } from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { categories } from '../../utils/categories';

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
  total: string;
  color: string;
}

export function Resume() {
  // estado 
  const [totalByCategories, setTotalByCategories] = useState<CategoryData[]>([]);

  async function loadData() {
    const dataKey = '@gofinances:transactions';
    const response = await AsyncStorage.getItem(dataKey);
    const responseFormatted = response ? JSON.parse(response) : [];

    const expensives = responseFormatted.filter((expensive: TransactionData) => expensive.type === 'negative');

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
        const total = categorySum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        totalByCategory.push({
          key: category.key,
          name: category.name,
          color: category.color,
          total,
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
        {
          totalByCategories.map(item => (
            <HistoryCard
              key={item.key}
              title={item.name}
              amount={item.total}
              color={item.color}
            />
          ))
        }
      </Content>

    </Container>
  );
}