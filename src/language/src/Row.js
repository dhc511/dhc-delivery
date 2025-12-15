import React from "react";
import styled, { css } from "styled-components";

const Wrapper = styled.div`
    &:hover {
        background-color: #f2f2f2;
    }
    transition: all 300ms ease-in;
    display: flex;
    .item {
        ${(props) => css`
            width: calc(100% / ${props.width});
        `}
        padding: 8px 12px;
        border-bottom: 1px solid #ccc;
    }
`;

const Row = ({ item, ...props }) => {
    return (
        <Wrapper width={Object.keys(item).length} {...props}>
            {Object.keys(item).map((key) => {
                return (
                    <div key={key} className="item">
                        {item[key]}
                    </div>
                );
            })}
        </Wrapper>
    );
};

export default Row;
