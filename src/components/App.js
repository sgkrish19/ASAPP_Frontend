import React, { useState, useEffect } from 'react';
import moment from 'moment';
import io from 'socket.io-client';
import './App.css';
 
const socket = io.connect('http://54.146.255.17:4000');
 
const App = () => {
  const [dataList, setDataList] = useState([]);
 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://54.146.255.17:4000/conversations');
        const data = await response.json();
        setDataList(data);
      } catch (error) {
        console.error('Error fetching data:', error);
        showAlert('Error', 'Failed to fetch data. Please try again later.', 'error-alert');
      }
    };
 
    const showBriefDetails = (dataItem) => {
      const alertMessage = `
        <table>
          <thead>
            <tr>
              <th>Detail</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>UID</td>
              <td>${dataItem.uid}</td>
            </tr>
            <tr>
              <td>Create Time</td>
              <td>${moment(dataItem.createTime).format('YYYY-MM-DD HH:mm:ss')}</td>
            </tr>
            <tr>
              <td>Company Name</td>
              <td>${dataItem.company_Name}</td>
            </tr>
            <tr>
              <td>Item Price</td>
              <td>${dataItem.item_price}</td>
            </tr>
            <tr>
              <td>Quantity</td>
              <td>${dataItem.quantity}</td>
            </tr>
          </tbody>
        </table>
      `;
 
      showAlert('Conversation Details', alertMessage, 'custom-alert-brief', () => {
        setDataList(prevDataList => [...prevDataList, dataItem]);
      });
    };
 
    socket.on('newData', (data) => {
      showBriefDetails(data);
    });
 
    fetchData();
 
    return () => {
      socket.off('newData');
    };
  }, []);
 
  const showFullDetails = (dataItem) => {
    let parsedQuestionAnswer;
    if (typeof dataItem.question_answer === 'object') {
        parsedQuestionAnswer = dataItem.question_answer;
    } else {
        try {
            parsedQuestionAnswer = JSON.parse(dataItem.question_answer);
        } catch (error) {
            console.error('Error parsing question_answer:', error);
            // Handle the error gracefully, e.g., by displaying an error message
            showAlert('Error', 'Failed to parse question_answer data.', 'error-alert');
            return;
        }
    }
 
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
 
    showAlert('', alertMessage, 'custom-alert');
};
 
  const showAlert = (title, message, alertClass, onClose) => {
    const alertElement = document.getElementById(alertClass);
    if (!alertElement) return; // Check if the alert element exists
    alertElement.querySelector('.alert-title').innerText = title;
    alertElement.querySelector('.alert-message').innerHTML = message;
    const closeButton = alertElement.querySelector('.close-alert-btn');
    closeButton.addEventListener('click', () => {
      alertElement.style.display = 'none';
      if (onClose && typeof onClose === 'function') {
        onClose();
      }
    });
    alertElement.style.display = 'block';
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
          <span className="alert-title">Title</span>
          <span className="alert-message">Message</span>
          <button id="close-alert-full" className="close-alert-btn">Close</button>
        </div>
      </div>
      <div id="custom-alert-brief" className="custom-alert-brief">
        <div className="custom-alert-content">
          <span className="alert-title">Title</span>
          <span className="alert-message">Message</span>
          <button id="close-alert-brief" className="close-alert-btn">Close</button>
        </div>
      </div>
    </div>
  );
}
 
export default App;
