import React from 'react'; 
import { HistoryCard } from '../../components/HistoryCard';
import { Container, Header, Title } from './styles';

export function Resume() {
  return (
      <Container>
        <Header>
            <Title>Resumo por categoria</Title>
        </Header>

        <HistoryCard
            title="Total de receitas"
            amount="R$ 5.000,00"
            color="#12A454"
        />        
      </Container>
  );
}