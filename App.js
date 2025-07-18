import React, { useEffect, useRef, useState } from 'react';
import './App.css';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [user] = useState(() => `User${Math.floor(Math.random() * 1000)}`);
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = new WebSocket(`ws://${window.location.hostname}:4000`);

    socketRef.current.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);
      if (type === 'history') setMessages(data);
      else if (type === 'message') setMessages((prev) => [...prev, data]);
    };

    return () => socketRef.current.close();
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    const message = { type: 'message', user, text: input };
    socketRef.current.send(JSON.stringify(message));
    setInput('');
  };

  return (
    <div className="chat-container">
      <h2>React WebSocket Chat</h2>
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={msg.user === user ? 'message own' : 'message'}>
            <strong>{msg.user}</strong>: {msg.text}
            <div className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</div>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default App;

