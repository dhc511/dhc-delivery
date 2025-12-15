import React from "react";
import styled from "styled-components";
import { X } from "react-feather";
import classNames from "classnames";

const BackDrop = styled.div`
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);

    justify-content: center;
    align-items: center;
    display: none;
    &.visible {
        display: flex;
    }
`;

const Main = styled.div`
    min-height: 300px;
    background-color: #fff;
    display: flex;
    flex-direction: column;
`;

const Title = styled.div`
    padding: 1rem 1.5rem;
    display: flex;
    justify-content: space-between;
`;

const Body = styled.div`
    padding: 1.5rem;
    min-width: 500px;
    flex: 1;
`;

const Footer = styled.div`
    padding: 1rem 1.5rem;
    display: flex;
    justify-content: flex-end;
`;

const Modal = ({ title, visible, onCancel, onOk, children }) => {
    return (
        <BackDrop
            className={classNames({
                visible,
            })}
        >
            <Main>
                <Title>
                    <span>{title}</span>
                    <X style={{ cursor: "pointer" }} onClick={() => onCancel()} />
                </Title>
                <Body>{children}</Body>
                <Footer>
                    <button onClick={onOk}>Submit</button>
                </Footer>
            </Main>
        </BackDrop>
    );
};

export default Modal;
