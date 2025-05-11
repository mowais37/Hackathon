// src/components/tools/ToolForm.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ToolContext from '../../context/tool/toolContext';
import { validateToolForm } from '../../utils/validateForm';

const ToolForm = () => {
  const toolContext = useContext(ToolContext);
  const { addTool, updateTool, current, clearCurrent, getToolTypes, toolTypes } = toolContext;

  const navigate = useNavigate();

  const [tool, setTool] = useState({
    name: '',
    type: 'custom',
    description: '',
    endpoint: '',
    method: 'GET',
    headers: {},
    parameters: [],
    auth: {
      type: 'none',
      token: '',
      username: '',
      password: ''
    }
  });

  const [formErrors, setFormErrors] = useState({});
  const [customHeaders, setCustomHeaders] = useState([{ key: '', value: '' }]);
  const [customParams, setCustomParams] = useState([{ name: '', description: '', required: false, type: 'string' }]);

  useEffect(() => {
    getToolTypes();
    
    if (current !== null) {
      setTool(current);
      
      // Set custom headers
      if (current.headers && Object.keys(current.headers).length > 0) {
        const headerArray = Object.entries(current.headers).map(([key, value]) => ({ key, value }));
        setCustomHeaders(headerArray.length > 0 ? headerArray : [{ key: '', value: '' }]);
      }
      
      // Set custom parameters
      if (current.parameters && current.parameters.length > 0) {
        setCustomParams(current.parameters);
      }
    } else {
      setTool({
        name: '',
        type: 'custom',
        description: '',
        endpoint: '',
        method: 'GET',
        headers: {},
        parameters: [],
        auth: {
          type: 'none',
          token: '',
          username: '',
          password: ''
        }
      });
      setCustomHeaders([{ key: '', value: '' }]);
      setCustomParams([{ name: '', description: '', required: false, type: 'string' }]);
    }
  }, [current, getToolTypes]);

  const { 
    name, 
    type, 
    description, 
    endpoint, 
    method, 
    auth
  } = tool;

  const onChange = e => {
    const { name, value } = e.target;
    
    setTool({
      ...tool,
      [name]: value
    });
    
    // Clear form error when field is being edited
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  const onAuthChange = e => {
    const { name, value } = e.target;
    
    setTool({
      ...tool,
      auth: {
        ...auth,
        [name]: value
      }
    });
  };

  const onHeaderChange = (index, field, value) => {
    const updatedHeaders = [...customHeaders];
    updatedHeaders[index][field] = value;
    setCustomHeaders(updatedHeaders);
    
    // Update tool headers object
    const headersObj = {};
    updatedHeaders.forEach(header => {
      if (header.key.trim()) {
        headersObj[header.key] = header.value;
      }
    });
    
    setTool({
      ...tool,
      headers: headersObj
    });
  };

  const addHeaderRow = () => {
    setCustomHeaders([...customHeaders, { key: '', value: '' }]);
  };

  const removeHeaderRow = index => {
    if (customHeaders.length === 1) return;
    
    const updatedHeaders = [...customHeaders];
    updatedHeaders.splice(index, 1);
    setCustomHeaders(updatedHeaders);
    
    // Update tool headers object
    const headersObj = {};
    updatedHeaders.forEach(header => {
      if (header.key.trim()) {
        headersObj[header.key] = header.value;
      }
    });
    
    setTool({
      ...tool,
      headers: headersObj
    });
  };

  const onParamChange = (index, field, value) => {
    const updatedParams = [...customParams];
    
    if (field === 'required') {
      updatedParams[index][field] = value === 'true' || value === true;
    } else {
      updatedParams[index][field] = value;
    }
    
    setCustomParams(updatedParams);
    
    // Update tool parameters array
    setTool({
      ...tool,
      parameters: updatedParams
    });
  };

  const addParamRow = () => {
    setCustomParams([...customParams, { name: '', description: '', required: false, type: 'string' }]);
  };

  const removeParamRow = index => {
    if (customParams.length === 1) return;
    
    const updatedParams = [...customParams];
    updatedParams.splice(index, 1);
    setCustomParams(updatedParams);
    
    // Update tool parameters array
    setTool({
      ...tool,
      parameters: updatedParams
    });
  };

  const onSubmit = e => {
    e.preventDefault();
    
    const errors = validateToolForm(tool);
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    if (current === null) {
      addTool(tool);
    } else {
      updateTool(tool);
    }
    
    clearAll();
    navigate('/tools');
  };

  const clearAll = () => {
    clearCurrent();
  };

  return (
    <div className="tool-form-container">
      <h2>{current ? 'Edit Tool' : 'Register Tool'}</h2>
      <form onSubmit={onSubmit}>
        <div className="form-grid">
          <div className="form-column">
            <div className="form-section">
              <h3>Basic Information</h3>
              
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  placeholder="Tool Name"
                  name="name"
                  value={name}
                  onChange={onChange}
                  className={formErrors.name ? 'error' : ''}
                />
                {formErrors.name && <p className="error-text">{formErrors.name}</p>}
              </div>
              
              <div className="form-group">
                <label htmlFor="type">Type</label>
                <select
                  name="type"
                  value={type}
                  onChange={onChange}
                >
                  {toolTypes.map(type => (
                    <option key={type} value={type.toLowerCase()}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  placeholder="Tool Description"
                  name="description"
                  value={description}
                  onChange={onChange}
                  className={formErrors.description ? 'error' : ''}
                ></textarea>
                {formErrors.description && <p className="error-text">{formErrors.description}</p>}
              </div>
            </div>
            
            <div className="form-section">
              <h3>Endpoint Configuration</h3>
              
              <div className="form-group">
                <label htmlFor="endpoint">Endpoint URL</label>
                <input
                  type="text"
                  placeholder="https://api.example.com/v1/data"
                  name="endpoint"
                  value={endpoint}
                  onChange={onChange}
                  className={formErrors.endpoint ? 'error' : ''}
                />
                {formErrors.endpoint && <p className="error-text">{formErrors.endpoint}</p>}
              </div>
              
              <div className="form-group">
                <label htmlFor="method">HTTP Method</label>
                <select
                  name="method"
                  value={method}
                  onChange={onChange}
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="authType">Authentication</label>
                <select
                  name="type"
                  value={auth.type}
                  onChange={onAuthChange}
                >
                  <option value="none">None</option>
                  <option value="basic">Basic Auth</option>
                  <option value="bearer">Bearer Token</option>
                  <option value="apiKey">API Key</option>
                </select>
              </div>
              
              {auth.type === 'basic' && (
                <>
                  <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                      type="text"
                      placeholder="Username"
                      name="username"
                      value={auth.username || ''}
                      onChange={onAuthChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      placeholder="Password"
                      name="password"
                      value={auth.password || ''}
                      onChange={onAuthChange}
                    />
                  </div>
                </>
              )}
              
              {auth.type === 'bearer' && (
                <div className="form-group">
                  <label htmlFor="token">Bearer Token</label>
                  <input
                    type="password"
                    placeholder="Token"
                    name="token"
                    value={auth.token || ''}
                    onChange={onAuthChange}
                  />
                </div>
              )}
              
              {auth.type === 'apiKey' && (
                <div className="form-group">
                  <label htmlFor="token">API Key</label>
                  <input
                    type="password"
                    placeholder="API Key"
                    name="token"
                    value={auth.token || ''}
                    onChange={onAuthChange}
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="form-column">
            <div className="form-section">
              <h3>Headers</h3>
              <div className="table-container">
                <table className="form-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Value</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customHeaders.map((header, index) => (
                      <tr key={index}>
                        <td>
                          <input
                            type="text"
                            placeholder="Header Name"
                            value={header.key}
                            onChange={e => onHeaderChange(index, 'key', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            placeholder="Header Value"
                            value={header.value}
                            onChange={e => onHeaderChange(index, 'value', e.target.value)}
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-icon"
                            onClick={() => removeHeaderRow(index)}
                            disabled={customHeaders.length <= 1}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary add-row-btn"
                  onClick={addHeaderRow}
                >
                  <i className="fas fa-plus"></i> Add Header
                </button>
              </div>
            </div>
            
            <div className="form-section">
              <h3>Parameters</h3>
              <div className="table-container">
                <table className="form-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Type</th>
                      <th>Required</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customParams.map((param, index) => (
                      <tr key={index}>
                        <td>
                          <input
                            type="text"
                            placeholder="Parameter Name"
                            value={param.name}
                            onChange={e => onParamChange(index, 'name', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            placeholder="Description"
                            value={param.description}
                            onChange={e => onParamChange(index, 'description', e.target.value)}
                          />
                        </td>
                        <td>
                          <select
                            value={param.type}
                            onChange={e => onParamChange(index, 'type', e.target.value)}
                          >
                            <option value="string">String</option>
                            <option value="number">Number</option>
                            <option value="boolean">Boolean</option>
                            <option value="object">Object</option>
                            <option value="array">Array</option>
                          </select>
                        </td>
                        <td className="checkbox-cell">
                          <input
                            type="checkbox"
                            checked={param.required}
                            onChange={e => onParamChange(index, 'required', e.target.checked)}
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-icon"
                            onClick={() => removeParamRow(index)}
                            disabled={customParams.length <= 1}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary add-row-btn"
                  onClick={addParamRow}
                >
                  <i className="fas fa-plus"></i> Add Parameter
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={clearAll}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {current ? 'Update Tool' : 'Register Tool'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ToolForm;
