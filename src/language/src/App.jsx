import { hot } from "react-hot-loader";
import React from "react";
import axios from "axios";
import styled from "styled-components";
import classNames from "classnames";
import { Plus, Upload, Download } from "react-feather";
import { useFormik } from "formik";
import { message } from "antd";

import "./App.css";
import "antd/dist/antd.css";
import ListItem from "./ListItem";
import Modal from "./Modal";
import FormGroup from "./FormGroup";
import * as xlsx from "xlsx";

const API = "http://localhost:63000/languages";
const TopBar = styled.div`
  background-color: #fafafa;
  height: 50px;
  position: fixed;
  top: 0;
  left: 0;
  right: 30px;
  width: 100%;
  display: flex;
  align-items: center;
  font-size: 22px;
  font-weight: bold;
  padding: 0 20px;
  justify-content: space-between;
  align-items: center;
`;
const Wrapper = styled.div`
  display: flex;
`;

const GroupsWrapper = styled.div`
  position: fixed;
  height: 100%;
  width: 150px;
  left: 0;
  top: 50px;
  overflow-y: auto;
  .item {
    padding: 0.5rem 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 300ms ease-in;

    &.active,
    &:hover {
      background-color: #ccc;
    }
  }
`;

const SearchInput = styled.input`
  padding: 0 10px;
  width: 600px;
`;

const TableWrapper = styled.div`
  flex: 1;
  padding-left: 160px;
  padding-top: 60px;
  padding-bottom: 300px;
`;

const Input = styled.input`
  display: block;
  padding: 5px 10px;
  width: 100%;
`;

const TextArea = styled.textarea`
  display: block;
  padding: 10px;
  width: 100%;
`;

const Error = styled.div`
  color: red;
  font-size: 12px;
`;

const App = () => {
  const [languages, setLanguages] = React.useState([]);

  const [initFormData, setInitFormData] = React.useState({});

  React.useEffect(() => {
    const obj = { key: "" };
    languages.forEach(lang => {
      obj[lang] = "";
    });
  }, [languages]);

  const [data, setData] = React.useState([]);

  const [display, setDisplay] = React.useState([]);

  const [groups, setGroups] = React.useState([]);

  const [error, setError] = React.useState(null);

  const [filter, setFilter] = React.useState(null);

  const [showForm, setShowForm] = React.useState(false);

  const [currentKey, setCurrentKey] = React.useState();

  const [search, setSearch] = React.useState(null);

  const fm = useFormik({
    onSubmit(values) {
      axios
        .post(API, values)
        .then(({ data }) => {
          setData(data.data || []);
          setGroups(data.groups || []);
          setLanguages(data.languages || []);
          message.success("Update successful");
        })
        .catch(e => alert(e.message));
    },
    initialValues: initFormData
  });

  React.useEffect(() => {
    if (filter) {
      setDisplay(data.filter(item => item.key.startsWith(filter)));
    } else {
      setDisplay(data);
    }
  }, [filter, setDisplay, data]);

  React.useEffect(() => {
    axios
      .get(API)
      .then(({ data }) => {
        setData(data.data || []);
        setGroups(data.groups || []);
        setLanguages(data.languages || []);
      })
      .catch(e => setError(e));
  }, []);

  const handleClose = () => {
    setShowForm(false);
    setCurrentKey(null);
  };

  React.useEffect(() => {
    if (fm.values.key) {
      const found = data.find(item => item.key === fm.values.key);
      if (found) {
        fm.setValues(found);
      }
    }
  }, [fm.values.key]);

  React.useEffect(() => {
    if (search) {
      setFilter(null);
      setDisplay(data.filter(item => item.key.includes(search)));
    } else {
      setDisplay(data);
    }
  }, [search]);

  const downloadHandler = () => {
    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "DELIVERY_Languages");
    xlsx.writeFile(wb, "DELIVERY_Languages.xlsx");
  };

  return (
    <React.Fragment>
      <Wrapper>
        <TopBar>
          <div>Delivery Language Tool</div>
          <SearchInput
            placeholder="Search your key"
            onChange={e => setSearch(e.target.value)}
          />
          <div>
            <Upload
              size={24}
              style={{ marginRight: "1rem", cursor: "pointer" }}
            />
            <Download
              onClick={downloadHandler}
              size={24}
              style={{ marginRight: "1rem", cursor: "pointer" }}
            />
            <Plus
              onClick={() => {
                fm.setValues(initFormData);
                setShowForm(true);
              }}
              size={24}
              style={{ marginRight: "1rem", cursor: "pointer" }}
            />
          </div>
        </TopBar>
        <GroupsWrapper>
          <div
            className={classNames({
              item: true,
              active: filter === null
            })}
            onClick={() => setFilter(null)}
          >
            All
          </div>
          {groups.map(group => (
            <div
              className={classNames({
                item: true,
                active: filter === group
              })}
              onClick={() => setFilter(group)}
              key={group}
            >
              {group}
            </div>
          ))}
        </GroupsWrapper>
        <TableWrapper>
          <ListItem
            onSelect={item => {
              fm.setValues(item);
              setShowForm(true);
            }}
            data={display}
          />
        </TableWrapper>
      </Wrapper>
      <Modal
        onOk={fm.handleSubmit}
        visible={showForm}
        onCancel={handleClose}
        title={"Add new key"}
      >
        <FormGroup>
          <label>Key</label>
          <Input name="key" onChange={fm.handleChange} value={fm.values.key} />
          {fm.errors.key && <Error>{fm.errors.key}</Error>}
        </FormGroup>
        {languages.map(lang => (
          <FormGroup key={lang}>
            <label>{lang}</label>
            <TextArea
              name={lang}
              value={fm.values[lang]}
              onChange={fm.handleChange}
            />
            {fm.errors[lang] && <Error>{fm.errors[lang]}</Error>}
          </FormGroup>
        ))}
      </Modal>
    </React.Fragment>
  );
};

export default hot(module)(App);
