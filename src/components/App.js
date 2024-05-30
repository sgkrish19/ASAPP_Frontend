import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';
import moment from 'moment';

const socket = io.connect('http://localhost:4000'); // Connect to the WebSocket server

function App() {
  const [dataList, setDataList] = useState([]);

  useEffect(() => {
    // Subscribe to 'newData' event from the WebSocket server
    socket.on('newData', (data) => {
      setDataList(prevDataList => [...prevDataList, data]);
      showBriefDetails(data);
    });

    // Fetch initial data from backend when component mounts
    fetchData(); // Fetch initial data here

    // Clean up function
    return () => {
      // Unsubscribe from WebSocket events
      socket.off('newData');
    };
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:4000/conversations');
      const data = await response.json();
      setDataList(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const showBriefDetails = (dataItem) => {
    const alertMessage = `
      Conversation Details:
      UID: ${dataItem.uid}
      Create Time:  ${moment(dataItem.createTime).format('YYYY-MM-DD HH:mm:ss')}
      Company Name: ${dataItem.company_Name}
      Item Price: ${dataItem.item_price}
      Quantity: ${dataItem.quantity}
    `;
    window.alert(alertMessage);
  };

  const showFullDetails = (dataItem) => {
    const parsedQuestionAnswer = JSON.parse(dataItem.question_answer);
  
    const answerList = parsedQuestionAnswer.map(item => (
      `<tr>
        <td>${item.Q}</td>
        <td>${item.A}</td>
      </tr>`
    )).join('');
  
    const alertMessage = `
      <table>
        <thead>
          <tr>
            <th>Pub Time</th>
            <th>IP Address</th>
            <th>Host Name</th>
            <th>Free Text Summary</th>
            <th colspan="2">Question Answer</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${moment(dataItem.pubTime).format('YYYY-MM-DD HH:mm:ss')}</td>
            <td>${dataItem.ip_address}</td>
            <td>${dataItem.host_name}</td>
            <td>${dataItem.freeText_summary}</td>
            <td colspan="2">
              <table>
                <thead>
                  <tr>
                    <th>Q</th>
                    <th>A</th>
                  </tr>
                </thead>
                <tbody>
                  ${answerList}
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    `;
  
    showAlert('', alertMessage);
  };
  

  const showAlert = (title, message) => {
    document.getElementById('alert-title').innerText = title;
    document.getElementById('alert-message').innerHTML = message;
    const closeButton = document.getElementById('close-alert');
    closeButton.addEventListener('click', () => {
      document.getElementById('custom-alert').style.display = 'none';
    });
    document.getElementById('custom-alert').style.display = 'block';
  };
  

  return (
    <div className="container">
      <center><h1>Summary List</h1></center>
      <div>
        <table className="data-table">
          <thead>
            <tr>
              <th>UID</th>
              <th>Create Time</th>
              <th>Company Name</th>
              <th>Item Price</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {dataList.map((dataItem, index) => (
              <tr key={index}>
                <td onClick={() => showFullDetails(dataItem)}>{dataItem.uid}</td>
                <td>{moment(dataItem.createTime).format('YYYY-MM-DD HH:mm:ss')}</td>
                <td>{dataItem.company_Name}</td>
                <td>{dataItem.item_price}</td>
                <td>{dataItem.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div id="custom-alert" className="custom-alert">
        <div className="custom-alert-content">
          <span id="alert-title" className="alert-title">Title</span>
          <span id="alert-message" className="alert-message">Message</span>
          <button id="close-alert" className="close-alert-btn">Close</button>
        </div>
      </div>
    </div>
  );
}

export default App;
