import styled from 'styled-components';
import { shade } from 'polished';

export const Header = styled.div`
  position: absolute;
  top: 0;
  width: 100%;
  height: 144px;
  background-color: #28262e;

  display: flex;
  flex-direction: column;
  align-items: center;

  > a {
    color: #999591;
    text-decoration: none;
    margin: 70px 1000px 0 0;
    transition: color 0.2s;

    svg {
      margin-right: 16px;
    }

    &:hover {
      color: ${shade(0.2, '#999591')};
    }
  }
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 48px auto;

  place-content: center;

  width: 100%;
  max-width: 700px;

  h1 {
    text-align: left;
    font-size: 24px;
    font-weight: 400px;
  }

  form {
    margin: 80px 0;
    width: 340px;
    text-align: center;

    h1 {
      margin-bottom: 24px;
    }

    a {
      color: #f4ede8;
      text-decoration: none;
      margin-top: 24px;
      transition: color 0.2s;

      display: block;

      &:hover {
        color: ${shade(0.2, '#f4ede8')};
      }
    }
  }
`;

export const AvatarInput = styled.div`
  position: relative;

  img {
    width: 180px;
    height: 180px;
    border-radius: 50%;
  }

  label {
    position: absolute;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: none;
    background: #ff9000;
    right: 0;
    bottom: 0;
    transition: background-color 0.2s;
    cursor: pointer;

    &:hover {
      background: ${shade(0.2, '#ff9000')};
    }

    input {
      display: none;
    }
  }

  svg {
    width: 20px;
    height: 20px;
    color: #312e38;
    margin-top: 14px;
    margin-left: 14px;
  }
`;

export const Password = styled.div`
  padding-top: 20px;
`;
