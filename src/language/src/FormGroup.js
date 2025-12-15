import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
    margin-bottom: 15px;
`;

const FormGroup = ({ children, ...props }) => {
    return <Wrapper {...props}>{children}</Wrapper>;
};

export default FormGroup;
