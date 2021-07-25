import React, { useState } from 'react';
import { Keyboard, Modal, TouchableWithoutFeedback, Alert } from 'react-native';
import { Button } from '../../components/Form/Button';
import { CategorySelectButton } from '../../components/Form/CategorySelectButton';
import { TransactionTypeButton } from '../../components/Form/TransactionTypeButton';
import { CategorySelect } from '../CategorySelect';
import { InputForm } from '../../components/Form/InputForm';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import uuid from 'react-native-uuid';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
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
    const { control, handleSubmit, reset, formState: { errors } } = useForm({ resolver: yupResolver(schema) });
    const navigation = useNavigation();

    function handleTransactionsTypeSelect(type: 'positive' | 'negative') {
        setTransactionType(type);
    }

    function handleCloseSelectCategoryModal() {
        setCategoryModalOpen(false);
    }

    function handleOpenSelectCategoryModal() {
        setCategoryModalOpen(true);
    }

    async function handleRegister(form: FormData) {
        if (!transactionType) return Alert.alert('Selecione o tipo da transação', 'warning');

        if (category.key === 'category') return Alert.alert('Selecione a categoria', 'warning');

        const newTransaction = {
            id: String(uuid.v4()),
            name: form.name,
            amount: form.amount,
            type: transactionType,
            category: category.key,
            date: new Date(),
        };

        try {
            const dataKey = '@gofinances:transactions';
            const data = await AsyncStorage.getItem(dataKey);
            const currentData = data ? JSON.parse(data) : [];
            const dataFormatted = [
                ...currentData,
                newTransaction
            ]
            await AsyncStorage.setItem(dataKey, JSON.stringify(dataFormatted));

            reset();
            setTransactionType('');
            setCategory({
                key: 'category',
                name: 'Categoria',
            });
            navigation.navigate('Listagem');

        } catch (error) {
            console.log(error);
            Alert.alert('Erro ao cadastrar');
        }
    }

    // useEffect(() => {
    //     async function loadData() {
    //         const data = await AsyncStorage.getItem(dataKey);
    //         console.log(JSON.parse(data!));
    //     }
    //     loadData();

    //     // async function deleteData() {
    //     //     await AsyncStorage.removeItem(dataKey);
    //     // }
    //     // deleteData();
    // }, []);

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                                onPress={() => handleTransactionsTypeSelect('positive')}
                                isActive={transactionType === 'positive'}
                            />
                            <TransactionTypeButton
                                type="down"
                                title="Outcome"
                                onPress={() => handleTransactionsTypeSelect('negative')}
                                isActive={transactionType === 'negative'}
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


