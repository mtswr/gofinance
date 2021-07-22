import React, { useState } from 'react';
import { Keyboard, Modal, TouchableWithoutFeedback, Alert } from 'react-native';
import { Button } from '../../components/Form/Button';
import { CategorySelectButton } from '../../components/Form/CategorySelectButton';
import { TransactionTypeButton } from '../../components/Form/TransactionTypeButton';
import { CategorySelect } from '../CategorySelect';
import { InputForm } from '../../components/Form/InputForm';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import {
    Container,
    Header,
    Title,
    Form,
    Fields,
    TransactionsTypes,
} from './styles';

interface FormData {
    name: string;
    amount: string;
}

const schema = Yup.object().shape({
    name: Yup.string()
        .required('Name is required'),
    amount: Yup.number()
        .typeError('Informe um valor numérico')
        .positive('O valor não pode ser negativo')
        // .required('O valor é obrigatório'),
})

export function Register() {
    const [category, setCategory] = useState({
        key: 'category',
        name: 'Categoria',
    });
    const [transactionType, setTransactionType] = useState('');
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);

    const { control, handleSubmit, formState: { errors }} = useForm({ resolver: yupResolver(schema)});

    function handleTransactionsTypeSelect(type: 'up' | 'down') {
        setTransactionType(type);
    }

    function handleCloseSelectCategoryModal() {
        setCategoryModalOpen(false);
    }

    function handleOpenSelectCategoryModal() {
        setCategoryModalOpen(true);
    }

    function handleRegister(form: FormData) {
        if (!transactionType) return Alert.alert('Selecione o tipo da transação', 'warning');

        if(category.key === 'category') return Alert.alert('Selecione a categoria', 'warning');

        const data = {
            name: form.name,
            amount: form.amount,
            transactionType,
            category: category.key,
        };

        console.log(data);
    }

    return (
        <TouchableWithoutFeedback onPress={ Keyboard.dismiss }>
            <Container>
                <Header>
                    <Title>Cadastro</Title>
                </Header>
                <Form>
                    <Fields>
                        <InputForm
                            name="name"
                            control={control}
                            placeholder="Nome"
                            autoCapitalize="sentences"
                            autoCorrect={false}
                            error={errors.name && errors.name.message}
                        />
                        <InputForm
                            name="amount"
                            control={control}
                            placeholder="Preço"
                            keyboardType="numeric"
                            error={errors.amount && errors.amount.message}
                        />
                        <TransactionsTypes>
                            <TransactionTypeButton
                                type="up"
                                title="Income"
                                onPress={() => handleTransactionsTypeSelect('up')}
                                isActive={transactionType === 'up'}
                            />
                            <TransactionTypeButton
                                type="down"
                                title="Outcome"
                                onPress={() => handleTransactionsTypeSelect('down')}
                                isActive={transactionType === 'down'}
                            />
                        </TransactionsTypes>

                        <CategorySelectButton
                            title={category.name}
                            onPress={handleOpenSelectCategoryModal}
                        />
                    </Fields>
                    <Button title="Enviar" onPress={handleSubmit(handleRegister)} />
                </Form>

                <Modal visible={categoryModalOpen}>
                    <CategorySelect
                        category={category}
                        setCategory={setCategory}
                        closeSelectCategory={handleCloseSelectCategoryModal}
                    />
                </Modal>

            </Container>
        </TouchableWithoutFeedback>
    );
}