import React from "react";
import styled from "styled-components";
import Row from "./Row";

const Wrapper = styled.div`
    border: 2px solid #ccc;
`;

const ListItem = ({ data, onSelect }) => {
    return (
        <Wrapper>
            {data.map((row, index) => (
                <Row item={row} key={index} onClick={() => onSelect(row)} />
            ))}
        </Wrapper>
    );
};

export default ListItem;
