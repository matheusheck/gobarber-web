import React, { useCallback, useRef, ChangeEvent } from 'react';
import { FiArrowLeft, FiMail, FiLock, FiUser, FiCamera } from 'react-icons/fi';
import { Form } from '@unform/web';
import { FormHandles } from '@unform/core';
import * as yup from 'yup';
import { Link, useHistory } from 'react-router-dom';
import getValidationErrors from '../../utils/getValidationErrors';

import api from '../../services/api';
import { useToast } from '../../hooks/Toast';
import { useAuth } from '../../hooks/Auth';
import Input from '../../components/Input';
import Button from '../../components/Button';

import { Header, AvatarInput, Content, Password } from './styles';

interface ProfileFormData {
  name: string;
  email: string;
  old_password: string;
  password: string;
  password_confirmation: string;
}

const Profile: React.FC = () => {
  const formRef = useRef<FormHandles>(null);
  const { addToast } = useToast();
  const { user, updateUser } = useAuth();
  const history = useHistory();

  const handleAvatarInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const data = new FormData();

        data.append('avatar', e.target.files[0]);

        api.patch('/users/avatar', data).then(response => {
          updateUser(response.data);

          addToast({
            type: 'success',
            title: 'Avatar atualizado!',
          });
        });
      }
    },
    [addToast, updateUser],
  );

  const handleSubmit = useCallback(
    async (data: ProfileFormData) => {
      try {
        formRef.current?.setErrors({});

        const schema = yup.object().shape({
          name: yup.string().required('Nome obrigatório'),
          email: yup
            .string()
            .required('E-mail obrigatório')
            .email('Digite um e-mail válido'),
          old_password: yup.string(),
          password: yup.string().when('old_password', {
            is: val => !!val.length,
            then: yup.string().required('Campo obrigatório'),
            otherwise: yup.string(),
          }),
          password_confirmation: yup
            .string()
            .when('old_password', {
              is: val => !!val.length,
              then: yup.string().required('Campo obrigatório'),
              otherwise: yup.string(),
            })
            .oneOf([yup.ref('password')], 'Confirmação incorreta'),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        const {
          name,
          email,
          old_password,
          password,
          password_confirmation,
        } = data;

        const formData = {
          name,
          email,
          ...(old_password
            ? {
                old_password,
                password,
                password_confirmation,
              }
            : {}),
        };

        const response = await api.put('/profile', formData);

        updateUser(response.data);

        history.push('/dashboard');

        addToast({
          type: 'success',
          title: 'Sucesso na alteração!',
          description: 'Você já pode conferir seus dados!',
        });
      } catch (err) {
        if (err instanceof yup.ValidationError) {
          const errors = getValidationErrors(err);

          formRef.current?.setErrors(errors);

          return;
        }

        addToast({
          type: 'error',
          title: 'Erro na atualização',
          description: 'Houve um erro. Tente novamente.',
        });
      }
    },
    [addToast, history, updateUser],
  );

  return (
    <>
      <Header>
        <Link to="/">
          <FiArrowLeft size={22} />
        </Link>
      </Header>
      <Content>
        <AvatarInput>
          <img src={user.avatar_url} alt={user.name} />
          <label htmlFor="avatar">
            <FiCamera />
            <input type="file" id="avatar" onChange={handleAvatarInput} />
          </label>
        </AvatarInput>
        <Form
          ref={formRef}
          onSubmit={handleSubmit}
          initialData={{ name: user.name, email: user.email }}
        >
          <h1>Meu Perfil</h1>
          <Input icon={FiUser} name="name" placeholder="Nome" />
          <Input icon={FiMail} name="email" placeholder="E-mail" />
          <Password>
            <Input
              icon={FiLock}
              name="old_password"
              type="password"
              placeholder="Senha antiga"
            />
            <Input
              icon={FiLock}
              name="password"
              type="password"
              placeholder="Senha nova"
            />
            <Input
              icon={FiLock}
              name="password_confirmation"
              type="password"
              placeholder="Confirme a senha"
            />
          </Password>
          <Button type="submit">Salvar alterações</Button>
        </Form>
      </Content>
    </>
  );
};

export default Profile;
